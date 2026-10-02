"""
Unit and integration tests for the Port Scanner.
"""

import asyncio
import json
import unittest
from typing import Tuple

from scanner import PortScanner, PortState, ScanResult
from services import (
    COMMON_SERVICES,
    PRESETS,
    get_service_name,
    parse_ports,
)
from cli import export_csv, export_json, format_table


class TestServices(unittest.TestCase):
    """Test port definitions, presets, and port parsing logic."""

    def test_parse_single_port(self):
        self.assertEqual(parse_ports("80"), [80])

    def test_parse_comma_separated(self):
        self.assertEqual(parse_ports("22,80,443"), [22, 80, 443])

    def test_parse_range(self):
        self.assertEqual(parse_ports("8000-8003"), [8000, 8001, 8002, 8003])

    def test_parse_inverted_range(self):
        self.assertEqual(parse_ports("8003-8000"), [8000, 8001, 8002, 8003])

    def test_parse_combination(self):
        self.assertEqual(
            parse_ports("22, 80, 8080-8082, 443"),
            [22, 80, 443, 8080, 8081, 8082],
        )

    def test_parse_invalid_values(self):
        with self.assertRaises(ValueError):
            parse_ports("invalid")
        with self.assertRaises(ValueError):
            parse_ports("80,abc")
        with self.assertRaises(ValueError):
            parse_ports("0")
        with self.assertRaises(ValueError):
            parse_ports("70000")
        with self.assertRaises(ValueError):
            parse_ports("100-200-300")

    def test_get_service_name(self):
        self.assertEqual(get_service_name(80), "HTTP")
        self.assertEqual(get_service_name(443), "HTTPS")
        self.assertEqual(get_service_name(22), "SSH")
        self.assertEqual(get_service_name(61234), "Unknown")

    def test_presets_exist(self):
        self.assertIn("top20", PRESETS)
        self.assertIn("top100", PRESETS)
        self.assertIn("web", PRESETS)
        self.assertIn("database", PRESETS)
        self.assertGreater(len(PRESETS["top20"]), 0)


class TestFormatters(unittest.TestCase):
    """Test output formatting functions."""

    def setUp(self):
        self.sample_results = [
            ScanResult(
                port=80,
                state=PortState.OPEN,
                service="HTTP",
                latency_ms=12.5,
                banner="Apache/2.4.41",
            ),
            ScanResult(
                port=443,
                state=PortState.CLOSED,
                service="HTTPS",
                latency_ms=1.2,
                banner=None,
            ),
        ]

    def test_format_table(self):
        table = format_table(self.sample_results, show_all=True)
        self.assertIn("80/tcp", table)
        self.assertIn("OPEN", table)
        self.assertIn("Apache/2.4.41", table)
        self.assertIn("443/tcp", table)
        self.assertIn("CLOSED", table)

    def test_export_json(self):
        json_str = export_json("127.0.0.1", "127.0.0.1", 0.5, self.sample_results)
        data = json.loads(json_str)
        self.assertEqual(data["target"], "127.0.0.1")
        self.assertEqual(data["summary"]["open"], 1)
        self.assertEqual(data["summary"]["closed"], 1)
        self.assertEqual(len(data["results"]), 2)
        self.assertEqual(data["results"][0]["banner"], "Apache/2.4.41")

    def test_export_csv(self):
        csv_str = export_csv(self.sample_results)
        self.assertIn("Port,Protocol,State,Service,Latency_ms,Banner", csv_str)
        self.assertIn("80,tcp,OPEN,HTTP,12.5,Apache/2.4.41", csv_str)
        self.assertIn("443,tcp,CLOSED,HTTPS,1.2,", csv_str)


class TestAsyncScannerIntegration(unittest.IsolatedAsyncioTestCase):
    """Integration test with temporary mock TCP servers."""

    async def asyncSetUp(self):
        # 1. Standard open TCP server (no immediate banner)
        async def handle_plain(reader, writer):
            await asyncio.sleep(0.1)
            writer.close()
            await writer.wait_closed()

        self.server_plain = await asyncio.start_server(
            handle_plain, "127.0.0.1", 0
        )
        self.port_plain = self.server_plain.sockets[0].getsockname()[1]

        # 2. Banner-greeting server (sends greeting immediately like SSH/FTP)
        async def handle_banner(reader, writer):
            writer.write(b"SSH-2.0-MockServer_1.0\r\n")
            await writer.drain()
            await asyncio.sleep(0.1)
            writer.close()
            await writer.wait_closed()

        self.server_banner = await asyncio.start_server(
            handle_banner, "127.0.0.1", 0
        )
        self.port_banner = self.server_banner.sockets[0].getsockname()[1]

    async def asyncTearDown(self):
        self.server_plain.close()
        self.server_banner.close()
        await self.server_plain.wait_closed()
        await self.server_banner.wait_closed()

    async def test_scan_open_and_banner_ports(self):
        # Pick a guaranteed closed port by opening and immediately closing a socket
        import socket
        temp_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        temp_sock.bind(("127.0.0.1", 0))
        closed_port = temp_sock.getsockname()[1]
        temp_sock.close()

        scanner = PortScanner(
            target="127.0.0.1",
            timeout=1.0,
            concurrency=10,
            grab_banner=True,
        )

        target_ports = [self.port_plain, self.port_banner, closed_port]
        results = await scanner.scan(target_ports)

        results_by_port = {r.port: r for r in results}

        # Verify plain open port
        self.assertIn(self.port_plain, results_by_port)
        self.assertEqual(results_by_port[self.port_plain].state, PortState.OPEN)
        self.assertGreater(results_by_port[self.port_plain].latency_ms, 0)

        # Verify banner port
        self.assertIn(self.port_banner, results_by_port)
        self.assertEqual(results_by_port[self.port_banner].state, PortState.OPEN)
        self.assertEqual(
            results_by_port[self.port_banner].banner, "SSH-2.0-MockServer_1.0"
        )

        # Verify closed port
        self.assertIn(closed_port, results_by_port)
        self.assertIn(
            results_by_port[closed_port].state,
            [PortState.CLOSED, PortState.FILTERED],
        )


if __name__ == "__main__":
    unittest.main()
