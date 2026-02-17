from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.graphs import router as graph_router

# create app and allow access from different origins
app = FastAPI()
app.add_middleware( CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"], )

app.include_router(graph_router)

@app.get("/")
async def root():
    return "GBTAC API"

# to run: uvicorn main:app --reload