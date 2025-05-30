const cluster = require("cluster");
const os = require("os");

require("dotenv").config();

const isDev = process.env.NODE_ENV === "development";
const MAX_RESTARTS = 5;
const RESTART_WINDOW = 60 * 1000; // 1 phút

const restartTimestamps = [];

if (cluster.isPrimary) {
  const numCPUs = isDev ? 1 : Math.min(10, os.cpus().length);
  console.log(`Master ${process.pid} is running`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Forking ${numCPUs} worker(s)...\n`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.warn(
      `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`
    );

    const now = Date.now();
    restartTimestamps.push(now);

    while (
      restartTimestamps.length > 0 &&
      restartTimestamps[0] < now - RESTART_WINDOW
    ) {
      restartTimestamps.shift();
    }

    if (restartTimestamps.length > MAX_RESTARTS) {
      console.error(
        `Too many restarts (${restartTimestamps.length} restarts in 1 minute). Not forking new workers.`
      );
      return;
    }

    console.log(`Spawning a new worker after delay...`);
    setTimeout(() => {
      cluster.fork();
    }, 2000);
  });
} else {
  if (isDev) {
    const { spawn } = require("child_process");
    spawn("npx", ["nodemon", "index.js"], {
      stdio: "inherit",
      env: process.env,
    });
  } else {
    require("./index.js");
  }
}
