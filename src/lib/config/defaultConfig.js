import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const defaultInstructions = readFileSync(join(__dirname, 'custom.txt'), {
  encoding: 'utf8',
});

const defaultModelParams = JSON.parse(
  readFileSync(join(__dirname, 'modelParams.json'), 'utf-8'),
);

export { defaultInstructions, defaultModelParams };
