module.exports = {
  apps: [
    {
      name: 'hisho-backend',
      script: './build/bin/server.js', 
      cwd: './backend', // "Current Working Directory" : on se place dans le dossier backend
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'hisho-frontend',
      // Point d'entrée de Nuxt 3 (moteur Nitro)
      script: './.output/server/index.mjs',
      cwd: './frontend', // On se place dans le dossier frontend
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
      },
    },
  ],
};