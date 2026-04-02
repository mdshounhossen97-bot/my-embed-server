const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    const { id, type, s, e } = req.query;

    if (!id) return res.send('<h1 style="color:white;text-align:center;padding-top:20%;">Shawonflix API Active</h1>');

    // মুভিবক্সের সেই গেটওয়ে যা আপনি নেটওয়ার্ক ট্যাব থেকে পেয়েছেন
    // আমি এখানে &host=moviebox.ph নিশ্চিত করলাম
    let embedUrl = `https://www.moviebox.ph/play?id=${id}&type=${type || 1}&host=moviebox.ph`;
    
    if(type === '2') {
        embedUrl += `&s=${s || 1}&e=${e || 1}`;
    }

    // সিকিউরিটি হেডারগুলো মাস্ট দিতে হবে যাতে ব্রাউজার বাধা না দেয়
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="referrer" content="no-referrer">
            <style>body,html{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden;}iframe{width:100%;height:100%;border:none;}</style>
        </head>
        <body>
            <iframe 
                src="${embedUrl}" 
                referrerpolicy="no-referrer" 
                allowfullscreen="true" 
                allow="autoplay; encrypted-media"
                style="width:100%; height:100%;">
            </iframe>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log('Server is running!');
});
