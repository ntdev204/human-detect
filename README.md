# Human Detection System

## 🚀 Quick Start

### Server (FastAPI)

```bash
cd server
pip install -r requirements.txt
python main.py
```

Server sẽ chạy tại `http://localhost:8000`

### Client (Next.js)

```bash
cd client
npm install
npm run dev
```

Client sẽ chạy tại `http://localhost:3000`

### Training (Google Colab)

1. Upload file `training/human_detection_training.ipynb` lên Google Colab
2. Chạy từng cell theo thứ tự
3. Download file `best.pt` sau khi train xong
4. Đặt file `best.pt` vào folder `server/models/`

## 📁 Project Structure

```
human-detect/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities & API
│   └── .env.local         # Environment config
│
├── server/                 # FastAPI backend
│   ├── main.py            # Entry point
│   ├── routers/           # API routes
│   ├── services/          # Business logic
│   └── models/            # YOLOv8 weights
│
├── training/              # Google Colab notebook
│   └── human_detection_training.ipynb
│
└── data/                  # Training data
    ├── 0/                 # No person images
    └── 1/                 # Person images
```

## 🔧 API Endpoints

| Endpoint         | Method    | Description            |
| ---------------- | --------- | ---------------------- |
| `/health`        | GET       | Health check           |
| `/api/detect`    | POST      | Upload image detection |
| `/api/ws/detect` | WebSocket | Real-time detection    |

## 📝 Notes

- Server sử dụng pretrained YOLOv8n nếu không có custom model
- Đặt file `best.pt` vào `server/models/` để sử dụng model đã train
