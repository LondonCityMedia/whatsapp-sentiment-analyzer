# Deployment Guide

## Frontend (Vercel)

### Automatic Deployment
1. Push to GitHub (already done)
2. Vercel should auto-deploy if the repo is connected
3. If not connected:
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the `vercel.json` configuration

### Environment Variables
In Vercel project settings → Environment Variables, add:
- **Name**: `VITE_API_URL`
- **Value**: Your Lightsail backend URL (e.g., `http://YOUR_LIGHTSAIL_IP:8000` or `https://api.yourdomain.com`)

After adding the env var, redeploy the project.

## Backend (Lightsail)

### 1. SSH into your Lightsail instance
```bash
ssh -i your-key.pem ubuntu@YOUR_LIGHTSAIL_IP
```

### 2. Initial Setup (First Time Only)

If you haven't cloned the repository yet, do this first:

```bash
# Navigate to your home directory (or wherever you want the project)
cd ~

# Clone the repository
git clone https://github.com/LondonCityMedia/whatsapp-sentiment-analyzer.git

# Navigate into the project
cd whatsapp-sentiment-analyzer
```

**Note:** If your repository is private, you'll need to set up SSH keys or use a personal access token:
```bash
# For private repos, use SSH (set up SSH key first):
git clone git@github.com:LondonCityMedia/whatsapp-sentiment-analyzer.git

# Or use HTTPS with a personal access token:
git clone https://YOUR_TOKEN@github.com/LondonCityMedia/whatsapp-sentiment-analyzer.git
```

### 3. Navigate to your project directory (if already cloned)
```bash
cd ~/whatsapp-sentiment-analyzer  # or wherever you cloned it
```

### 4. Pull latest changes (for updates)
```bash
git pull origin main
```

### 4. Activate virtual environment and install dependencies
```bash
cd backend
source venv/bin/activate  # or python3 -m venv venv if it doesn't exist
pip install -r requirements.txt
```

### 5. Run with a process manager (PM2 recommended)

#### Option A: Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the backend
pm2 start "venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name whatsapp-analyzer

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Option B: Using systemd
Create a service file:
```bash
sudo nano /etc/systemd/system/whatsapp-analyzer.service
```

Add this content (adjust paths as needed):
```ini
[Unit]
Description=WhatsApp Sentiment Analyzer API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/whatsapp-sentiment-analyzer/backend
Environment="PATH=/home/ubuntu/whatsapp-sentiment-analyzer/backend/venv/bin"
ExecStart=/home/ubuntu/whatsapp-sentiment-analyzer/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-analyzer
sudo systemctl start whatsapp-analyzer
sudo systemctl status whatsapp-analyzer
```

### 6. Configure Firewall
Make sure port 8000 is open:
```bash
# For Ubuntu/Debian
sudo ufw allow 8000/tcp
sudo ufw reload
```

### 7. Update CORS in backend (if needed)
If your frontend domain is different, update `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-app.vercel.app"],  # Your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Quick Update Script

For future updates, you can create a simple update script on Lightsail:

```bash
#!/bin/bash
# update-backend.sh
cd /path/to/whatsapp-sentiment-analyzer
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart whatsapp-analyzer  # or: sudo systemctl restart whatsapp-analyzer
```

Make it executable:
```bash
chmod +x update-backend.sh
```

Then just run `./update-backend.sh` after pushing to GitHub.

