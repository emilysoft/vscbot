import express from 'express'
import client from "../index-vsc.js"
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.API_PORT || 3000;


function api() {
  app.get('/status', (req, res) => {
    let botStatus;
    if (client.isReady()) {
      botStatus = {
        status: 'online',
        message: 'El bot está conectado y listo.',
        username: client.user.tag
      };
    } else {
      botStatus = {
        status: 'offline',
        message: 'El bot no está conectado.'
      };
    }
    res.json(botStatus);
  });

  app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
  });
}

export default api;