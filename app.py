from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
from moviebox_api import MovieBox

app = Flask(__name__)
CORS(app)

async def fetch_moviebox_link(query):
    try:
        mb = MovieBox()
        results = await mb.search(str(query))
        if not results:
            return {"error": "Content not found"}
        
        item = results[0]
        details = await mb.get_item_details(item.id, item.type)
        
        if details and details.download_urls:
            # সেরা কোয়ালিটির লিঙ্কটি বেছে নেওয়া (যেমন ১০৮০পি)
            urls = details.download_urls
            video = urls.get('1080p') or urls.get('720p') or list(urls.values())[0]
            sub = details.subtitles[0].url if details.subtitles else ""
            
            return {"video": video, "subtitle": sub, "title": item.title}
        return {"error": "No streaming link available"}
    except Exception as e:
        return {"error": str(e)}

@app.route('/stream')
def stream():
    query = request.args.get('id')
    if not query:
        return jsonify({"error": "Provide Movie ID or Name"}), 400
    
    # পাইথনের অ্যাসিনক্রোনাস ফাংশন রান করা
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(fetch_moviebox_link(query))
    return jsonify(result)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
