"""
Command-Line Interface (CLI) for the Port Scanner.
"""

import argparse
import asyncio
import csv
import json
import os
import sys
import time
from typing import List

from scanner import PortScanner, PortState, ScanResult
from services import PRESETS, parse_ports


def format_table(results: List[ScanResult], show_all: bool = False) -> str:
    """Format scan results into a clean terminal table."""
    filtered_results = results if show_all else [r for r in results if r.state == PortState.OPEN]
    
    if not filtered_results:
        if not show_all and results:
            return "No open ports found. (Use --all to display closed/filtered ports)"
        return "No results to display."

    has_banner = any(r.banner for r in filtered_results)
    
    # Column headers
    headers = ["PORT", "STATE", "SERVICE", "LATENCY"]
    if has_banner:
        headers.append("BANNER")

    rows = []
    for r in filtered_results:
        port_col = f"{r.port}/tcp"
        state_col = r.state.value
        service_col = r.service
        latency_col = f"{r.latency_ms:.1f}ms"
        if has_banner:
            banner_col = r.banner or "-"
            rows.append([port_col, state_col, service_col, latency_col, banner_col])
        else:
            rows.append([port_col, state_col, service_col, latency_col])

    # Compute column widths
    col_widths = [len(h) for h in headers]
    for row in rows:
        for idx, col in enumerate(row):
            col_widths[idx] = max(col_widths[idx], len(str(col)))

    # Format output
    header_line = "  ".join(h.ljust(col_widths[i]) for i, h in enumerate(headers))
    separator_line = "  ".join("-" * col_widths[i] for i in range(len(headers)))
    
    output_lines = [header_line, separator_line]
    for row in rows:
        line = "  ".join(str(val).ljust(col_widths[i]) for i, val in enumerate(row))
        output_lines.append(line)

    return "\n".join(output_lines)


def export_json(target: str, target_ip: str, duration: float, results: List[ScanResult]) -> str:
    """Serialize results to formatted JSON."""
    payload = {
        "target": target,
        "target_ip": target_ip,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "duration_seconds": round(duration, 3),
        "total_scanned": len(results),
        "summary": {
            "open": sum(1 for r in results if r.state == PortState.OPEN),
            "closed": sum(1 for r in results if r.state == PortState.CLOSED),
            "filtered": sum(1 for r in results if r.state == PortState.FILTERED),
        },
        "results": [
            {
                "port": r.port,
                "protocol": "tcp",
                "state": r.state.value,
                "service": r.service,
                "latency_ms": r.latency_ms,
                "banner": r.banner,
            }
            for r in results
        ],
    }
    return json.dumps(payload, indent=2)


def export_csv(results: List[ScanResult]) -> str:
    """Serialize results to CSV."""
    import io
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Port", "Protocol", "State", "Service", "Latency_ms", "Banner"])
    for r in results:
        writer.writerow([r.port, "tcp", r.state.value, r.service, r.latency_ms, r.banner or ""])
    return output.getvalue()


