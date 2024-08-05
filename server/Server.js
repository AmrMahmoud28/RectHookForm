import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import url from "url";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = 8888;

app.use(cors());
app.use(bodyParser.json());

const users = [
  { email: "test@waredat.sa", name: "Waredat", password: "12121212" },
  { email: "dramr2852001@gmail.com", name: "Amr", password: "11111111" },
];

// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   const user = users.find((u) => u.email === email && u.password === password);

//   await new Promise((resolve) => setTimeout(resolve, 1500));

//   if (user) {
//     const token = crypto.randomBytes(16).toString("hex");
//     console.log(`Generated token: ${token}`);
//     tokens[token] = { email: user.email };

//     res.status(200).json({
//       message: "Login successful",
//       user: { email: user.email, name: user.name, token: token },
//     });
//   } else {
//     res.status(401).json({ message: "Invalid email or password" });
//   }
// });

const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });

const connections = {};
const connectedUsers = {};

const broadcast = () => {
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    const message = JSON.stringify(connectedUsers);
    connection.send(message);
  });
};

const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString());
  const user = connectedUsers[uuid];
  user.state = message;

  console.log(
    `Received message from ${user.username}: ${JSON.stringify(message)}`
  );
  broadcast();
};

const handleClose = (uuid) => {
  delete connections[uuid];
  delete connectedUsers[uuid];
  console.log(`Connection closed for UUID ${uuid}`);
  console.log("Connected users:", Object.keys(connectedUsers).length);
  broadcast();
};

wsServer.on("connection", (connection, request) => {
  try {
    const { email, password } = url.parse(request.url, true).query;

    if (!email || !password) {
      connection.send(
        JSON.stringify({
          success: false,
          error: "Email and password are required.",
        })
      );
      connection.close();
      console.error("Connection attempt without email or password");
      return;
    }

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const uuid = Object.keys(connectedUsers).find(uuid => connectedUsers[uuid].user === user) || uuidv4();
      console.log(`Generated UUID: ${uuid}`);

      connections[uuid] = connection;
      connectedUsers[uuid] = {
        user: user,
        state: {},
      };

      connection.on("message", (message) => handleMessage(message, uuid));
      connection.on("close", () => handleClose(uuid));

      connection.send(
        JSON.stringify({ success: true, user: user })
      );
      console.log(`New connection from ${user.name} with UUID ${uuid}`);
      console.log("Connected users:", Object.keys(connectedUsers).length);
    } else {
      connection.send(
        JSON.stringify({ success: false, error: "Invalid email or password" })
      );
      connection.close();
      console.error("Invalid email or password");
    }
  } catch (error) {
    connection.send(
      JSON.stringify({ success: false, error: "Invalid message format" })
    );
    connection.close();
    console.error("Invalid message format", error);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
