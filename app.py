from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import moviebox_api

app = Flask(__name__)
CORS(app)

async def fetch_moviebox_link(query):
    try:
        # মুভিবক্সের নতুন ভার্সন অনুযায়ী সরাসরি ফাংশন কল করা
        # যদি MovieBox ক্লাস না থাকে, তবে এটি সরাসরি মডিউল লেভেলে থাকতে পারে
        results = await moviebox_api.search(str(query))
        
        if not results:
            return {"error": "Content not found"}
        
        item = results[0]
        # আইটেম ডিটেইলস নেওয়া
        details = await moviebox_api.get_item_details(item.id, item.type)
        
        if details and hasattr(details, 'download_urls') and details.download_urls:
            urls = details.download_urls
            # লিঙ্ক বাছাই করা
            video = urls.get('1080p') or urls.get('720p') or list(urls.values())[0]
            sub = details.subtitles[0].url if hasattr(details, 'subtitles') and details.subtitles else ""
            
            return {
                "success": True,
                "title": item.title,
                "video": video,
                "subtitle": sub
            }
        return {"error": "No streaming link found in details"}
    except Exception as e:
        # যদি উপরের নিয়মে কাজ না হয়, তবে বিকল্প উপায়ে চেষ্টা
        try:
            mb = moviebox_api.MovieBoxV3() # কিছু ভার্সনে এটাকে V3 বলা হয়
            results = await mb.search(str(query))
            item = results[0]
            details = await mb.get_item_details(item.id, item.type)
            video = list(details.download_urls.values())[0]
            return {"success": True, "video": video}
        except:
            return {"error": f"API Error: {str(e)}"}

@app.route('/')
def home():
    return "MovieBox API is Live - Running Final Build"

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
