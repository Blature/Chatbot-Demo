const https = require('https');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN not found');
  process.exit(1);
}

const url = `https://api.telegram.org/bot${token}/deleteWebhook`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Webhook deletion response:', data);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Error deleting webhook:', err);
  process.exit(1);
});