module.exports = {
  apps: [
    {
      name: 'hisho-backend',
      script: './build/bin/server.js', 
      cwd: './backend',
      instances: 1,
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'hisho-frontend',
      script: './.output/server/index.mjs',
      cwd: './frontend',
      instances: 1,
      merge_logs: true,
      autorestart: true,
      watch: false,
    },
  ],
};
