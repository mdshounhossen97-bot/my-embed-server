import sys
import asyncio
import json
from moviebox_api.v3 import MovieBox

async def get_by_id(tmdb_id):
    try:
        mb = MovieBox()
        # এখানে এপিআই এর মাধ্যমে আইডি দিয়ে ডাইরেক্ট মুভি খোঁজার চেষ্টা করা হচ্ছে
        # যদি মুভিবক্সের নিজস্ব ডাটাবেসে এই টিএমডিবি আইডি থাকে তবে সে এটি খুঁজে পাবে
        details = await mb.get_item_details(tmdb_id, "movies")
        
        video_url = ""
        if details and details.download_urls:
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
        asyncio.run(get_by_id(sys.argv[1]))
