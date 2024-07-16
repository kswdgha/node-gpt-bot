import OpenAI from 'openai';

import {
  defaultInstructions,
  defaultModelParams,
} from './config/defaultConfig.js';

class ChatGPT {
  constructor(
    modelParams,
    instructions = defaultInstructions,
    messageHistory = [],
  ) {
    this._openai = new OpenAI();
    this._params = { ...defaultModelParams, ...modelParams };
    this._initialHistory = [
      {
        role: 'system',
        content: instructions,
      },
      ...messageHistory,
    ];
    this.resetHistory();
  }

  async askQuestion(question) {
    // Prevent from sending request, while procecssing previous one
    if (this._isProcessing) {
      return 'Processing previous request, please wait...';
    }
    // Start processing
    this._isProcessing = true;
    const newQuestion = { role: 'user', content: question };

    try {
      const completion = await this._openai.chat.completions.create({
        messages: [...this._history, newQuestion],
        ...this._params,
      });
      // Append the new question to the messages array
      this._history.push(newQuestion);
      // Append the AI's response to the messages array
      const responseString = completion.choices[0].message.content;
      this._aiResponse = this._formatResponse(responseString);
      this._history.push({ role: 'assistant', content: this._aiResponse });
    } catch (error) {
      this._aiResponse = "Can't process this request, try again...";
      console.error(error);
    } finally {
      // Finish processing
      this._isProcessing = false;
    }

    return this._aiResponse;
  }

  resetHistory() {
    this._history = [...this._initialHistory];
  }

  _formatResponse(inputString) {
    // Handle weird response formatting
    // Replace all non alphanumerical sequences with only one character
    const formattedString = inputString.replace(/([^a-zA-Z0-9])\1*/g, '$1');
    return formattedString;
  }
}

export default ChatGPT;
