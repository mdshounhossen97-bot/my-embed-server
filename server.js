const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const app = express();

app.use(express.static('public'));

app.get('/get-stream', async (req, res) => {
    const movie = req.query.movie;
    // Specific search query for high-speed direct links
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(movie)}+"index+of"+(mp4|mkv)+1080p+-html+-php`;

    try {
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' }
        });

        const $ = cheerio.load(data);
        let results = [];

        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('/url?q=')) {
                let cleanLink = href.split('/url?q=')[1].split('&')[0];
                if (cleanLink.match(/\.(mp4|mkv|avi)$/i)) {
                    results.push(decodeURIComponent(cleanLink));
                }
            }
        });

        // Returns the fastest found link or the most relevant one
        res.json({ url: results.length > 0 ? results[0] : null });
    } catch (err) {
        res.status(500).json({ error: "Search Failed" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
