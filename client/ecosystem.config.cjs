module.exports = {
  apps: [
    {
      name: "edra-client",
      cwd: __dirname,
      script: ".next/standalone/server.js",
      env: {
        NODE_ENV: "production",
        HOSTNAME: "0.0.0.0",
        PORT: 3000,
      },
    },
  ],
};
