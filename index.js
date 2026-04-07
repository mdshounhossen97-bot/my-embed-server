const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// ১. Fzmovies Scraper Logic
async function scrapeFzMovies(movieName) {
    try {
        const searchUrl = `https://fzmovies.free.nf/search.php?name=${encodeURIComponent(movieName)}`;
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);
        // এখানে আপনার দেওয়া সাইটের স্ট্রাকচার অনুযায়ী লিঙ্ক খোঁজা হবে
        const link = $('.movielink').first().attr('href'); 
        return link ? { source: "FZMovies", url: link } : null;
    } catch (e) { return null; }
}

// ২. MovieLinkBD Scraper Logic
async function scrapeMovieLinkBD(movieName) {
    try {
        const searchUrl = `https://movielinkbd.one/?s=${encodeURIComponent(movieName)}`;
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);
        const link = $('article a').first().attr('href');
        return link ? { source: "MovieLinkBD", url: link } : null;
    } catch (e) { return null; }
}

// ৩. মেইন এপিআই এন্ডপয়েন্ট
app.get('/watch', async (req, res) => {
    const movieName = req.query.name;
    if (!movieName) return res.status(400).json({ error: "Movie name is required" });

    // সব সোর্স থেকে ডাটা খোঁজা
    const results = await Promise.all([
        scrapeFzMovies(movieName),
        scrapeMovieLinkBD(movieName)
        // এখানে আপনার বাকি ১০টি সাইটের ফাংশন একইভাবে যোগ হবে
    ]);

    const validResults = results.filter(r => r !== null);
    res.json({
        movie: movieName,
        total_sources: validResults.length,
        sources: validResults
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});