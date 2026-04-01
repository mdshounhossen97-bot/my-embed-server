const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Proxy route: তোমার Blogger থেকে /moviebox এ গেলে moviebox.ph এ যাবে
app.use("/moviebox", createProxyMiddleware({
  target: "https://moviebox.ph",
  changeOrigin: true,
  pathRewrite: { "^/moviebox": "" }
}));

// Root test
app.get("/", (req, res) => {
  res.send("Reverse Proxy Server is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
