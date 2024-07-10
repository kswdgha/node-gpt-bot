// Example usage
import ChatGPT from './src/lib/index.js';

const gpt = new ChatGPT();
const response = await gpt.askQuestion(
  'Top 10 programming languages for backend',
);
console.log(response);
