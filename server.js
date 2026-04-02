const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    const { id, type, s, e } = req.query;

    if (!id) {
        return res.send('<h1 style="color:white;text-align:center;font-family:sans-serif;margin-top:20%;">Shawonflix Official API Player</h1>');
    }

    // মুভিবক্সের মেইন এইচ৫ এপিআই এন্ডপয়েন্ট
    const targetUrl = `https://123movienow.cc/spa/videoPlayPage/${type === '2' ? 'tv' : 'movies'}/play?id=${id}&type=${type || 1}&lang=en&host=moviebox.ph${type === '2' ? `&s=${s || 1}&e=${e || 1}` : ''}`;

    try {
        // এখানে আমরা মুভিবক্সের সিকিউরিটি হেডারের নকল করছি
        const response = await axios.get(targetUrl, {
            headers: {
                'Referer': 'https://www.moviebox.ph/',
                'Origin': 'https://www.moviebox.ph',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
                'Platform': 'h5',
                'Accept-Language': 'en-US,en;q=0.9',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        // সরাসরি প্লেয়ারের কন্টেন্ট পাঠিয়ে দিচ্ছি
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>body,html{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden;}iframe{width:100%;height:100%;border:none;}</style>
            </head>
            <body>
                <iframe src="${targetUrl}" referrerpolicy="no-referrer" allowfullscreen="true" allow="autoplay; encrypted-media"></iframe>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('<h2 style="color:white;text-align:center;">API Connection Error! Check Movie ID.</h2>');
    }
});

app.listen(port, () => {
    console.log('Shawonflix API Server is Running!');
});