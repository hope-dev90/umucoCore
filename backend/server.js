import app from "./app.js";
import { connectDB } from "./config/db.js";
import config from "./config/env.js";
import os from "os";

const PORT = config.port;
const HOST = "0.0.0.0"; // Allow network access

connectDB();

app.listen(PORT, HOST, () => {
  const ip = getLocalIp();
  console.log(`\n  ✓ Backend running:`);
  console.log(`    Local:   http://localhost:${PORT}`);
  console.log(`    Network: http://${ip}:${PORT}\n`);
});

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}
