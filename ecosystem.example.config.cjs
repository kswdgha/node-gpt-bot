module.exports = {
  apps: [
    {
      name: 'gpt-bot',
      script: 'index.js',
      cwd: './src/bot/',
      env: {
        NODE_ENV: 'production',
        OPENAI_API_KEY: 'your_api_key',
        TG_BOT_TOKEN: 'your token',
        BOT_TIMEOUT_MS: 600000, // 10 minutes
      },
      watch: false,
      autorestart: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
