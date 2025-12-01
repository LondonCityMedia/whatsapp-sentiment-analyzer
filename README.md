# WhatsApp Sentiment Analyzer

## Prerequisites
- Python 3.8+
- Node.js 16+

## Setup & Run

### 1. Backend
Open a terminal and run:
```bash
# Navigate to the project folder first
cd /Users/sean/.gemini/antigravity/scratch/whatsapp-sentiment-analyzer

cd backend
python3 -m pip install -r requirements.txt
python3 main.py
```
The API will start at `http://0.0.0.0:8000`.

### 2. Frontend
Open a **new** terminal window and run:
```bash
# Navigate to the project folder first
cd /Users/sean/.gemini/antigravity/scratch/whatsapp-sentiment-analyzer

cd frontend
npm install --legacy-peer-deps
npm run dev
```
The application will be available at `http://localhost:5173` (or similar).

## Usage
1. Open the frontend URL in your browser.
2. Upload a WhatsApp chat export `.txt` file.
3. View the sentiment analysis results.
