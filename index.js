const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// Render বা অন্য প্ল্যাটফর্মের জন্য পোর্ট সেটআপ
const PORT = process.env.PORT || 3000;

// বর্তমান সক্রিয় ডোমেইনসমূহ (এগুলো পরিবর্তন হলে শুধু এখানে আপডেট করবেন)
const DOMAINS = {
    FZMOVIES: 'https://fzmovies.ng',
    KATMOVIE: 'https://katmoviehd.nz',
    ONE_THREE_THREE_SEVEN: 'https://1337x.to'
};

// ব্রাউজার হেডার (সাইটগুলো যাতে ব্লক না করে)
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
};

// ১. হোম রুট (সার্ভার চেক করার জন্য)
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #007bff;">🎬 Movie Scraper API is Live!</h1>
            <p>Search Movies using: <code>/api/fzmovies?q=MovieName</code></p>
            <p>Active Domain: <b>${DOMAINS.FZMOVIES}</b></p>
        </div>
    `);
});

// ২. FzMovies স্ক্র্যাপার (নতুন ডোমেইন: fzmovies.ng)
app.get('/api/fzmovies', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Movie name is required (?q=name)" });

    try {
        const searchUrl = `${DOMAINS.FZMOVIES}/csearch.php?searchname=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, { headers, timeout: 10000 });
        const $ = cheerio.load(data);
        
        let results = [];
        $('.main-video-box').each((i, el) => {
            const title = $(el).find('a').attr('title') || $(el).find('h4').text().trim();
            const link = $(el).find('a').attr('href');
            const img = $(el).find('img').attr('src');

            if (link) {
                results.push({
                    title: title,
                    url: link.startsWith('http') ? link : `${DOMAINS.FZMOVIES}/${link}`,
                    img: img ? (img.startsWith('http') ? img : `${DOMAINS.FZMOVIES}/${img}`) : null
                });
            }
        });

        if (results.length === 0) return res.json({ message: "No results found", results: [] });
        res.json(results);

    } catch (err) {
        console.error("FzMovies Error:", err.message);
        res.status(500).json({ 
            error: "FzMovies access failed", 
            details: err.message,
            tried_url: DOMAINS.FZMOVIES 
        });
    }
});

// ৩. KatMovieHD স্ক্র্যাপার
app.get('/api/katmovie', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Search query required" });

    try {
        const { data } = await axios.get(`${DOMAINS.KATMOVIE}/?s=${encodeURIComponent(query)}`, { headers });
        const $ = cheerio.load(data);
        
        let results = [];
        $('.post-column').each((i, el) => {
            results.push({
                title: $(el).find('h2 a').text().trim(),
                url: $(el).find('h2 a').attr('href'),
                img: $(el).find('img').attr('src')
            });
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "KatMovieHD access failed", details: err.message });
    }
});

// ৪. 1337x স্ক্র্যাপার (Torrent)
app.get('/api/1337x', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Search query required" });

    try {
        const url = `${DOMAINS.ONE_THREE_THREE_SEVEN}/search/${encodeURIComponent(query)}/1/`;
        const { data } = await axios.get(url, { headers });
        const $ = cheerio.load(data);
        
        let results = [];
        $('table.table-list tbody tr').each((i, el) => {
            results.push({
                name: $(el).find('.name').text().trim(),
                seeds: $(el).find('.seeds').text(),
                url: DOMAINS.ONE_THREE_THREE_SEVEN + $(el).find('.name a:nth-child(2)').attr('href')
            });
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "1337x access failed", details: err.message });
    }
});

// সার্ভার স্টার্ট
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});