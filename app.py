from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
from moviebox_api import MovieBoxV3

app = Flask(__name__)
CORS(app)

async def get_link(query):
    try:
        # মুভিবক্স ভি৩ ইঞ্জিন চালু করা
        engine = MovieBoxV3()
        
        # মুভি সার্চ করা
        search_results = await engine.search(str(query))
        if not search_results:
            return {"error": "No results found for this movie."}
        
        # প্রথম রেজাল্টটি নেওয়া
        movie = search_results[0]
        
        # মুভির ভেতরের লিংক এবং ডিটেইলস বের করা
        details = await engine.get_item_details(movie.id, movie.type)
        
        # ভিডিও লিংক চেক করা
        if details and details.download_urls:
            # ১০৮০পি বা বেস্ট কোয়ালিটি লিংক নেওয়া
            video_url = details.download_urls.get('1080p') or \
                        details.download_urls.get('720p') or \
                        list(details.download_urls.values())[0]
            
            return {
                "success": True,
                "title": movie.title,
                "video": video_url,
                "type": movie.type
            }
        else:
            return {"error": "Video link not found in details."}
            
    except Exception as e:
        return {"error": f"Internal Server Error: {str(e)}"}

@app.route('/')
def home():
    return "MovieBox API is Live - Final Working Build"

@app.route('/stream')
def stream():
    movie_id = request.args.get('id')
    if not movie_id:
        return jsonify({"error": "Please provide a movie name or ID. Example: /stream?id=Avatar"}), 400
    
    # নতুন লুপ তৈরি করে অ্যাসিনক্রোনাস ফাংশন রান করা
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(get_link(movie_id))
    loop.close()
    
    return jsonify(result)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
