"""
Core asynchronous TCP Port Scanner engine.
"""

import asyncio
from dataclasses import dataclass
from enum import Enum
import socket
import time
from typing import Callable, List, Optional, Sequence

from services import get_service_name


class PortState(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    FILTERED = "FILTERED"


@dataclass
class ScanResult:
    port: int
    state: PortState
    service: str
    latency_ms: float
    banner: Optional[str] = None


class PortScanner:
    """
    High-performance asynchronous TCP port scanner.
    """

    def __init__(
        self,
        target: str,
        timeout: float = 1.0,
        concurrency: int = 100,
        grab_banner: bool = False,
    ):
        self.target: str = target.strip()
        self.timeout: float = max(0.1, timeout)
        self.concurrency: int = max(1, concurrency)
        self.grab_banner: bool = grab_banner
        self.target_ip: Optional[str] = None

    def resolve_target(self) -> str:
        """Resolve target hostname to IP address."""
        try:
            addr_info = socket.getaddrinfo(
                self.target, None, socket.AF_UNSPEC, socket.SOCK_STREAM
            )
            # Prefer IPv4 if available
            for family, _, _, _, sockaddr in addr_info:
                if family == socket.AF_INET:
                    self.target_ip = sockaddr[0]
                    return self.target_ip
            # Fallback to first resolved address (e.g. IPv6)
            self.target_ip = addr_info[0][4][0]
            return self.target_ip
        except socket.gaierror as e:
            raise ValueError(f"Could not resolve hostname '{self.target}': {e}")
        except Exception as e:
            raise ValueError(f"Error resolving target '{self.target}': {e}")

    async def _extract_banner(
        self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter
    ) -> Optional[str]:
        """Attempt to grab service banner safely."""
        banner_bytes = b""
        try:
            # 1. Passive grab: Many protocols (SSH, FTP, SMTP) announce themselves
            try:
                banner_bytes = await asyncio.wait_for(reader.read(512), timeout=0.6)
            except (asyncio.TimeoutError, TimeoutError):
                pass

            # 2. Active grab: If passive grab yielded nothing, send benign HTTP probe
            if not banner_bytes:
                probe = f"HEAD / HTTP/1.0\r\nHost: {self.target}\r\nUser-Agent: PortScanner/1.0\r\n\r\n".encode("utf-8")
                writer.write(probe)
                await writer.drain()
                try:
                    banner_bytes = await asyncio.wait_for(reader.read(512), timeout=0.8)
                except (asyncio.TimeoutError, TimeoutError):
                    pass

            if banner_bytes:
                # Clean and sanitize banner output
                decoded = banner_bytes.decode("latin1", errors="replace").strip()
                # Take first line or up to 80 chars
                first_line = decoded.splitlines()[0] if decoded else ""
                clean_banner = "".join(
                    c for c in first_line if c.isprintable()
                ).strip()
                return clean_banner[:100] if clean_banner else None
        except Exception:
            return None
        return None

    async def scan_port(
        self, port: int, semaphore: asyncio.Semaphore
    ) -> ScanResult:
        """Scan a single TCP port with concurrency control."""
        service = get_service_name(port)
        start_time = time.perf_counter()

        async with semaphore:
            try:
                # Attempt TCP connection
                connect_coro = asyncio.open_connection(self.target_ip, port)
                reader, writer = await asyncio.wait_for(
                    connect_coro, timeout=self.timeout
                )
                latency = (time.perf_counter() - start_time) * 1000.0

                banner: Optional[str] = None
                if self.grab_banner:
                    banner = await self._extract_banner(reader, writer)

                # Cleanly close connection
                try:
                    writer.close()
                    await writer.wait_closed()
                except Exception:
                    pass

                return ScanResult(
                    port=port,
                    state=PortState.OPEN,
                    service=service,
                    latency_ms=round(latency, 2),
                    banner=banner,
                )

            except (asyncio.TimeoutError, TimeoutError):
                latency = (time.perf_counter() - start_time) * 1000.0
                return ScanResult(
                    port=port,
                    state=PortState.FILTERED,
                    service=service,
                    latency_ms=round(latency, 2),
                )
            except ConnectionRefusedError:
                latency = (time.perf_counter() - start_time) * 1000.0
                return ScanResult(
                    port=port,
                    state=PortState.CLOSED,
                    service=service,
                    latency_ms=round(latency, 2),
                )
            except OSError as e:
                # On Windows, 10061 is Connection Refused, 10060 is Timed Out
                latency = (time.perf_counter() - start_time) * 1000.0
                win_err = getattr(e, "winerror", None)
                if win_err == 10061:
                    state = PortState.CLOSED
                elif win_err == 10060:
                    state = PortState.FILTERED
                else:
                    state = PortState.CLOSED

                return ScanResult(
                    port=port,
                    state=state,
                    service=service,
                    latency_ms=round(latency, 2),
                )
            except Exception:
                latency = (time.perf_counter() - start_time) * 1000.0
                return ScanResult(
                    port=port,
                    state=PortState.CLOSED,
                    service=service,
                    latency_ms=round(latency, 2),
                )

    async def scan(
        self,
        ports: Sequence[int],
        progress_callback: Optional[Callable[[int, int, ScanResult], None]] = None,
    ) -> List[ScanResult]:
        """
        Scan a list of ports asynchronously.
        Calls progress_callback(completed, total, result) on each completed port.
        """
        if not self.target_ip:
            self.resolve_target()

        semaphore = asyncio.Semaphore(self.concurrency)
        total_ports = len(ports)
        results: List[ScanResult] = []
        completed = 0

        tasks = [
            asyncio.create_task(self.scan_port(port, semaphore))
            for port in ports
        ]

        for future in asyncio.as_completed(tasks):
            res = await future
            completed += 1
            results.append(res)
            if progress_callback:
                progress_callback(completed, total_ports, res)

        # Return results sorted by port number
        results.sort(key=lambda r: r.port)
        return results
