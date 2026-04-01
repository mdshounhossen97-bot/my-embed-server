const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// রেন্ডার পোর্টের জন্য সেটিংস
const PORT = process.env.PORT || 3000;

// কমন হেডার (এটি দিলে সাইটগুলো মনে করবে আপনি আসল ইউজার)
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
};

// ১. হোম রুট (যাতে Cannot GET / না দেখায়)
app.get('/', (req, res) => {
    res.send('<h1>Movie Scraper API is Running!</h1><p>Use /api/fzmovies?q=MovieName to search.</p>');
});

// ২. FzMovies স্ক্র্যাপার
app.get('/api/fzmovies', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Please provide a movie name (?q=...)" });

    try {
        const searchUrl = `https://fzmovies.net/csearch.php?searchname=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, { headers });
        const $ = cheerio.load(data);
        
        let results = [];
        $('.main-video-box').each((i, el) => {
            const title = $(el).find('a').attr('title') || $(el).find('h4').text().trim();
            const link = $(el).find('a').attr('href');
            const img = $(el).find('img').attr('src');

            if (link) {
                results.push({
                    title: title,
                    url: link.startsWith('http') ? link : `https://fzmovies.net/${link}`,
                    img: img ? (img.startsWith('http') ? img : `https://fzmovies.net/${img}`) : null
                });
            }
        });

        if (results.length === 0) {
            return res.json({ message: "No movies found for this search.", results: [] });
        }

        res.json(results);
    } catch (err) {
        console.error("FzMovies Error:", err.message);
        res.status(500).json({ 
            error: "FzMovies access failed", 
            details: err.message,
            tip: "The site might be blocking the server IP or the domain has changed."
        });
    }
});

// ৩. KatMovieHD স্ক্র্যাপার
app.get('/api/katmovie', async (req, res) => {
    const query = req.query.q;
    try {
        const { data } = await axios.get(`https://katmoviehd.nz/?s=${encodeURIComponent(query)}`, { headers });
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

// ৪. 1337x স্ক্র্যাপার (টরেন্ট)
app.get('/api/1337x', async (req, res) => {
    const query = req.query.q;
    try {
        const url = `https://1337x.to/search/${encodeURIComponent(query)}/1/`;
        const { data } = await axios.get(url, { headers });
        const $ = cheerio.load(data);
        
        let results = [];
        $('table.table-list tbody tr').each((i, el) => {
            results.push({
                name: $(el).find('.name').text().trim(),
                seeds: $(el).find('.seeds').text(),
                url: 'https://1337x.to' + $(el).find('.name a:nth-child(2)').attr('href')
            });
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "1337x access failed", details: err.message });
    }
});

// সার্ভার চালু করা
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});