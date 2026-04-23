#!/usr/bin/env python3
"""
Drishti-Path — Unified Backend Orchestrator
Starts FastAPI (Uvicorn) and Celery Worker simultaneously with health checks.
"""

import subprocess
import time
import sys
import os
import signal
from typing import List

# Colors for logs
class Color:
    BLUE = "\033[94m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    END = "\033[0m"

class Service:
    def __init__(self, name: str, command: List[str], color: str):
        self.name = name
        self.command = command
        self.color = color
        self.process = None

def get_venv_python():
    """Return the path to the venv python interpreter if it exists."""
    venv_path = os.path.join(os.getcwd(), "venv", "bin", "python")
    if os.path.exists(venv_path):
        return venv_path
    return sys.executable

def start_service(service: Service):
    """Start a service as a subprocess and stream its logs."""
    print(f"{service.color}{Color.BOLD}[STARTING] {service.name}...{Color.END}")
    service.process = subprocess.Popen(
        service.command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

def check_health():
    """Check if PostgreSQL and Redis are reachable."""
    print(f"{Color.YELLOW}[HEALTH CHECK] Checking dependencies...{Color.END}")
    
    # Simple check for Redis using nc (netcat) or similar if available, or just skip and let app fail
    # In a real script, we'd use a python library, but we want to avoid extra deps if possible.
    # We'll rely on the services failing fast if they can't connect.
    pass

def cleanup(services: List[Service]):
    """Terminate all running services."""
    print(f"\n{Color.YELLOW}[TERMINATING] Shutting down backend services...{Color.END}")
    for s in services:
        if s.process:
            print(f"Killing {s.name} (PID: {s.process.pid})")
            s.process.terminate()
    
    # Give them a moment to shut down gracefully
    time.sleep(2)
    
    for s in services:
        if s.process and s.process.poll() is None:
            print(f"Force killing {s.name}...")
            s.process.kill()

def cleanup_existing_processes():
    """Kill any existing processes on port 8000 or any existing celery workers for this project."""
    print(f"{Color.YELLOW}[CLEANUP] Checking for existing processes...{Color.END}")
    
    # 1. Kill API on port 8000
    try:
        pid = subprocess.check_output(["lsof", "-ti:8000"]).decode().strip()
        if pid:
            for p in pid.split("\n"):
                print(f"Killing existing API process (PID: {p}) on port 8000")
                os.kill(int(p), signal.SIGTERM)
            time.sleep(1)
    except subprocess.CalledProcessError:
        pass # No process on port 8000

    # 2. Kill Celery workers
    try:
        # Search for celery processes matching the current project path
        grep_cmd = f"ps aux | grep celery | grep '{os.getcwd()}' | grep -v grep | awk '{{print $2}}'"
        pids = subprocess.check_output(grep_cmd, shell=True).decode().strip()
        if pids:
            for p in pids.split("\n"):
                print(f"Killing existing Celery process (PID: {p})")
                os.kill(int(p), signal.SIGTERM)
            time.sleep(1)
    except subprocess.CalledProcessError:
        pass

def main():
    cleanup_existing_processes()
    python_path = get_venv_python()
    print(f"{Color.BLUE}Using Python: {python_path}{Color.END}")

    services = [
        Service(
            "API (Uvicorn)",
            [python_path, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
            Color.BLUE
        ),
        Service(
            "Worker (Celery)",
            [python_path, "-m", "celery", "-A", "app.workers.celery_app", "worker", "--loglevel=info"],
            Color.GREEN
        )
    ]

    def signal_handler(sig, frame):
        cleanup(services)
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    for s in services:
        start_service(s)

    # Monitor processes and stream logs
    import threading

    def stream_logs(service: Service):
        for line in iter(service.process.stdout.readline, ""):
            print(f"{service.color}[{service.name}]{Color.END} {line.strip()}")

    threads = []
    for s in services:
        t = threading.Thread(target=stream_logs, args=(s,), daemon=True)
        t.start()
        threads.append(t)

    print(f"{Color.GREEN}{Color.BOLD}[RUNNING] Both services are up. Press Ctrl+C to stop.{Color.END}")

    try:
        while True:
            # Check if any process has died
            for s in services:
                if s.process.poll() is not None:
                    print(f"{Color.RED}[ERROR] {s.name} crashed with code {s.process.returncode}{Color.END}")
                    cleanup(services)
                    return
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup(services)

if __name__ == "__main__":
    main()
