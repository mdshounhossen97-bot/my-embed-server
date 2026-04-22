from fastapi import FastAPI
from moviebox_api.v1 import MovieAuto
import asyncio

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Server is Running!"}

@app.get("/get-link")
async def get_movie_link(query: str):
    try:
        # User-Agent manually set kora jay na library-te,
        # kintu Python 3.11 use korle onek somoy headers auto thik thake.
        auto = MovieAuto()
        
        # run() method search ebong link fetch duiti-i kore
        movie_file, subtitle_file = await auto.run(query)
        
        if movie_file:
            return {
                "status": "success",
                "title": query,
                "stream_url": movie_file.url,
                "subtitles": subtitle_file.url if subtitle_file else None
            }
        return {"status": "error", "message": "No movie found."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
