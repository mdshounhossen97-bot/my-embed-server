import sys
import asyncio
import json
from moviebox_api.v3 import MovieBox  # v3 ব্যবহার করছি যা আরও লেটেস্ট

async def get_movie_data(movie_name):
    try:
        mb = MovieBox()
        # প্রথমে মুভিটি সার্চ করা হচ্ছে
        search_results = await mb.search(movie_name)
        
        if not search_results or len(search_results) == 0:
            print(json.dumps({"error": "No search results"}))
            return

        # প্রথম রেজাল্টটি নেওয়া হচ্ছে
        item = search_results[0]
        
        # মুভির বিস্তারিত এবং ডাউনলোড/স্ট্রিম লিঙ্ক আনা হচ্ছে
        details = await mb.get_item_details(item.id, item.type)
        
        # সেরা কোয়ালিটির লিঙ্ক খুঁজে বের করা
        video_url = ""
        if details.download_urls:
            # ১০৮০পি বা ৭২০পি লিঙ্ক খোঁজা হচ্ছে
            video_url = details.download_urls.get('1080p') or details.download_urls.get('720p') or list(details.download_urls.values())[0]

        result = {
            "video": video_url,
            "subtitle": details.subtitles[0].url if details.subtitles else ""
        }
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = sys.argv[1]
        asyncio.run(get_movie_data(query))
