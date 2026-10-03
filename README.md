# 👶 NAVAAYU — Neonatal AI Monitoring System (PC3 Dashboard)

NAVAAYU is an edge-native neonatal monitoring system that streams vital signs, single-pathology ML predictions, and clinical decision protocols from a **Raspberry Pi 5 (PC2)** Edge AI node to the **NAVAAYU PC3 Dashboard** over a local smartphone mobile hotspot.

---

## 🏛️ System Architecture (3-Device Integration)

All three devices connect to the **SAME smartphone mobile Wi-Fi hotspot** (No external router, no Ethernet, no cloud server required).

```
   [ PC1: Baby Simulator ]
              │  (Wi-Fi via Smartphone Hotspot)
              ▼
   [ PC2: Raspberry Pi 5 Edge AI Server ]
      - Runs ML model inference (FastAPI on Port 8000)
      - Endpoints: GET /health, GET /latest, GET /latest/{baby_id}
              │  (Wi-Fi via Smartphone Hotspot)
              ▼
   [ PC3: NAVAAYU Dashboard (This Machine) ]
      - React 19 + TypeScript + Vite (:5173)
      - Polls Raspberry Pi Edge API every 1.5s
      - Displays live vitals, waveforms, risk score, confidence & clinical protocol
```

> **Note**: PC3 performs **no ML inference**. All machine learning predictions are computed exclusively on the Raspberry Pi 5 Edge node and consumed as JSON over the local network.

---

## ⚙️ Quick Setup & Execution (Hackathon Runbook)

### Step 1: Connect PC3 to the Smartphone Hotspot
Ensure PC1, the Raspberry Pi 5 (PC2), and this computer (PC3) are all connected to the **same smartphone mobile hotspot**.

### Step 2: Find the Raspberry Pi 5 IP Address
On the Raspberry Pi 5 terminal, run:
```bash
hostname -I
```
Look for the IP assigned by the hotspot (typically `192.168.43.x` on Android or `172.20.10.x` on iOS).  
*Example:* `192.168.43.50`

### Step 3: Configure the Dashboard's Pi API URL

#### Option A: Via Environment File (Recommended)
Edit `NeoNatal_ui/frontend/.env`:
```env
VITE_PI_API_URL=http://<RASPBERRY_PI_IP>:8000
```
*Example:*
```env
VITE_PI_API_URL=http://192.168.43.50:8000
```

#### Option B: Live at Runtime from Dashboard UI (Zero Restart)
1. Open the dashboard.
2. Click the **"PI: ..."** badge or **"EDGE SERVER OFFLINE"** badge in the top-right header.
3. Enter the Raspberry Pi base URL in the modal (e.g. `http://192.168.43.50:8000`) and click **Save & Connect**. The setting is immediately saved to browser local storage.

#### Option C: Via URL Query Parameter
Append `?pi_url=http://<RASPBERRY_PI_IP>:8000` to the browser address bar:
```
http://localhost:5173/?pi_url=http://192.168.43.50:8000
```

---

### Step 4: Start Raspberry Pi 5 FastAPI Server (PC2)
On the Raspberry Pi 5:
```bash
# Ensure CORS is enabled for PC3 (allow_origins=["*"] or ["http://<PC3_IP>:5173"])
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

### Step 5: Test Connectivity from PC3
Before starting the frontend, you can verify network reachability from PC3 using the provided test utility:
```bash
# Test connection to the Raspberry Pi
python3 test_edge_connectivity.py --url http://<RASPBERRY_PI_IP>:8000
```

The script performs:
1. `GET /health` — Verifies Raspberry Pi server responsiveness and latency.
2. `GET /latest` — Verifies incoming single-pathology prediction JSON and vitals.
3. `GET /latest/NICU_001` — Verifies single-baby telemetry query.

*(Optional)* To test PC3 locally without a physical Raspberry Pi:
```bash
python3 test_edge_connectivity.py --mock-server 8000
```

---

### Step 6: Start NAVAAYU PC3 Dashboard
In a terminal on PC3:
```bash
npm run dev
```
*(Or navigate to `cd NeoNatal_ui/frontend && npm run dev`)*

The dashboard will launch on:
```
http://localhost:5173
```

---

### Step 7: Verify Connection & Data Flow
1. Open `http://localhost:5173` in your browser.
2. **Verify Connection Indicator** (top header bar):
   - 🟢 `CONNECTED`: Successfully receiving predictions from Raspberry Pi.
   - 🟡 `CONNECTING`: Initiating handshake / polling request.
   - 🔴 `EDGE SERVER OFFLINE`: Pi is unreachable or IP is incorrect (click to reconfigure).
3. **Verify Prediction Data**:
   - Vitals cards update dynamically (Heart Rate, SpO₂, Respiratory Rate, Temperature, Mean BP).
   - Live Vital Trends area chart renders continuous real-time curves without lag.
   - AI Risk Assessment displays Current Status, Risk Score %, and Model Confidence %.
   - Clinical Protocol renders **Reason / Clinical Cause**, **Recommendation**, and **Action to be Taken**.

---

## 📡 API Contract (Raspberry Pi 5 Edge AI Server)

The Raspberry Pi exposes the following REST endpoints:

### 1. `GET /health`
```json
{
  "status": "healthy",
  "device": "Raspberry Pi 5",
  "edge_model": "single_pathology_rf_v1"
}
```

### 2. `GET /latest` or `GET /latest/{baby_id}`
```json
{
  "status": "success",
  "count": 1,
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
        "SpO2 within target neonatal boundary (98%)",
        "Normothermic skin temperature (36.8°C)",
        "Heart rate rhythmic (142 BPM)"
      ],
      "possible_conditions": [
        "Physiologically Stable Term Infant"
      ],
      "recommended_actions": [
        "Continue continuous pulse oximetry monitoring.",
        "Maintain scheduled expressed breast milk feeding q3h.",
        "Routine neonatal telemetry logging."
      ]
    }
  ]
}
```

---

## 🔒 CORS Configuration on Raspberry Pi (PC2)

Because the PC3 browser calls the Raspberry Pi directly across the local Wi-Fi hotspot, FastAPI on PC2 **must** include the `CORSMiddleware`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify PC3 origin, e.g. ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🧪 Complete PC1 → Pi → PC3 Test Procedure

1. **Hotspot Activation**: Enable hotspot on the smartphone.
2. **Device Connections**:
   - Connect PC1 (Baby Simulator) to the hotspot Wi-Fi.
   - Connect PC2 (Raspberry Pi 5) to the hotspot Wi-Fi.
   - Connect PC3 (Dashboard Machine) to the hotspot Wi-Fi.
3. **Verify Pi IP**: On PC2, run `hostname -I` to get its IP address.
4. **Start Pi Server**: On PC2, start the FastAPI edge server on port 8000.
5. **Start PC1 Simulator**: PC1 begins sending synthetic/sensor telemetry to `http://<PI_IP>:8000/predict` or data ingestion endpoint.
6. **Verify Ingestion on Pi**: Check PC2 console logs to ensure inference is running.
7. **Start PC3 Dashboard**: On PC3, launch `npm run dev`.
8. **Inspect Dashboard**:
   - Check header indicator: turns green `CONNECTED`.
   - Toggle simulated pathology on PC1 (e.g. apnea or hypoxia).
   - Observe PC2 classify the single pathology.
   - Observe PC3 update the vitals, warning status, risk score, reason, recommendation, and action to be taken in real-time.

---

## 🛡️ License
Prototype developed for medical innovation and clinical demonstration purposes.
