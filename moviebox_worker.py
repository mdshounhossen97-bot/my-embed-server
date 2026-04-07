import sys
import asyncio
import json
import os

# এটি নিশ্চিত করবে যে লাইব্রেরিটি লোড হচ্ছে
try:
    from moviebox_api.v3 import MovieBox
except ImportError:
    # যদি লাইব্রেরি না পায় তবে অটো ইন্সটল করার চেষ্টা করবে
    os.system('pip install moviebox-api')
    from moviebox_api.v3 import MovieBox

async def get_data(tmdb_id):
    try:
        mb = MovieBox()
        # মুভিবক্স অনেক সময় সরাসরি আইডি চেনে না, তাই আমরা সার্চ করছি
        search_results = await mb.search(str(tmdb_id))
        
        target = None
        if search_results:
            target = search_results[0]
        else:
            # যদি কিছু না পায় তবে একটা রেন্ডম সার্চ ট্রাই করবে (টেস্টের জন্য)
            print(json.dumps({"error": "No results found"}))
            return

        details = await mb.get_item_details(target.id, target.type)
        
        video_url = ""
        if details and details.download_urls:
            # সিরিয়াল অনুযায়ী কোয়ালিটি চেক
            urls = details.download_urls
            video_url = urls.get('1080p') or urls.get('720p') or urls.get('best') or list(urls.values())[0]

        sub_url = ""
        if details and details.subtitles:
            sub_url = details.subtitles[0].url

        print(json.dumps({"video": video_url, "subtitle": sub_url}))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        asyncio.run(get_data(sys.argv[1]))
