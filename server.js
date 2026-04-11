const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const path = require('path');

app.use(express.static('public'));

// এটি বিভিন্ন সোর্স থেকে ভিডিও লিঙ্ক খুঁজে বের করবে
async function scrapeDirectLink(movieName) {
    const searchQueries = [
        `https://www.google.com/search?q=intitle:index.of+${encodeURIComponent(movieName)}+mp4+1080p`,
        `https://www.google.com/search?q=${encodeURIComponent(movieName)}+direct+link+mp4`
    ];

    let foundLinks = [];

    for (let url of searchQueries) {
        try {
            const { data } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $ = cheerio.load(data);
            
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (href && href.startsWith('/url?q=')) {
                    let clean = href.split('/url?q=')[1].split('&')[0];
                    if (clean.match(/\.(mp4|mkv)$/i)) {
                        foundLinks.push(decodeURIComponent(clean));
                    }
                }
            });
        } catch (e) { continue; }
    }
    return foundLinks;
}

app.get('/fetch-stream', async (req, res) => {
    const movie = req.query.name;
    if (!movie) return res.status(400).send("No Movie Name");

    const links = await scrapeDirectLink(movie);
    
    // সবচাইতে ভালো লিঙ্কটি পাঠানো হচ্ছে
    if (links.length > 0) {
        res.json({ success: true, stream_url: links[0] });
    } else {
        res.json({ success: false, message: "No Direct Link Found" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Engine Live on ${PORT}`));
