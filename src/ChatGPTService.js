import dotenv from 'dotenv';
import OpenAI from 'openai';
import readline from 'readline';

import chatConfig from './config/chatConfig.js';

dotenv.config();

class ChatGPT {
  constructor(configuration = chatConfig) {
    this.openai = new OpenAI();
    this.configuration = configuration;
    // Initialize readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    // Chat session history
    this.messages = [
      {
        role: 'system',
        content: configuration.customInstructions,
      },
    ];
  }

  start() {
    // Welcome message
    this._logAiResponse('How can I help you?');
    // Set prompt message
    this.rl.setPrompt('\n🙂 You: ');
    this.rl.prompt();
    // Main flow
    this.isProcessing = false;

    this.rl.on('line', (line) => {
      if (line.toLowerCase() === 'exit') {
        console.log('\nExiting... Bye 👋');
        this.rl.close();
        process.exit(0);
      }

      if (this.isProcessing) {
        console.log('Processing your previous request, please wait...');
        return;
      }

      this.isProcessing = true;
      this._askQuestion(line).then(() => {
        this.isProcessing = false;
        this.rl.prompt();
      });
    });
  }

  _logAiResponse(responseText) {
    console.log(
      `${this.configuration.escapeCodes.ANSI_COLOR_CYAN}\n🤖 AI: ${responseText}${this.configuration.escapeCodes.ANSI_RESET}`,
    );
  }

  _replaceWithBold(text) {
    // Regular expression to find all patterns wrapped in **
    const regex = /\*\*(.*?)\*\*/g;

    // Replace occurrences of **text** with the same text wrapped in ANSI codes for bold
    return text.replace(
      regex,
      `${this.configuration.escapeCodes.ANSI_BOLD}$1${this.configuration.escapeCodes.ANSI_RESET}${this.configuration.escapeCodes.ANSI_COLOR_CYAN}`,
    );
  }

  async _askQuestion(question) {
    console.log('...');
    // Append the new question to the messages array
    this.messages.push({ role: 'user', content: question });

    const completion = await this.openai.chat.completions.create({
      messages: this.messages,
      ...this.configuration.modelParams,
    });

    // Append the AI's response to the messages array
    const aiResponse = completion.choices[0].message.content;
    this.messages.push({ role: 'assistant', content: aiResponse });

    this._logAiResponse(this._replaceWithBold(aiResponse));
  }
}

export default ChatGPT;
