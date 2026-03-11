.PHONY: dev dev-frontend dev-backend deploy-worker
.PHONY: build test test-backend lint clean

# Deploy worker functions, then start gateway + frontend
dev:
	@echo "Deploying worker functions..."
	@unset MODAL_TOKEN_ID MODAL_TOKEN_SECRET && modal deploy backend/app.py
	@echo "Starting gateway (ephemeral)..."
	@modal serve backend/modal_app.py & MODAL_PID=$$!; \
	sleep 5; \
	MODAL_URL="https://policyengine--va-reform-dashboard-fastapi-app-dev.modal.run"; \
	PORT=$$(python3 -c 'import socket; s=socket.socket(); s.bind(("",0)); print(s.getsockname()[1]); s.close()'); \
	echo "Gateway: $$MODAL_URL"; \
	echo "Frontend: http://localhost:$$PORT"; \
	NEXT_PUBLIC_API_URL=$$MODAL_URL PORT=$$PORT bun run dev; \
	kill $$MODAL_PID 2>/dev/null

# Frontend only (uses production API or NEXT_PUBLIC_API_URL if set)
dev-frontend:
	@PORT=$$(python3 -c 'import socket; s=socket.socket(); s.bind(("",0)); print(s.getsockname()[1]); s.close()'); \
	echo "Starting dev server on http://localhost:$$PORT"; \
	PORT=$$PORT bun run dev

# Backend only (gateway in dev mode — worker must already be deployed)
dev-backend:
	modal serve backend/modal_app.py

# Deploy worker functions to Modal (required before gateway can spawn jobs)
deploy-worker:
	unset MODAL_TOKEN_ID MODAL_TOKEN_SECRET && modal deploy backend/app.py

build:
	bun run build

test:
	bunx vitest run

test-backend:
	cd backend && uv run pytest

lint:
	bun run lint

clean:
	rm -rf .next node_modules
