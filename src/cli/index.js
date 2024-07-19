import readline from 'readline';

import ChatGPT from '../lib/index.js';

const escapeCodes = {
  // ANSI escape codes
  ANSI_BOLD: '\x1b[1m',
  ANSI_COLOR_CYAN: '\x1b[36m',
  ANSI_RESET: '\x1b[0m',
};

class CLI {
  constructor() {
    const modelArg = process.argv[2];
    if (modelArg === '4') {
      console.log('Using model gpt-4o');
      this._gpt = new ChatGPT({ model: 'gpt-4o' });
    } else {
      console.log('Using model gpt-4-mini');
      this._gpt = new ChatGPT();
    }
    // Init readline interface
    this._rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  start() {
    // Welcome message
    this._logAiResponse('How can I help you?');
    // Set prompt message
    this._rl.setPrompt('\n🙂 You: ');
    this._rl.prompt();
    // Main flow
    this._rl.on('line', async (line) => {
      if (line.toLowerCase() === 'exit') {
        console.log('\nExiting... Bye 👋');
        this._rl.close();
        process.exit(0);
      }
      // Send request
      this._logAiResponse('...');
      const response = await this._gpt.askQuestion(line);
      this._logAiResponse(this._replaceWithBold(response));
      this._rl.prompt();
    });
  }

  _logAiResponse(responseText) {
    console.log(
      `${escapeCodes.ANSI_COLOR_CYAN}\n🤖 AI: ${responseText}${escapeCodes.ANSI_RESET}`,
    );
  }

  _replaceWithBold(text) {
    // Regular expression to find all patterns wrapped in **
    const regex = /\*\*(.*?)\*\*/g;
    // Replace occurrences of **text** with the same text wrapped in ANSI codes for bold
    return text.replace(
      regex,
      `${escapeCodes.ANSI_BOLD}$1${escapeCodes.ANSI_RESET}${escapeCodes.ANSI_COLOR_CYAN}`,
    );
  }
}

export default CLI;
