const socket = io();
const canvas = document.getElementById("battle");
const ctx = canvas.getContext("2d");
const scores = {};
const dataItems = [];

let role = null;

document.getElementById("join").onclick = () => {
  const usernameInput = document.getElementById("username").value.trim();
  role = usernameInput === "" ? "observer" : "player";
  const username = role === "player" ? usernameInput : "Observador";

  socket.emit("join-room", {
    username,
    roomId: "5123",
    mode: role
  });
  document.getElementById("entry").style.display = "none";
};

socket.on("role-assigned", r => {
  role = r;
  document.getElementById("role").innerText = `🎭 Você é ${r}`;
});

socket.on("match-start", () => {
  document.getElementById("status").innerText = "🚀 Partida iniciada!";
  requestAnimationFrame(draw);
});

socket.on("players-update", players => {
  updateRanking(players);
});

socket.on("new-data", data => {
  dataItems.push({ ...data, captured: false });
});

socket.on("update-data", ({ dataId, action, user, role: userRole }) => {
  const item = dataItems.find(d => d.id === dataId);
  if (item) item.captured = true;
  // Atualiza pontuação
  if (!scores[user]) scores[user] = 0;
  if (item) {
    if (action === "defesa") scores[user] += item.type === "critico" ? 5 : item.type === "confidencial" ? 3 : 1;
    else if (action === "hack") scores[user] += item.type === "critico" ? 5 : item.type === "confidencial" ? 3 : 1;
  }
});

canvas.addEventListener("click", e => {
  if (!role || role === "observer") return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  dataItems.forEach(item => {
    if (!item.captured && mx > item.x && mx < item.x + 20 && my > item.y && my < item.y + 20) {
      const action = role === "defesa" ? "defesa" : "hack";
      socket.emit("click-data", { dataId: item.id, action });
      item.captured = true;
    }
  });
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  dataItems.forEach(item => {
    if (!item.captured) {
      ctx.fillStyle = item.type === "critico" ? "red" : item.type === "confidencial" ? "orange" : "yellow";
      ctx.fillRect(item.x, item.y, 20, 20);
      item.y += 2; // velocidade de descida

      if (item.y > canvas.height) item.captured = true; // dado escapou
    }
  });

  requestAnimationFrame(draw);
}

function updateRanking(players) {
    const d = document.getElementById("rankDefense");
    const h = document.getElementById("rankHackers");
    d.innerHTML = ""; 
    h.innerHTML = "";
  
    players.forEach(p => {
      const li = document.createElement("li");
      li.innerText = `${p.username} (${p.score || 0})`;
      if (p.role === "defesa") d.appendChild(li);
      if (p.role === "hacker") h.appendChild(li);
    });
}
  
