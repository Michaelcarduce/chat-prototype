import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://chat-prototype-client.onrender.com",
      "https://chat-prototype-artist.onrender.com"
    ],
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://chat-prototype-client.onrender.com",
    "https://chat-prototype-artist.onrender.com"
  ],
}));
app.use(express.json());

interface User {
  id: string;
  name: string;
  userType: "client" | "artist";
}

let users: User[] = [];

io.on("connection", (socket: Socket) => {
  socket.on(
    "join",
    ({ name, userType }: { name: string; userType: "client" | "artist" }) => {
      const user: User = { id: socket.id, name, userType };
      users.push(user);
      socket.broadcast.emit("user-joined", {
        message: `${name} joined as ${userType}.`,
        user,
      });
      io.emit("active-users", users);
    }
  );

  socket.on("send-message", (data: { message: string; timestamp: string }) => {
    const user = users.find((u) => u.id === socket.id);
    if (user) {
      io.emit("receive-message", {
        id: Date.now().toString(),
        message: data.message,
        sender: user.name,
        senderType: user.userType,
        timestamp: data.timestamp,
      });
    }
  });

  socket.on("disconnect", () => {
    const user = users.find((u) => u.id === socket.id);
    if (user) {
      users = users.filter((u) => u.id !== socket.id);
      socket.broadcast.emit("user-left", {
        message: `${user.name} left.`,
        user,
      });
      io.emit("active-users", users);
    }
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
