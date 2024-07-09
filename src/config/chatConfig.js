import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const customInstructions = readFileSync(join(__dirname, 'custom.txt'), {
  encoding: 'utf8',
});

const modelParams = JSON.parse(
  readFileSync(join(__dirname, 'modelParams.json'), 'utf-8'),
);

const escapeCodes = {
  // ANSI escape codes
  ANSI_BOLD: '\x1b[1m',
  ANSI_COLOR_CYAN: '\x1b[36m',
  ANSI_RESET: '\x1b[0m',
};

export default {
  escapeCodes,
  customInstructions,
  modelParams,
};
