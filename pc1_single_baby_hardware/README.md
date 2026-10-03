# PC1 Single Baby Dedicated Hardware Monitoring System

A dedicated, isolated single-infant neonatal hardware monitoring unit connected to Edge AI / ESP32 / Raspberry Pi 5 and Cloud Telemetry.

---

## 📁 Package Structure

```
pc1_single_baby_hardware/
├── frontend/             # Single-baby dedicated Vite + React monitoring dashboard
│   ├── src/
│   │   ├── App.tsx       # Dedicated 1-baby monitor (5 vitals, continuous waveform, AI risk, medical history)
│   │   ├── services/api.ts # Edge AI & Cloud telemetry polling service
│   │   └── ...
│   └── package.json
├── backend/              # FastAPI edge server & AI inference
│   ├── main.py           # REST & WebSocket telemetry endpoints
│   ├── shared_data.py    # In-memory shared state for vitals and alerts
│   ├── motion_detection.py # OpenCV video motion analysis
│   ├── cry_detection_yamnet.py # YAMNet audio cry detection
│   └── requirements.txt
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Run Backend Edge AI Server
```bash
cd pc1_single_baby_hardware/backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API endpoints will be available at `http://localhost:8000` (docs at `http://localhost:8000/docs`).

---

### 2. Run Frontend Dashboard
```bash
cd pc1_single_baby_hardware/frontend
npm install
npm run dev -- --port 5174
```
Access the dashboard at `http://localhost:5174`.

---

## 🩺 Features Included

- **Dedicated Single-Infant Telemetry**: High-frequency streaming for Bed `NICU-001`.
- **5 Core Vitals**:
  - Heart Rate (`181 BPM` • Normal: 110-160 BPM)
  - Oxygen Saturation (`89%` • Desaturation Dip Alert)
  - Respiratory Rate (`69 /min` • Tachypnea)
  - Skin Temperature (`38.9°C` • Hyperthermia)
  - Blood Pressure Mean MAP (`64 mmHg`)
- **Continuous Waveform AreaChart**: 150ms live stream for HR, SpO₂, and Resp Rate.
- **AI Risk Assessment**: Current status, risk score %, and confidence level.
- **Clinical Alerts & Decision Protocol**: Reason, clinical recommendation, and action to be taken.
- **Patient Medical History**: Maternal record, delivery type, APGAR score, feeding schedule, and care regime.
- **HUD Control Bar**: Live telemetry indicator, latency display, streaming speed selector, and configurable IP modal.
