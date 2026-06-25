// netlify/functions/ask-claude.js
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing prompt' })
      };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'AI request failed' })
      };
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    return {
      statusCode: 200,
      body: JSON.stringify({ text })
    };
  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
