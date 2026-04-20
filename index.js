const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Shawonflix Premium Player is Online!');
});

app.get('/embed', (req, res) => {
  const { id, type } = req.query;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shawonflix Premium Player</title>
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .player-wrapper { position: relative; width: 100%; height: 100vh; background: #000; }
        
        /* Premium Loader */
        #loader { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #E50914; font-size: 20px; font-weight: bold; z-index: 99; }
        
        iframe { width: 100%; height: 100%; border: none; }

        /* Overlay to block unwanted clicks if any */
        .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 80px; z-index: 10; }
      </style>
    </head>
    <body>
      <div id="loader">N E T F L I X</div>
      <div class="player-wrapper">
        <div class="overlay"></div>
        <iframe 
          id="premium-player"
          src="https://vidsrc.icu/embed/\${type === 'tv' ? 'tv' : 'movie'}/\${id}" 
          allowfullscreen 
          scrolling="no" 
          allow="autoplay; encrypted-media"
          sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation">
        </iframe>
      </div>

      <script>
        const iframe = document.getElementById('premium-player');
        const loader = document.getElementById('loader');

        // লোড হয়ে গেলে লোডার সরিয়ে ফেলবে
        iframe.onload = () => {
          loader.style.display = 'none';
        };

        // ২০২৬ সালের হাই-কোয়ালিটি সোর্স হ্যান্ডলার
        window.addEventListener('message', function(e) {
            // সোর্স যদি কাজ না করে তবে ব্যাকআপ সোর্সে সুইচ করবে
            if (e.data === 'error') {
                iframe.src = "https://vidlink.pro/embed/\${type === 'tv' ? 'tv' : 'movie'}/\${id}?primaryColor=e50914";
            }
        });
      </script>
    </body>
    </html>
  `);
});

app.listen(port, () => console.log('Premium Streaming Server Ready!'));