async def run_scanner(args: argparse.Namespace) -> None:
    """Main asynchronous scanner coordination routine."""
    # Determine target ports
    if args.ports:
        try:
            ports = parse_ports(args.ports)
        except ValueError as e:
            print(f"[!] Error parsing ports: {e}", file=sys.stderr)
            sys.exit(1)
    elif args.preset:
        preset_name = args.preset.lower()
        if preset_name not in PRESETS:
            print(f"[!] Unknown preset '{preset_name}'. Choose from: {', '.join(PRESETS.keys())}", file=sys.stderr)
            sys.exit(1)
        ports = PRESETS[preset_name]
    else:
        # Default to top 100 ports
        ports = PRESETS["top100"]

    scanner = PortScanner(
        target=args.target,
        timeout=args.timeout,
        concurrency=args.concurrency,
        grab_banner=args.banner,
    )

    # Resolve target
    log_out = sys.stderr if args.format in ("json", "csv") else sys.stdout
    print(f"[*] Resolving target '{args.target}'...", file=log_out)
    try:
        ip = scanner.resolve_target()
    except ValueError as e:
        print(f"[!] Error: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"[*] Target resolved to {ip}", file=log_out)
    print(f"[*] Scanning {len(ports)} ports with concurrency={args.concurrency}, timeout={args.timeout}s...", file=log_out)
    if args.banner:
        print("[*] Service banner grabbing is enabled.", file=log_out)

    open_count = 0
    start_time = time.perf_counter()

    # Progress tracking callback
    is_interactive = sys.stdout.isatty() and args.format == "table"

    def progress(completed: int, total: int, result: ScanResult) -> None:
        nonlocal open_count
        if result.state == PortState.OPEN:
            open_count += 1
            if not is_interactive and args.format == "table":
                print(f"[+] Found open port: {result.port}/tcp ({result.service})")
        
        if is_interactive:
            percent = (completed / total) * 100
            bar_len = 25
            filled_len = int(bar_len * completed // total)
            bar = "=" * filled_len + "-" * (bar_len - filled_len)
            sys.stdout.write(
                f"\r[{bar}] {completed}/{total} ({percent:.0f}%) | Open: {open_count}"
            )
            sys.stdout.flush()

    try:
        results = await scanner.scan(ports, progress_callback=progress)
    except KeyboardInterrupt:
        print("\n[!] Scan cancelled by user.", file=sys.stderr)
        sys.exit(130)

    scan_duration = time.perf_counter() - start_time
    if is_interactive:
        sys.stdout.write("\n")

    # Output formatting
    if args.format == "json":
        formatted_output = export_json(args.target, ip, scan_duration, results)
    elif args.format == "csv":
        formatted_output = export_csv(results)
    else:
        table = format_table(results, show_all=args.all)
        rate = len(ports) / scan_duration if scan_duration > 0 else 0
        summary = (
            f"\n--- Scan Summary ---\n"
            f"Target:        {args.target} ({ip})\n"
            f"Ports Scanned: {len(ports)}\n"
            f"Open Ports:    {open_count}\n"
            f"Scan Time:     {scan_duration:.2f}s ({rate:.1f} ports/sec)\n"
        )
        formatted_output = f"\n{table}\n{summary}"

    # Print to stdout
    print(formatted_output)

    # Optional file output
    if args.output:
        try:
            with open(args.output, "w", encoding="utf-8") as f:
                if args.output.lower().endswith(".json"):
                    f.write(export_json(args.target, ip, scan_duration, results))
                elif args.output.lower().endswith(".csv"):
                    f.write(export_csv(results))
                else:
                    f.write(formatted_output)
            print(f"[+] Results saved to {args.output}")
        except Exception as e:
            print(f"[!] Failed to write to output file '{args.output}': {e}", file=sys.stderr)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="High-Performance Asynchronous TCP Port Scanner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python cli.py -t 127.0.0.1
  python cli.py -t localhost -p 80,443,8000-8080 --banner
  python cli.py -t scanme.nmap.org --preset top20
  python cli.py -t 192.168.1.1 --preset database --all
  python cli.py -t 127.0.0.1 -p 1-1024 --format json -o results.json
        """,
    )

    parser.add_argument(
        "-t", "--target", required=True, help="Target hostname or IP address"
    )
    port_group = parser.add_mutually_exclusive_group()
    port_group.add_argument(
        "-p",
        "--ports",
        help="Port specification (e.g. '80', '22,80,443', '8000-8080')",
    )
    port_group.add_argument(
        "--preset",
        choices=list(PRESETS.keys()),
        help="Use a preset list of ports (top20, top100, web, database)",
    )

    parser.add_argument(
        "-c",
        "--concurrency",
        type=int,
        default=100,
        help="Maximum concurrent connections (default: 100)",
    )
    parser.add_argument(
        "-w",
        "--timeout",
        type=float,
        default=1.0,
        help="Connection timeout in seconds (default: 1.0)",
    )
    parser.add_argument(
        "-b",
        "--banner",
        action="store_true",
        help="Enable service banner grabbing",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Display all scanned ports including closed and filtered",
    )
    parser.add_argument(
        "--format",
        choices=["table", "json", "csv"],
        default="table",
        help="Output format (default: table)",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Save output to specified file path",
    )

    args = parser.parse_args()

    try:
        asyncio.run(run_scanner(args))
    except KeyboardInterrupt:
        print("\nScan aborted by user.")
        sys.exit(130)


if __name__ == "__main__":
    main()
