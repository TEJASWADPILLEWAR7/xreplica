module.exports = {
  apps: [
    {
      name: "xreplica-worker",
      exec_mode: "fork",
      instances: 1,
      script: "scripts/worker.ts",
      interpreter: "node",
      interpreter_args: "--import tsx",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PATH: process.env.PATH,
      },
    },
  ],
};
