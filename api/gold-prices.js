// Vercel Serverless Function: Fetch live gold prices from Galeri 24 Pegadaian
export default async function handler(req, res) {
  try {
    const response = await fetch('https://galeri24.co.id/harga-emas', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`Galeri 24 responded with status ${response.status}`);
    }

    const html = await response.text();

    // Regex to match Galeri 24 official price table rows
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

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(200).json({
      success: true,
      source: 'https://galeri24.co.id/harga-emas',
      date: dateStr,
      dateLabel,
      sellPrice,
      buybackPrice,
      table: table.length > 0 ? table : null
    });
  } catch (error) {
    console.error('Error fetching Galeri 24 gold prices:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      fallback: {
        sellPrice: 2510000,
        buybackPrice: 2363000,
        dateLabel: '21 Okt 2026 (galeri24.co.id)'
      }
    });
  }
}
