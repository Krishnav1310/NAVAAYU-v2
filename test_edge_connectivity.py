#!/usr/bin/env python3
"""
NAVAAYU PC3 Edge Connectivity & Verification Utility
Tests connection to the Raspberry Pi 5 FastAPI Edge AI Server.
"""

import sys
import os
import json
import time
import argparse
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler

DEFAULT_PI_URL = "https://pc-2-hardware.onrender.com"

def get_env_pi_url():
    """Attempt to read VITE_PI_API_URL from NeoNatal_ui/frontend/.env"""
    env_path = os.path.join(os.path.dirname(__file__), "NeoNatal_ui", "frontend", ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("VITE_PI_API_URL="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val:
                            return val
        except Exception:
            pass
    return DEFAULT_PI_URL

def test_endpoint(base_url, endpoint, timeout=3.0):
    url = f"{base_url.rstrip('/')}/{endpoint.lstrip('/')}"
    print(f"\n[TESTING] GET {url} ...")
    start = time.time()
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "NAVAAYU-PC3-ConnectivityTest/1.0",
                "Accept": "application/json"
            }
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            latency = (time.time() - start) * 1000
            status_code = response.getcode()
            body_bytes = response.read()
            raw_text = body_bytes.decode("utf-8")
            
            try:
                data = json.loads(raw_text)
                formatted_json = json.dumps(data, indent=2)
            except Exception:
                formatted_json = raw_text

            print(f"  ✓ SUCCESS [HTTP {status_code}] ({latency:.1f}ms)")
            print("  --- Response Data ---")
            print(formatted_json)
            return True, data
    except urllib.error.HTTPError as e:
        latency = (time.time() - start) * 1000
        print(f"  ✗ HTTP ERROR [HTTP {e.code}]: {e.reason} ({latency:.1f}ms)")
        try:
            err_body = e.read().decode("utf-8")
            print(f"  Response: {err_body}")
        except Exception:
            pass
        return False, None
    except urllib.error.URLError as e:
        latency = (time.time() - start) * 1000
        print(f"  ✗ CONNECTION FAILED: {e.reason} ({latency:.1f}ms)")
        print("    Hints:")
        print("    1. Is PC3 connected to the same smartphone Wi-Fi hotspot as the Pi?")
        print("    2. Is the IP address correct? (Check with 'hostname -I' on Raspberry Pi)")
        print("    3. Is the FastAPI server running on port 8000?")
        return False, None
    except Exception as e:
        print(f"  ✗ UNEXPECTED ERROR: {e}")
        return False, None

def run_tests(base_url):
    print("=" * 65)
    print(" NAVAAYU PC3 -> Raspberry Pi 5 Edge AI Connectivity Test")
    print("=" * 65)
    print(f"Target Raspberry Pi URL: {base_url}")

    # Test 1: Health check
    print("\n--- STEP 1: Raspberry Pi Health Check ---")
    health_ok, _ = test_endpoint(base_url, "health")

    # Test 2: Latest prediction
    print("\n--- STEP 2: Latest Edge Prediction Data ---")
    latest_ok, latest_data = test_endpoint(base_url, "latest")

    # Test 3: Specific baby ID prediction (e.g. NICU_001)
    print("\n--- STEP 3: Specific Baby Prediction (NICU_001) ---")
    baby_ok, _ = test_endpoint(base_url, "latest/NICU_001")

    print("\n" + "=" * 65)
    print(" SUMMARY")
    print("=" * 65)
    print(f"  1. GET /health          : {'PASSED [OK]' if health_ok else 'FAILED [ERROR]'}")
    print(f"  2. GET /latest          : {'PASSED [OK]' if latest_ok else 'FAILED [ERROR]'}")
    print(f"  3. GET /latest/NICU_001 : {'PASSED [OK]' if baby_ok else 'OPTIONAL / NOT IMPLEMENTED'}")
    
    if health_ok and latest_ok:
        print("\n✓ All core connectivity tests passed! NAVAAYU PC3 dashboard can receive inference data.")
    else:
        print("\n✗ One or more core tests failed. Check Wi-Fi hotspot connection and Raspberry Pi server.")
    print("=" * 65)

# Standalone Mock Server for local validation
class MockPiHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/health":
            response = {
                "status": "healthy",
                "device": "Raspberry Pi 5",
                "uptime": "active",
                "edge_model": "single_pathology_rf_v1"
            }
            self._respond_json(200, response)
        elif path in ["/latest", "/latest/NICU_001", "/latest/NB-2026-001"]:
            # Single-pathology edge AI response contract
            response = {
                "status": "success",
                "count": 1,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "results": [
                  {
                    "baby_id": "NICU_001",
                    "status": "NORMAL",
                    "prediction_score": 0.08,
                    "at_risk_probability": 0.08,
                    "normal_probability": 0.92,
                    "confidence": 92,
                    "vitals": {
                      "heart_rate": 142,
                      "spo2": 98,
                      "respiratory_rate": 45,
                      "temperature": 36.8,
                      "blood_pressure": 42
                    },
                    "reasons": [
                      "Normothermic (36.8°C)",
                      "SpO2 within target neonatal boundary (98%)",
                      "Heart rate rhythmic (142 BPM)"
                    ],
                    "possible_conditions": [
                      "Physiologically Stable Term Infant"
                    ],
                    "recommended_actions": [
                      "Continue continuous pulse oximetry monitoring.",
                      "Scheduled expressed breast milk feeding q3h.",
                      "Routine neonatal telemetry logging."
                    ]
                  }
                ]
            }
            self._respond_json(200, response)
        elif path in ["/latest/NICU_002", "/latest/NB-2026-002"]:
            response = {
                "status": "success",
                "count": 1,
                "results": [
                  {
                    "baby_id": "NICU_002",
                    "status": "AT_RISK",
                    "prediction_score": 0.68,
                    "at_risk_probability": 0.68,
                    "normal_probability": 0.32,
                    "confidence": 88,
                    "vitals": {
                      "heart_rate": 154,
                      "spo2": 92,
                      "respiratory_rate": 26,
                      "temperature": 37.6,
                      "blood_pressure": 33
                    },
                    "reasons": [
                      "Bradypnea episode (26 /min)",
                      "SpO2 desaturation dip (92%)",
                      "Elevated temperature (37.6°C)"
                    ],
                    "possible_conditions": [
                      "Transient Tachypnea / Respiratory Depression"
                    ],
                    "recommended_actions": [
                      "Reposition infant to open upper airways (sniffing position).",
                      "Titrate supplemental humidified oxygen if SpO2 < 94%.",
                      "Perform bedside capillary blood glucose evaluation.",
                      "Alert attending neonatologist if vitals do not recover within 10 min."
                    ]
                  }
                ]
            }
            self._respond_json(200, response)
        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(b'{"error": "Endpoint not found"}')

    def _respond_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        print(f"[MOCK PI] {self.address_string()} - {format % args}")

def run_mock_server(port=8000):
    server = HTTPServer(("0.0.0.0", port), MockPiHandler)
    print("=" * 65)
    print(f" MOCK RASPBERRY PI 5 FASTAPI SERVER RUNNING ON PORT {port}")
    print("=" * 65)
    print(f"  Health URL: http://localhost:{port}/health")
    print(f"  Latest URL: http://localhost:{port}/latest")
    print("  CORS enabled for all origins (*)")
    print("  Press Ctrl+C to terminate.")
    print("=" * 65)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[MOCK PI] Server stopped.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NAVAAYU PC3 Edge Connectivity Test")
    parser.add_argument("--url", default=None, help="Base URL of Raspberry Pi (e.g. http://192.168.43.50:8000)")
    parser.add_argument("--mock-server", type=int, nargs="?", const=8000, default=None,
                        help="Run a local mock Raspberry Pi server on specified port (default 8000)")
    args = parser.parse_args()

    if args.mock_server is not None:
        run_mock_server(args.mock_server)
    else:
        target_url = args.url or get_env_pi_url()
        run_tests(target_url)
