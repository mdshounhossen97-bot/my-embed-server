from fastapi import FastAPI
from moviebox_api.v1 import MovieAuto
import asyncio

app = FastAPI()

@app.get("/get-link")
async def get_movie_link(query: str):
    try:
        auto = MovieAuto()
        # movie search korbe kintu file download korbe na, sudhu data fetch korbe
        movie_data = await auto.search_movie(query) 
        
        if movie_data:
            return {
                "status": "success",
                "title": movie_data[0].title,
                "stream_url": movie_data[0].url, # Streaming link
                "thumbnail": movie_data[0].poster
            }
        return {"status": "error", "message": "Movie not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
