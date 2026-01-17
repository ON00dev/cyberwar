const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const CLIENT_BUILD_PATH = path.join(__dirname, "../app/dist");
app.use(express.static(CLIENT_BUILD_PATH));

const ROOM_ID = "5123";
const MAX_PLAYERS = 20; // Aumentado para suportar mais conexões em simulações
const GAME_DURATION = 120; // 2 minutos em segundos
const rooms = {
  [ROOM_ID]: {
    players: [],
    observers: [],
    dataItems: [],
    gameActive: false,
    timeLeft: GAME_DURATION,
    timerInterval: null,
    spawnTimeout: null
  }
};

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(CLIENT_BUILD_PATH, "index.html"));
});

// ---------------- SOCKET.IO ----------------
io.on("connection", socket => {
  console.log(`[CONNECT] ${socket.id}`);

  socket.emit("room-info", getRoomInfo());

  socket.on("join-room", ({ username, roomId, role }) => {
    const room = rooms[roomId];
    if (!room) return;

    // Se modo observador
    if (role === "observer") {
      socket.role = "observer";
      room.observers.push(socket);
      socket.emit("role-assigned", "observer");
      console.log(`[OBSERVADOR] ${socket.id} entrou`);
      updateRoom();
      return;
    }

    // Validação de vagas por facção
    const defenders = room.players.filter(p => p.role === "defesa").length;
    const hackers = room.players.filter(p => p.role === "hacker").length;

    if (role === "defesa" && defenders >= 10) {
      socket.emit("error", "Equipe de Defesa cheia!");
      return;
    }
    if (role === "hacker" && hackers >= 10) {
      socket.emit("error", "Equipe Hacker cheia!");
      return;
    }

    // Se sala cheia no total (redundante se a lógica acima funcionar, mas bom ter)
    if (room.players.length >= MAX_PLAYERS) {
       socket.emit("error", "Sala cheia!");
       return;
    }

    // Entrou como jogador
    socket.username = username;
    socket.role = role;
    room.players.push(socket);
    console.log(
      `[PLAYER] ${username} entrou como ${role} (${room.players.length}/${MAX_PLAYERS})`,
    );
    
    // Confirma role
    socket.emit("role-assigned", role);

    updateRoom();

    // Verifica se pode começar (apenas quando sala cheia - 20 jogadores)
    if (room.players.length >= MAX_PLAYERS) {
      console.log("🚀 Sala cheia (20 jogadores)! Iniciando partida");
      startGame();
    }
  });

  socket.on("leave-room", () => {
    const room = rooms[ROOM_ID];
    if (room) {
      const wasPlayer = room.players.some(p => p.id === socket.id);
      room.players = room.players.filter(p => p.id !== socket.id);
      room.observers = room.observers.filter(p => p.id !== socket.id);
      
      if (wasPlayer) {
        console.log(`[LEAVE] ${socket.username || socket.id} saiu da sala`);
        updateRoom();
      }
    }
  });

  socket.on("click-data", ({ dataId }) => {
    const room = rooms[ROOM_ID];
    if (!room || !room.gameActive) return;

    const item = room.dataItems.find(d => d.id === dataId);
    if (!item || item.captured || (item.lockedBy && item.lockedBy !== socket.id)) return;

    item.captured = true;
    item.lockedBy = null;
    item.capturedBy = socket.username;

    let points = 1;
    if (item.type === "critico") {
      points = 5;
    } else if (item.type === "confidencial") {
      points = 3;
    }

    if (socket.role === "defesa" || socket.role === "hacker") {
      socket.score = (socket.score || 0) + points;
    }

    broadcast("data-captured", {
      id: item.id,
      x: item.x,
      y: item.y,
      type: item.type,
      captured: item.captured,
      capturedBy: item.capturedBy,
      role: socket.role,
      points
    });

    updateRoom();
  });

  socket.on("lock-data", ({ dataId }) => {
    const room = rooms[ROOM_ID];
    if (!room || !room.gameActive) return;

    const item = room.dataItems.find(d => d.id === dataId);
    if (!item || item.captured || item.lockedBy) return;

    item.lockedBy = socket.id;

    broadcast("data-locked", {
      id: item.id
    });
  });

  socket.on("disconnect", () => {
    console.log(`[DISCONNECT] ${socket.id}`);
    const room = rooms[ROOM_ID];
    if (!room) return;
    room.players = room.players.filter(p => p.id !== socket.id);
    room.observers = room.observers.filter(o => o.id !== socket.id);
    if (room.players.length === 0 && room.gameActive) {
      if (room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
      }
      if (room.spawnTimeout) {
        clearTimeout(room.spawnTimeout);
        room.spawnTimeout = null;
      }
      room.gameActive = false;
    }
    updateRoom();
  });
});

