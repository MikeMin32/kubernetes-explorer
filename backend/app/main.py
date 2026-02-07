from fastapi import FastAPI
from app.api.health import router as health_router
from app.api.k8s import router as k8s_router

def create_app() -> FastAPI:
    app = FastAPI(title="K8s Architecture Explorer API", version="0.1.0")
    app.include_router(health_router)
    app.include_router(k8s_router)
    return app


app = create_app()
