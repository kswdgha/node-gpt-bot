#!/usr/bin/env node
import dotenv from 'dotenv';

import CLI from '../src/cli/index.js';

dotenv.config();

const gpt_cli = new CLI();
gpt_cli.start();
