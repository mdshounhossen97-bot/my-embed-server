from fastapi import FastAPI
from moviebox_api.v1 import MovieBox
import httpx

app = FastAPI()

@app.get("/")
def home():
    return {"message": "MovieBox API is live!"}

@app.get("/get-link")
async def get_movie_link(query: str):
    try:
        # Browser header manually set kora
        custom_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://h5.aoneroom.com/",
            "Origin": "https://h5.aoneroom.com"
        }
        
        # httpx client-e header force kora
        async with httpx.AsyncClient(headers=custom_headers, timeout=20.0) as client:
            # MovieBox class instantiate kora
            mb = MovieBox(client=client)
            
            # Movie search kora
            results = await mb.search(query)
            
            if results and len(results) > 0:
                movie = results[0]
                # Movie-r details fetch kora (Streaming link er jonno)
                info = await mb.get_movie_info(movie.id)
                
                return {
                    "status": "success",
                    "title": movie.title,
                    "stream_url": info.url,
                    "poster": movie.poster
                }
            
        return {"status": "error", "message": "No movie found."}

    except Exception as e:
        return {"status": "error", "message": f"Security Blocked: {str(e)}"}
