import sys
import asyncio
import json
from moviebox_api.v3 import MovieBox

async def get_data_by_id(tmdb_id, category):
    try:
        mb = MovieBox()
        # v3 অনুযায়ী ক্যাটাগরি সেট করা (movies অথবা tv-series)
        cat = "movies" if category == "movie" else "tv-series"
        
        # মুভিবক্স থেকে আইটেম ডিটেইলস এবং লিঙ্ক আনা
        details = await mb.get_item_details(tmdb_id, cat)
        
        if not details or not details.download_urls:
            # যদি না পাওয়া যায়, তবে সার্চ করে দেখার চেষ্টা
            search_results = await mb.search(tmdb_id)
            if search_results:
                details = await mb.get_item_details(search_results[0].id, search_results[0].type)

        video_url = ""
        if details and details.download_urls:
            # সেরা কোয়ালিটি বেছে নেওয়া
            video_url = details.download_urls.get('1080p') or details.download_urls.get('720p') or details.download_urls.get('best') or list(details.download_urls.values())[0]

        sub_url = ""
        if details and details.subtitles:
            sub_url = details.subtitles[0].url

        print(json.dumps({"video": video_url, "subtitle": sub_url}))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    # কমান্ড লাইন থেকে আইডি এবং টাইপ নেওয়া
    tid = sys.argv[1] if len(sys.argv) > 1 else ""
    tpy = sys.argv[2] if len(sys.argv) > 2 else "movie"
    asyncio.run(get_data_by_id(tid, tpy))