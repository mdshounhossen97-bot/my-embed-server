from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import moviebox_api

app = Flask(__name__)
CORS(app)

async def fetch_moviebox_link(query):
    try:
        # লেটেস্ট ভার্সনে মুভিবক্স অবজেক্ট তৈরি
        mb = moviebox_api.MovieBox()
        
        # মুভি সার্চ করা
        results = await mb.search(str(query))
        if not results:
            return {"error": "Content not found"}
        
        item = results[0]
        # মুভির বিস্তারিত এবং লিঙ্ক নেওয়া
        details = await mb.get_item_details(item.id, item.type)
        
        if details and details.download_urls:
            # ১০৮০পি বা অন্য কোনো এভেইলেবল লিঙ্ক নেওয়া
            urls = details.download_urls
            video = urls.get('1080p') or urls.get('720p') or list(urls.values())[0]
            sub = details.subtitles[0].url if details.subtitles else ""
            
            return {
                "success": True,
                "title": item.title,
                "video": video,
                "subtitle": sub
            }
        return {"error": "No streaming link found"}
    except Exception as e:
        return {"error": str(e)}

@app.route('/')
def home():
    return "MovieBox API is Live and Running!"

@app.route('/stream')
def stream():
    query = request.args.get('id')
    if not query:
        return jsonify({"error": "Provide Movie ID or Name"}), 400
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(fetch_moviebox_link(query))
    return jsonify(result)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
