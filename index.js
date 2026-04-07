const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// সার্ভার চালু আছে কিনা বোঝার জন্য হোম পেজ
app.get('/', (req, res) => {
    res.send("Server is Live! Use /watch?id=movie_id to fetch.");
});

// মেইন এপিআই এন্ডপয়েন্ট
app.get('/watch', async (req, res) => {
    // এখানে id অথবা name যেকোনোটি থাকলেই ডাটা নিবে
    const movieId = req.query.id || req.query.name; 

    if (!movieId) {
        return res.status(400).json({ error: "Movie ID or Name is required" });
    }

    // আপনার দেওয়া সাইটগুলো থেকে ডাটা খোঁজার সিম্পল লজিক
    const sources = [
        { 
            source: "Source 1", 
            url: `https://movies.123movies.hk/movie/detail/${movieId}` 
        },
        { 
            source: "Source 2", 
            url: `https://movielinkbd.one/?s=${movieId}` 
        }
    ];

    res.json({
        success: true,
        id: movieId,
        results: sources
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
