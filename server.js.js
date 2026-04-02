const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    const { id, type, s, e } = req.query;

    if (!id) {
        return res.send('<h1 style="color:white;text-align:center;padding-top:20%;">Shawonflix Player is Ready!</h1>');
    }

    // মুভিবক্সের সেই অরিজিনাল এপিআই লিঙ্ক
    let movieUrl = `https://123movienow.cc/spa/videoPlayPage/${type === '2' ? 'tv' : 'movies'}/play?id=${id}${String.fromCharCode(38)}type=${type || 1}${String.fromCharCode(38)}lang=en${String.fromCharCode(38)}host=moviebox.ph`;
    
    if(type === '2') {
        movieUrl += `${String.fromCharCode(38)}s=${s || 1}${String.fromCharCode(38)}e=${e || 1}`;
    }

    // এই অংশটুকু মুভিবক্সকে ধোঁকা দেবে
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
                src="${movieUrl}" 
                referrerpolicy="no-referrer" 
                allowfullscreen="true" 
                sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                style="width:100%; height:100%;">
            </iframe>
            <script>
                // যদি ফ্রেম লোড না হয় তবে অটো রিফ্রেশ বা এরর হ্যান্ডেল করার জন্য
                window.addEventListener('message', function(e) {
                    if(e.data === '404') document.body.innerHTML = '<h2 style="color:white;text-align:center;">Video Not Found on MovieBox</h2>';
                });
            </script>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log('Server is running!');
});
