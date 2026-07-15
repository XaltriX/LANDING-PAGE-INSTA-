// GET /.netlify/functions/channel-info -> { name, description, memberCount }
// Requires env vars TG_BOT_TOKEN and TG_CHAT_ID set in the Netlify dashboard.
// The bot must be an admin of the channel.

exports.handler = async () => {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token || !chatId) {
    return json(500, { error: 'Missing TG_BOT_TOKEN or TG_CHAT_ID environment variable' });
  }

  try {
    const chatRes = await fetch(
      `https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(chatId)}`
    );
    const chatData = await chatRes.json();

    if (!chatData.ok) {
      return json(502, { error: 'Telegram API error', detail: chatData.description });
    }

    let memberCount = null;
    try {
      const countRes = await fetch(
        `https://api.telegram.org/bot${token}/getChatMemberCount?chat_id=${encodeURIComponent(chatId)}`
      );
      const countData = await countRes.json();
      if (countData.ok) memberCount = countData.result;
    } catch (e) {
      // member count is a nice-to-have, don't fail the whole response over it
    }

    return json(200, {
      name: chatData.result.title || '',
      description: chatData.result.description || '',
      memberCount
    });
  } catch (err) {
    return json(500, { error: 'Fetch to Telegram failed' });
  }
};

function json(status, body) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=120'
    },
    body: JSON.stringify(body)
  };
}
