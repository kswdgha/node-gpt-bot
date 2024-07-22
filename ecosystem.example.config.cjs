module.exports = {
  apps: [
    {
      name: 'gpt-bot',
      script: 'server.js',
      cwd: './src/bot/',
      env: {
        NODE_ENV: 'production',
        OPENAI_API_KEY: 'your_api_key',
        TG_BOT_TOKEN: 'your token',
        TG_MAX_CHUNK_SIZE: 4096,
        // BOT_TIMEOUT_MS: 600000, // 10 minutes
        SERVER_HTTPS_PORT: 443,
        SERVER_DOMAIN: 'your-server-domain',
        SERVER_URL: 'https://your_server_domain:your_server_port',
      },
      watch: false,
      autorestart: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
