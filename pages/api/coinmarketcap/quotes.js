export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ids, convert = 'USD' } = req.body;

  if (!ids) {
    return res.status(400).json({ error: 'Missing required parameter: ids' });
  }

  try {
    const apiKey = process.env.COINMARKETCAP_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'CoinMarketCap API key not configured' });
    }

    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${ids}&convert=${convert}`,
      {
        method: 'GET',
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json',
          'Accept-Encoding': 'deflate, gzip'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CoinMarketCap API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `CoinMarketCap API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    // Check for API-level errors
    if (data.status && data.status.error_code !== 0) {
      console.error('CoinMarketCap API status error:', data.status);
      return res.status(400).json({ 
        error: 'CoinMarketCap API error',
        details: data.status.error_message
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching CoinMarketCap quotes:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}