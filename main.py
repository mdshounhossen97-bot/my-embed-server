from fastapi import FastAPI
from moviebox_api.v1 import MovieAuto
import uvicorn
import os

app = FastAPI()

@app.get("/")
def home():
    return {"message": "MovieBox API is live!"}

@app.get("/get-link")
async def get_movie_link(query: str):
    try:
        # MovieAuto default vabe nijer client setup kore ney
        auto = MovieAuto()
        
        # run() function-ti movie search ebong info collect korbe
        # Local-e download hoyar chesta korle Render-e problem hote pare, 
        # tai amra sudhu metadata fetch korar chesta korchi
        movie_file, subtitle_file = await auto.run(query)
        
        if movie_file:
            return {
                "status": "success",
                "title": query,
                "stream_url": movie_file.url,
                "size": movie_file.size,
                "subtitles": subtitle_file.url if subtitle_file else None
            }
        
        return {"status": "error", "message": "No movie found."}

    except Exception as e:
        # Error details dekhabe jate amra bujhte pari keno block hocche
        return {"status": "error", "message": f"Details: {str(e)}"}

if __name__ == "__main__":
    # Render-er assigned port-e run korbe
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
