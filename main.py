from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import routers here
from routers.graphs import router as graph_router
from routers.energy import router as energy_router

app = FastAPI()
app.add_middleware( CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"], )

# add routers here
app.include_router(graph_router)
app.include_router(energy_router)

@app.get("/")
async def root():
    return "GBTAC API"

# to run: uvicorn main:app --reload