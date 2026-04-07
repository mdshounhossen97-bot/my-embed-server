import sys
import asyncio
import json
from moviebox_api.v3 import MovieBox

async def run_search(query):
    try:
        mb = MovieBox()
        # প্রথমে সরাসরি আইডি দিয়ে ডিটেইলস খোঁজা
        details = await mb.get_item_details(query, "movies")
        
        # যদি আইডি দিয়ে না পায়, তবে সার্চ করবে
        if not details or not details.download_urls:
            search_results = await mb.search(str(query))
            if search_results:
                details = await mb.get_item_details(search_results[0].id, search_results[0].type)
        
        if details and details.download_urls:
            # কোয়ালিটি ফিল্টার: ১০৮০পি না থাকলে ৭২০পি বা বেস্ট
            urls = details.download_urls
            video = urls.get('1080p') or urls.get('720p') or urls.get('best') or list(urls.values())[0]
            sub = details.subtitles[0].url if details.subtitles else ""
            print(json.dumps({"video": video, "subtitle": sub}))
        else:
            print(json.dumps({"error": "No links found"}))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        asyncio.run(run_search(sys.argv[1]))
