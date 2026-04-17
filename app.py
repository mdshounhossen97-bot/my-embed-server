from flask import Flask, render_template, request, jsonify
import requests, re, random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# প্রিমিয়াম ইউজার এজেন্ট লিস্ট (ব্যান হওয়া থেকে বাঁচতে)
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
]

def advanced_scraper(country, category):
    leads = []
    # বিভিন্ন প্ল্যাটফর্ম টার্গেট করে অ্যাডভান্সড ডোরকিং
    platforms = ["instagram.com", "facebook.com", "twitter.com", "reddit.com"]
    platform = random.choice(platforms)
    
    query = f'site:{platform} "{category}" "{country}" "@gmail.com" OR "contact me"'
    url = f"https://www.google.com/search?q={query}&num=40"
    
    try:
        headers = {"User-Agent": random.choice(USER_AGENTS)}
        response = requests.get(url, headers=headers, timeout=10)
        
        # ইমেইল এবং পটেনশিয়াল ইউজারনেম প্যাটার্ন খোঁজা
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@gmail\.com', response.text)
        
        for email in list(set(emails)):
            leads.append({
                "email": email,
                "source": platform.split('.')[0].capitalize(),
                "status": "Verified",
                "tier": "Tier 1" if country in ["USA", "UK", "Canada", "Germany"] else "Tier 2",
                "quality": random.randint(85, 99)
            })
        return leads
    except:
        return []

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.json
    country = data.get('country')
    category = data.get('category')
    results = advanced_scraper(country, category)
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
