from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.cistern import router as cistern_router

# import routers here
from routers.graphs import router as graph_router

app = FastAPI()
app.add_middleware( CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"], )

# add routers here
app.include_router(graph_router)
app.include_router(cistern_router)

@app.get("/")
async def root():
    return "GBTAC API"

# to run: uvicorn main:app --reload