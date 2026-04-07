import sys
import asyncio
import json
from moviebox_api.v3 import MovieBox

async def search_movie(query):
    try:
        mb = MovieBox()
        
        # প্রথমে সরাসরি সার্চ করা হচ্ছে (এটি নাম বা আইডি দুইটাই হ্যান্ডেল করে)
        results = await mb.search(str(query))
        
        if not results:
            print(json.dumps({"error": "No results found"}))
            return

        # প্রথম রেজাল্টটি নিয়ে তার বিস্তারিত বের করা
        target = results[0]
        details = await mb.get_item_details(target.id, target.type)
        
        if details and details.download_urls:
            # কোয়ালিটি ফিল্টার
            urls = details.download_urls
            video = urls.get('1080p') or urls.get('720p') or urls.get('best') or list(urls.values())[0]
            
            # সাবটাইটেল
            sub = details.subtitles[0].url if details.subtitles else ""
            
            print(json.dumps({"video": video, "subtitle": sub}))
        else:
            print(json.dumps({"error": "No download links available"}))

    except Exception as e:
        # এরর মেসেজটি জেসন আকারে পাঠানো হচ্ছে যেন index.js বুঝতে পারে
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # নতুন ইভেন্ট লুপ তৈরি করে রান করা (রেন্ডারের জন্য নিরাপদ)
        asyncio.run(search_movie(sys.argv[1]))
