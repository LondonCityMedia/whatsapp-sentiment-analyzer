BACKEND_DIR=backend
FRONTEND_DIR=frontend

.PHONY: start-backend start-frontend start-all

start-backend:
	cd $(BACKEND_DIR) && venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

start-frontend:
	cd $(FRONTEND_DIR) && npm run dev -- --host 0.0.0.0 --port 5173

start-all:
	$(MAKE) -j2 start-backend start-frontend


