from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (
    administrateurs,
    candidats,
    candidatures,
    cvs,
    notifications,
    offres,
    recruteurs,
)

app = FastAPI(
    title="JobGate API",
    description="Plateforme de recrutement intelligente avec IA",
    version="1.0.0",
)

# A restreindre a des origines precises en production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(administrateurs.router)
app.include_router(recruteurs.router)
app.include_router(candidats.router)
app.include_router(cvs.router)
app.include_router(offres.router)
app.include_router(candidatures.router)
app.include_router(notifications.router)


@app.get("/", tags=["Root"])
def root():
    return {"message": "JobGate API - Plateforme de recrutement intelligente avec IA"}
