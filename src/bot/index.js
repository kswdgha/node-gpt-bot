import TelegramBot from 'node-telegram-bot-api';

import ChatGPT from '../lib/index.js';

class BotService {
  constructor() {
    this._bot = new TelegramBot(process.env.TG_BOT_TOKEN, { polling: true });
    this._openChats = {};
    this._inactivityTimeout = 300000; // 5 minutes
  }

  async start() {
    // Init commands
    await this._bot.setMyCommands([
      { command: 'start', description: 'Start a new chat' },
    ]);

    // Setup inactivity tracking
    this._resetInactivityTimer(); // Bot will stop polling after timeout if inactive

    // Incoming messages handler (only text)
    this._bot.on('text', async (msg) => {
      // Update activity
      this._resetInactivityTimer();

      const text = msg.text;
      const chatId = msg.chat.id;

      // Init new chat
      if (text === '/start') {
        // Create new chat, save it by user chatId
        this._openChats[chatId] = { gpt: new ChatGPT(), isProcessing: false };
        await this._bot.sendMessage(chatId, 'How can I help you?');
        return;
      }

      // /start command is required
      if (!Object.hasOwn(this._openChats, chatId)) {
        await this._bot.sendMessage(
          chatId,
          'You should start a new chat first (send /start command)',
        );
        return;
      }

      // Prevent from flooding with requests to gpt
      if (this._openChats[chatId].isProcessing) {
        await this._bot.sendMessage(chatId, 'Please wait...');
      }

      // Main flow
      this._openChats[chatId].isProcessing = true;

      try {
        await this._bot.sendMessage(chatId, '...');
        const response = await this._openChats[chatId].gpt.askQuestion(text);
        await this._bot.sendMessage(chatId, response);
      } catch (error) {
        console.error(error);
        await this._bot.sendMessage(chatId, "Can't process this request");
      } finally {
        this._openChats[chatId].isProcessing = false;
      }
    });
  }

  stop() {
    this._bot.stopPolling();
    console.log('Bot stopped due to inactivity.');
  }

  _resetInactivityTimer() {
    if (this._inactivityTimer) {
      clearTimeout(this._inactivityTimer);
    }
    this._inactivityTimer = setTimeout(() => {
      this.stop();
    }, this._inactivityTimeout);
  }
}

const botService = new BotService();
botService.start();

// export default BotService;