function startGame() {
  const room = rooms[ROOM_ID];
  if (!room) return;
  if (room.gameActive) return;

  room.gameActive = true;
  room.timeLeft = GAME_DURATION;
  room.dataItems = [];
  room.players.forEach(p => {
    p.score = 0;
  });

  const shuffled = [...room.players].sort(() => Math.random() - 0.5);

  shuffled.forEach((player) => {
    // Roles já foram definidas no join
    console.log(`🎭 ${player.username} => ${player.role}`);
  });

  broadcast("match-start", { timeLeft: room.timeLeft });

  spawnData();

  if (room.timerInterval) {
    clearInterval(room.timerInterval);
  }

  room.timerInterval = setInterval(() => {
    if (room.timeLeft <= 0) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
      room.gameActive = false;
      broadcast("match-end", {
        players: room.players.map(p => ({
          id: p.id,
          username: p.username,
          role: p.role || "?",
          score: p.score || 0
        }))
      });
      return;
    }

    room.timeLeft -= 1;
    broadcast("time-update", { timeLeft: room.timeLeft });
  }, 1000);
}

let dataCounter = 0;
function spawnData() {
  const room = rooms[ROOM_ID];
  if (!room || !room.gameActive) return;

  const activePlayers = room.players.length || 1;
  const spawnCount = Math.min(4, Math.max(1, Math.ceil(activePlayers / 5))); // Até 4 dados por ciclo com 20 jogadores

  for (let s = 0; s < spawnCount; s++) {
    const types = ["critico", "confidencial", "normal"];
    const weights = [0.15, 0.35, 0.5];
    const random = Math.random();
    let type = "normal";
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        type = types[i];
        break;
      }
    }

    const minDistance = 80; // Distância mínima para evitar sobreposição
    let x = 0;
    let attempts = 0;
    const recentItems = room.dataItems
      .slice(-8)
      .filter(i => !i.captured && !i.lockedBy);

    do {
      x = Math.random() * 760 + 20;
      const conflict = recentItems.some(item => Math.abs(item.x - x) < minDistance);
      if (!conflict) break;
      attempts++;
    } while (attempts < 10);

    const dataItem = {
      id: "data-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      x,
      y: -30,
      type,
      captured: false,
      lockedBy: null
    };

    room.dataItems.push(dataItem);
    broadcast("new-data", dataItem);
  }

  if (room.players.length > 0 && room.timeLeft > 0) {
    // Spawn competitivo porém menos caótico: entre 700ms e 1300ms
    const nextSpawn = Math.random() * 600 + 700;
    room.spawnTimeout = setTimeout(spawnData, nextSpawn);
  }
}

function getRoomInfo() {
    const room = rooms[ROOM_ID];
    if (!room) return null;
    return {
        playersCount: room.players.length,
        defendersCount: room.players.filter(p => p.role === "defesa").length,
        hackersCount: room.players.filter(p => p.role === "hacker").length,
        maxPlayers: MAX_PLAYERS
    };
}

function updateRoom() {
    const room = rooms[ROOM_ID];
    const players = room.players.map(p => ({
      id: p.id,
      username: p.username,
      role: p.role || "?",
      score: p.score || 0 // adiciona score para ranking
    }));
    
    const info = getRoomInfo();
    
    room.observers.forEach(o => {
      // Observadores também recebem o ranking e info da sala
      o.emit("players-update", players);
      o.emit("room-info", info);
    });
    room.players.forEach(p => {
        p.emit("players-update", players);
        p.emit("room-info", info);
    });
    
    // Broadcast para sockets que estão apenas conectados mas não entraram na sala ainda?
    // O ideal seria manter uma lista de "sockets no lobby", mas por simplificação
    // o cliente deve conectar e ficar ouvindo room-info.
    // Como io.emit manda para todos conectados (inclusive os fora da sala se não usarmos .to()),
    // podemos usar io.emit("room-info", info) se quisermos que a tela de entrada atualize para todos.
    io.emit("room-info", info);
}
  

function broadcast(event, data) {
    const room = rooms[ROOM_ID];
    room.players.forEach(p => p.emit(event, data)); // <-- p é socket
    room.observers.forEach(o => o.emit(event, data));
}

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
server.listen(PORT, HOST, () => console.log(`🔥 Servidor rodando em http://${HOST}:${PORT}`));
