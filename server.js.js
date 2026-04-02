const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// এটি আপনার মেইন হোমপেজ এবং প্লেয়ার হিসেবে কাজ করবে
app.get('/', (req, res) => {
    const { id, type, s, e } = req.query;

    // যদি কোনো আইডি না দেওয়া থাকে, তবে একটি সিম্পল মেসেজ দেখাবে
    if (!id) {
        return res.send(`
            <div style="background:#000; color:#fff; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif;">
                <h1>Shawonflix Player is Ready!</h1>
            </div>
        `);
    }

    // মুভিবক্সের সেই এপিআই লিঙ্ক যা দিয়ে ভিডিও প্লে হবে
    let target = `https://123movienow.cc/spa/videoPlayPage/${type === '2' ? 'tv' : 'movies'}/play?id=${id}&type=${type || 1}&lang=en&host=moviebox.ph`;
    
    if(type === '2') {
        target += `&s=${s || 1}&e=${e || 1}`;
    }

    // সরাসরি রেসপন্স হিসেবে প্লেয়ার পাঠিয়ে দিবে
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>body,html{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden;}iframe{width:100%;height:100%;border:none;}</style>
        </head>
        <body>
            <iframe src="${target}" referrerpolicy="no-referrer" allowfullscreen="true" allow="autoplay; encrypted-media"></iframe>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
