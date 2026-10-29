from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config import settings
from .routers import accounts, transfers, recommendations, notifications, auth, scheduler
from .services.worker import background_worker

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start background polling worker
    background_worker.start()
    # Execute an initial portfolio scan on startup
    try:
        await background_worker.run_portfolio_scan()
    except Exception as e:
        print(f"Initial scan warning: {e}")
    yield
    # Shutdown: Stop worker gracefully
    background_worker.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Universal Loyalty Points Aggregation Platform — Ledger, Connector, Vault & Alert Daemon API",
    lifespan=lifespan,
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(accounts.router, prefix=settings.API_PREFIX)
app.include_router(transfers.router, prefix=settings.API_PREFIX)
app.include_router(recommendations.router, prefix=settings.API_PREFIX)
app.include_router(notifications.router, prefix=settings.API_PREFIX)
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(scheduler.router, prefix=settings.API_PREFIX)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "vault_encryption": "AES-256-GCM Active",
        "background_worker": "APScheduler Daily Cron Running"
    }
