const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// হোম পেজ (সার্ভার চেক করার জন্য)
app.get('/', (req, res) => {
    res.send("Server is Live! Use /watch?id=movie_id&s=1 to fetch.");
});

// মেইন এপিআই এন্ডপয়েন্ট
app.get('/watch', async (req, res) => {
    const movieId = req.query.id || req.query.name;
    const s = req.query.s || '1'; // আপনার ১২টি সাইটের সোর্স নম্বর

    if (!movieId) {
        return res.status(400).json({ error: "Movie ID or Name is required" });
    }

    // আপনার দেওয়া ১২টি সাইটের লিস্ট (সঠিক ফরম্যাটে)
    const sources = {
        '1': `https://movies.123movies.hk/movie/detail/${movieId}`,
        '2': `https://movielinkbd.one/?s=${movieId}`,
        '3': `https://fzmovies.free.nf/search.php?name=${movieId}`,
        '4': `https://moviebox.ph/search?keyword=${movieId}`,
        '5': `https://dotmovies.com.es/?s=${movieId}`,
        '6': `https://bolly4u.org/?s=${movieId}`,
        '7': `https://vegamovies.ngo/?s=${movieId}`,
        '8': `https://sflix.to/search/${movieId}`,
        '9': `https://lookmovie.foundation/movies/view/${movieId}`,
        '10': `https://hdtoday.tv/search/${movieId}`,
        '11': `https://tamilrockers.ws/index.php?find=${movieId}`,
        '12': `https://mlwbd.com/?s=${movieId}`
    };

    // নির্দিষ্ট সোর্সের লিঙ্ক খুঁজে বের করা
    const finalUrl = sources[s] || sources['1'];

    // এটিই আসল কাজ করবে: প্লেয়ারকে সরাসরি মুভি সাইটে পাঠিয়ে দিবে
    res.redirect(finalUrl);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
