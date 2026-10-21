import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function galeri24DevPlugin() {
  return {
    name: 'galeri24-dev-plugin',
    configureServer(server) {
      server.middlewares.use('/api/gold-prices', async (req, res) => {
        try {
          const response = await fetch('https://galeri24.co.id/harga-emas', {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });
          const html = await response.text();

          const rowRegex = /<div class="grid grid-cols-5 divide-x[^"]*">[\s\S]*?<div class="[^"]*">([0-9\.]+)<\/div>[\s\S]*?<div class="[^"]*">Rp([0-9\.,]+)<\/div>[\s\S]*?<div class="[^"]*">Rp([0-9\.,]+)<\/div>/g;
          let m;
          const table = [];
          while ((m = rowRegex.exec(html)) !== null) {
            const grams = parseFloat(m[1]);
            const sell = parseInt(m[2].replace(/\./g, ''), 10);
            const buyback = parseInt(m[3].replace(/\./g, ''), 10);
            if (!isNaN(grams) && !isNaN(sell)) {
              table.push({ grams, sell, buyback });
            }
          }

          const oneGram = table.find(r => Math.abs(r.grams - 1.0) < 0.001);
          const sellPrice = oneGram ? oneGram.sell : 2510000;
          const buybackPrice = oneGram ? oneGram.buyback : 2363000;

          const todayDate = new Date();
          const dateStr = todayDate.toISOString().split('T')[0];
          const dateLabel = `Hari Ini (${todayDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}) - galeri24.co.id`;

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            source: 'https://galeri24.co.id/harga-emas',
            date: dateStr,
            dateLabel,
            sellPrice,
            buybackPrice,
            table: table.length > 0 ? table : null
          }));
        } catch (err) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), galeri24DevPlugin()],
})

