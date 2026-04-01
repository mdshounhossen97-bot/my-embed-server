from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from moviebox_api.v1 import MovieAuto
import asyncio

app = FastAPI()

# সব সাইট থেকে রিকোয়েস্ট অ্যালাউ করার জন্য
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "MovieBox API is Live", "usage": "/play?q=MovieName"}

@app.get("/play")
async def get_movie(q: str):
    if not q:
        raise HTTPException(status_code=400, detail="Movie name required")
    
    try:
        auto = MovieAuto()
        # মুভিবক্স থেকে ডাটা খোঁজা
        movie_file, subtitle_file = await auto.run(q)
        
        # মুভির ডাইরেক্ট লিঙ্ক এবং সাবটাইটেল পাঠানো
        return {
            "title": q,
            "video_url": movie_file.url if hasattr(movie_file, 'url') else None,
            "stream_url": str(movie_file.saved_to) if hasattr(movie_file, 'saved_to') else None,
            "subtitle": subtitle_file.url if subtitle_file else None
        }
    except Exception as e:
        return {"error": str(e), "message": "Could not find movie on MovieBox"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)