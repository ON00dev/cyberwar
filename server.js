const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, "../public")));

const ROOM_ID = "5123";
const MAX_PLAYERS = 10;
const rooms = {
  [ROOM_ID]: { players: [], observers: [] }
};

// ---------------- SOCKET.IO ----------------
io.on("connection", socket => {
  console.log(`[CONNECT] ${socket.id}`);

  socket.on("join-room", ({ username, roomId, mode }) => {
    const room = rooms[roomId];
    if (!room) return;

    // Se sala cheia ou modo observador
    if (room.players.length >= MAX_PLAYERS || mode === "observer") {
      socket.role = "observer";
      room.observers.push(socket);
      socket.emit("role-assigned", "observer");
      console.log(`[OBSERVADOR] ${socket.id} entrou`);
      updateRoom();
      return;
    }

    // Entrou como jogador
    socket.username = username;
    socket.role = "player";
    room.players.push(socket);
    console.log(`[PLAYER] ${username} entrou (${room.players.length}/10)`);

    updateRoom();

    if (room.players.length === MAX_PLAYERS) {
      console.log("🚀 Sala cheia! Iniciando partida");
      startGame();
    }
  });

  socket.on("click-data", ({ dataId, action }) => {
    // Hackers ou defesa clicaram em dados
    broadcast("update-data", { dataId, action, user: socket.username, role: socket.role });
  });

  socket.on("disconnect", () => {
    console.log(`[DISCONNECT] ${socket.id}`);
    const room = rooms[ROOM_ID];
    if (!room) return;
    room.players = room.players.filter(p => p.id !== socket.id);
    room.observers = room.observers.filter(o => o.id !== socket.id);
    updateRoom();
  });
});

function startGame() {
  const room = rooms[ROOM_ID];
  const shuffled = [...room.players].sort(() => Math.random() - 0.5);

  // Distribui roles
  shuffled.forEach((player, i) => {
    player.role = i < 5 ? "defesa" : "hacker";
    player.emit("role-assigned", player.role); // <-- player já é o socket
    console.log(`🎭 ${player.username} => ${player.role}`);
  });

  broadcast("match-start");

  // Inicia spawn de dados
  spawnData();
}

let dataCounter = 0;
function spawnData() {
  const room = rooms[ROOM_ID];
  if (!room) return;

  const types = ["publico", "confidencial", "critico"];
  const dataItem = {
    id: "data_" + dataCounter++,
    x: Math.random() * 760,
    y: 0,
    type: types[Math.floor(Math.random() * types.length)]
  };
  broadcast("new-data", dataItem);

  // Spawn contínuo enquanto houver jogadores
  if (room.players.length > 0) setTimeout(spawnData, 1200);
}

function updateRoom() {
    const room = rooms[ROOM_ID];
    const players = room.players.map(p => ({
      id: p.id,
      username: p.username,
      role: p.role || "?",
      score: p.score || 0 // adiciona score para ranking
    }));
    room.observers.forEach(o => {
      // Observadores também recebem o ranking
      o.emit("players-update", players);
    });
    room.players.forEach(p => p.emit("players-update", players));
}
  

function broadcast(event, data) {
    const room = rooms[ROOM_ID];
    room.players.forEach(p => p.emit(event, data)); // <-- p é socket
    room.observers.forEach(o => o.emit(event, data));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🔥 Servidor rodando na porta ${PORT}`));
