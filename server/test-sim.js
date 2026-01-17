const io = require("socket.io-client");

const ROOM_ID = "5123";
const MAX_BOTS = 10;

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function startBots(existingDefenders, existingHackers) {
  let neededDefenders = 5 - existingDefenders;
  let neededHackers = 5 - existingHackers;
  const totalNeeded = neededDefenders + neededHackers;

  if (totalNeeded <= 0) {
    console.log("[TEST-SIM] Sala já está completa (5v5). Nenhum bot necessário.");
    return;
  }

  console.log(
    `[TEST-SIM] Status atual: ${existingDefenders} Defensores, ${existingHackers} Hackers`,
  );
  console.log(
    `[TEST-SIM] Criando bots: +${neededDefenders} Defensores, +${neededHackers} Hackers`,
  );

  for (let i = 0; i < totalNeeded; i++) {
    const botName = `Bot_${Math.random().toString(36).substr(2, 5)}`;
    const socket = io("http://localhost:3000");
    const activeDataIds = new Set();

    let desiredRole;
    if (neededDefenders > 0) {
      desiredRole = "defesa";
      neededDefenders--;
    } else {
      desiredRole = "hacker";
      neededHackers--;
    }

    socket.on("role-assigned", role => {
      console.log(`🤖 ${botName} => ${role}`);
    });

    socket.on("error", msg => {
      console.log(`❌ ${botName} erro ao entrar: ${msg}`);
    });

    socket.on("new-data", data => {
      if (data && data.id) {
        activeDataIds.add(data.id);
      }
    });

    socket.on("data-captured", data => {
      if (data && data.id) {
        activeDataIds.delete(data.id);
      }
    });

    socket.on("match-start", payload => {
      console.log(`🚀 ${botName} iniciou a partida`, payload || "");
      setInterval(() => {
        if (activeDataIds.size === 0) {
          return;
        }
        if (Math.random() >= 0.5) {
          return;
        }
        const ids = Array.from(activeDataIds);
        const dataId = ids[Math.floor(Math.random() * ids.length)];
        socket.emit("click-data", { dataId });
      }, 2000);
    });

    socket.on("time-update", ({ timeLeft }) => {
      console.log(`[${botName}] tempo restante: ${timeLeft}s`);
    });

    socket.on("match-end", ({ players }) => {
      console.log(`[${botName}] partida encerrada. Placar final:`);
      console.log(players);
      socket.disconnect();
    });

    socket.emit("join-room", {
      username: botName,
      roomId: ROOM_ID,
      role: desiredRole
    });

    await delay(300);
  }
}

const checkPlayersSocket = io("http://localhost:3000");

checkPlayersSocket.on("room-info", info => {
  if (!info) {
    console.log("[TEST-SIM] Nenhuma informação de sala recebida.");
    checkPlayersSocket.disconnect();
    return;
  }

  const { defendersCount, hackersCount } = info;
  startBots(defendersCount, hackersCount);
  checkPlayersSocket.disconnect();
});
