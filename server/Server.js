import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import crypto from "crypto";
import http from "http";
import { WebSocketServer } from "ws";
import url from "url";
import { v4 as uuidv4 } from 'uuid';

// const uuidv4 = require("uuid").v4;

const app = express();
const PORT = 8888;

app.use(cors());
app.use(bodyParser.json());

const users = [
  { email: "test@waredat.sa", name: "Waredat", password: "12121212" },
  { email: "dramr2852001@gmail.com", name: "Amr", password: "11111111" },
];

const tokens = {};

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (user) {
    const token = crypto.randomBytes(16).toString("hex");
    console.log(`Generated token: ${token}`);
    tokens[token] = { email: user.email };

    res
      .status(200)
      .json({
        message: "Login successful",
        user: { email: user.email, name: user.name, token: token },
      });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });

const connections = {};
const connectedUsers = {};

const broadcast = () => {
  Object.keys(connections).forEach(uuid => {
    const connection = connections[uuid];
    const message = JSON.stringify(connectedUsers);
    connection.send(message);
  })
}

const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString());
  const user = connectedUsers[uuid];
  user.state = message;

  console.log(`Received message from ${user.username}: ${JSON.stringify(message)}`);
  broadcast();
}
 
const handleClose = (uuid) => {
  delete connections[uuid];
  delete connectedUsers[uuid];
  console.log(`Connection closed for UUID ${uuid}`);
  broadcast();
}

wsServer.on("connection", (connection, request) => {
  const {token, username} = url.parse(request.url, true).query;

  if (!tokens[token]) {
    console.log("Invalid token");
    connection.close(1008, 'Invalid token');
    return;
  }

  const uuid = uuidv4();

  connections[uuid] = connection;
  connectedUsers[uuid] = {
    username: username,
    state:{

    }
  }

  connection.on("message", (message) => handleMessage(message, uuid));
  connection.on("close", () => handleClose(uuid));

  console.log(`New connection from ${token} with UUID ${uuid}`);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
