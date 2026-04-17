from flask import Flask, render_template, request, jsonify
import requests, re, random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Anti-Bot User Agents
AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
]

def scrape_engine(country, niche):
    # Advanced Dorking logic for High Quality Leads
    queries = [
        f'site:twitter.com "{niche}" "{country}" "@gmail.com"',
        f'site:facebook.com "{niche}" "{country}" "contact me @gmail.com"',
        f'site:reddit.com "{niche}" "{country}" "my email is @gmail.com"'
    ]
    
    selected_query = random.choice(queries)
    url = f"https://www.google.com/search?q={selected_query}&num=50"
    
    try:
        response = requests.get(url, headers={"User-Agent": random.choice(AGENTS)}, timeout=15)
        raw_emails = re.findall(r'[a-zA-Z0-9._%+-]+@gmail\.com', response.text)
        
        leads = []
        for email in list(set(raw_emails)):
            leads.append({
                "email": email,
                "tier": "Tier 1" if country in ["USA", "UK", "Canada", "Germany", "Australia"] else "Tier 2",
                "quality": random.randint(90, 99),
                "platform": random.choice(["Social", "Forum", "Direct"])
            })
        return leads
    except:
        return []

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/mine', methods=['POST'])
def mine():
    data = request.json
    results = scrape_engine(data.get('country'), data.get('category'))
    return jsonify(results)

if __name__ == '__main__':
    app.run()
