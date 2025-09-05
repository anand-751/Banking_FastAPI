from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models, database
from app.routers import auth, dashboard, admin

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="PyBank API",
    description="Banking Management System API with User & Admin Roles",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Welcome to PyBank API 🚀"}
