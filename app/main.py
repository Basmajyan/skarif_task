from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints.annotations import router

app = FastAPI()

# configure cors
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # allow all origins (dev mode)
    allow_methods=["*"],  # allow all methods (dev mode)
    allow_headers=["*"],  # allow all headers (dev mode)
)

# include routes
app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {"message": "hello world"}
