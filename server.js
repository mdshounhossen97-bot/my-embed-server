const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const app = express();

app.get('/fetch-stream', async (req, res) => {
    const movie = req.query.name;
    if (!movie) return res.json({ success: false });

    // সার্চ কুয়েরি যা গুগল এবং বিডিআইএক্স সার্ভারে খুঁজবে
    const searchUrl = `https://www.google.com/search?q=site:172.27.27.84+${encodeURIComponent(movie)}+OR+"index+of"+${encodeURIComponent(movie)}+mp4`;

    try {
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        let links = [];

        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('/url?q=')) {
                let clean = href.split('/url?q=')[1].split('&')[0];
                if (clean.match(/\.(mp4|mkv)$/i)) {
                    links.push(decodeURIComponent(clean));
                }
            }
        });

        // যদি কোনো লিঙ্ক না পায়, তবে সরাসরি আপনার আইপিতে একটা গেস লিঙ্ক পাঠানো (Fallback)
        if (links.length === 0) {
            links.push(`http://172.27.27.84/${movie.replace(/\s+/g, '.')}.mp4`);
        }

        res.json({ success: true, stream_url: links[0] });
    } catch (e) {
        res.json({ success: false, stream_url: `http://172.27.27.84/${movie.replace(/\s+/g, '.')}.mp4` });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('BDIX Server Running...'));
