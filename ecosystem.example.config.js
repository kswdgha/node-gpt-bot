export const apps = [
  {
    name: 'gpt-bot',
    script: './src/bot/index.js',
    cwd: './src/bot/',
    env: {
      NODE_ENV: 'production',
      OPENAI_API_KEY: 'your_api_key',
      TG_BOT_TOKEN: 'your token',
    },
    watch: false,
    autorestart: false,
    instances: 1,
    exec_mode: 'fork',
  },
];
