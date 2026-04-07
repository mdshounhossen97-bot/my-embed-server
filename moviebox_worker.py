import sys
import asyncio
import json
from moviebox_api.v3 import MovieBox

async def get_video():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No ID provided"}))
            return

        query = sys.argv[1]
        mb = MovieBox()
        
        # প্রথমে সার্চ করা হচ্ছে যেন মুভিটি খুঁজে পাওয়া যায়
        results = await mb.search(str(query))
        
        if results:
            # প্রথম রেজাল্ট থেকে লিঙ্ক বের করা
            item = results[0]
            details = await mb.get_item_details(item.id, item.type)
            
            if details and details.download_urls:
                # 1080p বা সেরা লিঙ্কটি নেওয়া হচ্ছে
                urls = details.download_urls
                video = urls.get('1080p') or urls.get('720p') or urls.get('best') or list(urls.values())[0]
                
                # সাবটাইটেল থাকলে নেওয়া
                sub = details.subtitles[0].url if details.subtitles else ""
                
                print(json.dumps({"video": video, "subtitle": sub}))
            else:
                print(json.dumps({"error": "No links found for this movie"}))
        else:
            print(json.dumps({"error": "Movie not found in Moviebox"}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    asyncio.run(get_video())
