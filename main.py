from fastapi import FastAPI
from moviebox_api.v1 import MovieAuto
import asyncio

app = FastAPI()

@app.get("/")
def home():
    return {"message": "MovieBox API is live!"}

@app.get("/get-link")
async def get_movie_link(query: str):
    try:
        # MovieAuto class instantiate kora
        auto = MovieAuto()
        
        # 'run' method-ti movie search kore file info return kore
        # Amra ekhane download avoid korar chesta korbo
        movie_file, subtitle_file = await auto.run(query)
        
        if movie_file:
            return {
                "status": "success",
                "title": query,
                "stream_url": movie_file.url,  # Direct streaming link
                "size": movie_file.size,
                "subtitles": subtitle_file.url if subtitle_file else None
            }
        
        return {"status": "error", "message": "No movie found with this name."}

    except Exception as e:
        return {"status": "error", "message": f"Something went wrong: {str(e)}"}
