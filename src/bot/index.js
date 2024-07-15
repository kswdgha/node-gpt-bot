import TelegramBot from 'node-telegram-bot-api';

import ChatGPT from '../lib/index.js';

class BotService {
  constructor() {
    this._bot = new TelegramBot(process.env.TG_BOT_TOKEN, { polling: true });
    this._openChats = {};
    this._inactivityTimeout = process.env.BOT_TIMEOUT_MS || 600000; // 10 minutes default
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
        // Register new chatId
        this._openChats[chatId] = { gpt: null };
        // Prompt to choose a model
        const options = {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Use GPT-3', callback_data: 'GPT-3' }],
              [{ text: 'Use GPT-4', callback_data: 'GPT-4' }],
            ],
          },
        };

        await this._bot.sendMessage(
          chatId,
          'Choose a GPT model to continue:',
          options,
        );

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

      // model is required
      if (!this._openChats[chatId].gpt) {
        await this._bot.sendMessage(
          chatId,
          'Please choose a model first by clicking one of the buttons.',
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
        await this._bot.sendMessage(chatId, response, {
          parse_mode: 'Markdown',
        });
      } catch (error) {
        console.error(error);
        await this._bot.sendMessage(chatId, "Can't process this request");
      } finally {
        this._openChats[chatId].isProcessing = false;
      }
    });

    // Handle callback queries (user button click)
    this._bot.on('callback_query', async (callbackQuery) => {
      const message = callbackQuery.message;
      const chatId = message.chat.id;
      const data = callbackQuery.data; // 'GPT-3' or 'GPT-4'

      // /start command is required
      if (!Object.hasOwn(this._openChats, chatId)) {
        await this._bot.sendMessage(
          chatId,
          'You should start a new chat first (send /start command)',
        );
        return;
      }

      // Check if model already chosen
      if (this._openChats[chatId].gpt) {
        await this._bot.sendMessage(
          chatId,
          `You already selected a model. If you want to change it, send /start`,
        );
        return;
      }

      // Create new gpt for chatId, set the model based on user selection
      const gpt =
        data === 'GPT-4' ? new ChatGPT({ model: 'gpt-4o' }) : new ChatGPT();
      this._openChats[chatId] = { gpt, isProcessing: false };
      await this._bot.sendMessage(
        chatId,
        `Model ${data} selected.\nHow can I help you?`,
      );
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
