const io = require("socket.io-client");

const ROOM_ID = "5123";
const MAX_BOTS = 10;

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Função principal de simulação
async function startBots(existingPlayers = 0) {
  const slots = Math.max(0, MAX_BOTS - existingPlayers);
  console.log(`[TEST-SIM] Criando ${slots} bots para preencher a sala`);

  for (let i = 0; i < slots; i++) {
    const botName = `Bot_${i + 1}`;
    const socket = io("http://localhost:3000");

    // Quando receber role do servidor
    socket.on("role-assigned", role => {
      const botRole = role;
      console.log(`🤖 ${botName} => ${botRole}`);

      // Inicia a simulação de cliques em dados
      setInterval(() => {
        if (Math.random() < 0.5) { // 50% chance de ação
          const dataId = "data_" + Math.floor(Math.random() * 50);
          const action = botRole === "defesa" ? "defesa" : "hack";
          socket.emit("click-data", { dataId, action });
        }
      }, 2000);
    });

    socket.on("match-start", () => {
      console.log(`🚀 ${botName} iniciou a partida`);
    });

    // Conecta o bot à sala
    socket.emit("join-room", {
      username: botName,
      roomId: ROOM_ID,
      mode: "player"
    });

    await delay(300); // Delay para não sobrecarregar o servidor
  }
}

// Descobre quantos players já existem antes de criar bots
const checkPlayersSocket = io("http://localhost:3000");
checkPlayersSocket.emit("join-room", { username: "SimCheck", roomId: ROOM_ID, mode: "observer" });

checkPlayersSocket.on("players-update", players => {
  const currentPlayers = players.length;
  console.log(`[TEST-SIM] Jogadores já na sala: ${currentPlayers}`);
  startBots(currentPlayers);
  checkPlayersSocket.disconnect();
});
