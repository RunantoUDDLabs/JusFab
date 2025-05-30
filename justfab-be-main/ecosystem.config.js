require('dotenv').config();

module.exports = {
  apps: [{
    script: './index.js',
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
    ...(process.env.NODE_ENV === 'development' ? {
      watch: true,
      watch_options: {
        followSymlinks: false,
        usePolling: true,
        ignored: ['logs/*', 'node_modules', 'public/uploads'],
        extensions: ['js', 'yml', 'vue'],
      },
      // watch_delay: 1000, // Delay between restarts in milliseconds
      // ignore_watch: [
      //   'node_modules', // Ignore node_modules
      //   'logs',         // Ignore logs folder
      // ],
      interpreter: "nodemon",
    } : {})
  }]
};
