import app from "./app.js";
import config from "./config/env.js";
import os from "os";
import { connectDB } from "./config/db.js";

const PORT = config.port;
const HOST = "0.0.0.0";

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, HOST, () => {
      const ip = getLocalIp();
      console.log(`\n  ✅ Umuco Core Backend running!`);
      console.log(`     Local:   http://${ip}:${PORT}`);
      console.log(`     Network: http://${ip}:${PORT}`);
      console.log(`     API URL: ${process.env.NODE_ENV === 'production' ? 'https://umucocore.onrender.com' : `http://${ip}:${PORT}`}\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return process.env.NODE_ENV === 'production' ? 'umucocore.onrender.com' : "127.0.0.1";
}
