const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// মেইন রাউট যা আপনার ব্লগে দেখাবে
app.get('/', (req, res) => {
    const { id, type, s, e } = req.query;
    if (!id) return res.send("Shawonflix Player: No ID provided");

    // মুভিবক্সের সেই এপিআই লিঙ্ক যা আপনি বের করেছেন
    let target = `https://123movienow.cc/spa/videoPlayPage/${type === '2' ? 'tv' : 'movies'}/play?id=${id}&type=${type || 1}&lang=en&host=moviebox.ph`;
    if(type === '2') target += `&s=${s || 1}&e=${e || 1}`;

    // সরাসরি HTML রিটার্ন করবে যা আইফ্রেমকে ধোঁকা দেবে
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>body,html{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden;}iframe{width:100%;height:100%;border:none;}</style>
        </head>
        <body>
            <iframe src="${target}" referrerpolicy="no-referrer" allowfullscreen="true" allow="autoplay; encrypted-media"></iframe>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server is running!`);
});
