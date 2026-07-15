const { getStore } = require('@netlify/blobs');

// GET /.netlify/functions/counter            -> { visits, clicks }  (no increment)
// GET /.netlify/functions/counter?hit=visit  -> increments visits, returns both
// GET /.netlify/functions/counter?hit=click  -> increments clicks, returns both

exports.handler = async (event) => {
  try {
    const store = getStore('tg-landing-counters');
    const hit = event.queryStringParameters?.hit;

    let visits = parseInt((await store.get('visits')) || '0', 10);
    let clicks = parseInt((await store.get('clicks')) || '0', 10);

    if (hit === 'visit') {
      visits += 1;
      await store.set('visits', String(visits));
    } else if (hit === 'click') {
      clicks += 1;
      await store.set('clicks', String(clicks));
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ visits, clicks })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'counter unavailable' })
    };
  }
};
