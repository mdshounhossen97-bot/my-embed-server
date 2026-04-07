import sys
import asyncio
import json
from moviebox_api.v1 import MovieAuto

async def get_movie_data(movie_name):
    try:
        # মুভি সার্চ এবং লিঙ্ক খোঁজা
        auto = MovieAuto(quality="720p")
        movie_file, subtitle_file = await auto.run(movie_name)
        
        # ডাটাগুলো JSON ফরম্যাটে পাঠানো হচ্ছে যেন Node.js সহজে বুঝতে পারে
        result = {
            "video": movie_file.url,
            "subtitle": subtitle_file.url if subtitle_file else ""
        }
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        movie_name = sys.argv[1]
        asyncio.run(get_movie_data(movie_name))