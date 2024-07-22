import express from 'express';
import https from 'https';
import fs from 'fs';

import BotService from './botService.js';

const sslOptions = {
  key: fs.readFileSync(
    `/etc/letsencrypt/live/${process.env.SERVER_DOMAIN}/privkey.pem`,
  ),
  cert: fs.readFileSync(
    `/etc/letsencrypt/live/${process.env.SERVER_DOMAIN}/fullchain.pem`,
  ),
};

// Setup bot
const webHookUrl = `${process.env.SERVER_URL}/webhook/${process.env.TG_BOT_TOKEN}`;
const bot = new BotService(webHookUrl);
// Setup server
const app = express();
const port = process.env.SERVER_HTTPS_PORT || 443;
app.use(express.json());

app.post(`/webhook/${process.env.TG_BOT_TOKEN}`, (req, res) => {
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing update:', error);
    res.sendStatus(500);
  }
});

// HTTPS server on port 443
https.createServer(sslOptions, app).listen(port, () => {
  console.log(
    `Server is running on https://${process.env.SERVER_DOMAIN}:${port}`,
  );
  // Start bot
  bot.start();
});
