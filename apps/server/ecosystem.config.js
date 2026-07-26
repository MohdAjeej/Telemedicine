module.exports = {
  apps: [
    {
      name: 'telemedicine-server',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '400M',
      out_file: 'src/logs/pm2-out.log',
      error_file: 'src/logs/pm2-error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
