// Example usage
import dotenv from 'dotenv';

import ChatGPT from './src/lib/index.js';

dotenv.config();

const gpt = new ChatGPT({ model: 'gpt-4o' });
const response = await gpt.askQuestion(
  'Top 10 programming languages for backend',
);
console.log(response);
