// GET /.netlify/functions/channel-photo -> raw image bytes of the channel's photo
// Streams the image server-side so the bot token never appears in a URL the browser sees.

exports.handler = async () => {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token || !chatId) {
    return { statusCode: 500, body: 'Missing env vars' };
  }

  try {
    const chatRes = await fetch(
      `https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(chatId)}`
    );
    const chatData = await chatRes.json();
    const fileId = chatData.result?.photo?.big_file_id || chatData.result?.photo?.small_file_id;
    if (!fileId) return { statusCode: 404, body: 'No photo set' };

    const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json();
    const filePath = fileData.result?.file_path;
    if (!filePath) return { statusCode: 404, body: 'File path not found' };

    const imgRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': imgRes.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 500, body: 'Failed to fetch photo' };
  }
};
