"use client"

import { Activity, Wifi, WifiOff, User, Timer, Users } from "lucide-react"

type GamePhase = "idle" | "waiting" | "running" | "ended" | "disconnected"

interface StatusBarProps {
  status: string
  isConnected: boolean
  username: string
  timeLeft: number
  isGameOver: boolean
  phase: GamePhase
  playersCount: number
  maxPlayers: number
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function StatusBar({
  status,
  isConnected,
  username,
  timeLeft,
  isGameOver,
  phase,
  playersCount,
  maxPlayers,
}: StatusBarProps) {
  let phaseLabel: string
  switch (phase) {
    case "waiting":
      phaseLabel = "AGUARDANDO JOGADORES"
      break
    case "running":
      phaseLabel = "PARTIDA EM ANDAMENTO"
      break
    case "ended":
      phaseLabel = "PARTIDA ENCERRADA"
      break
    case "disconnected":
      phaseLabel = "DESCONECTADO DO SERVIDOR"
      break
    default:
      phaseLabel = "AGUARDANDO"
      break
  }

  const timerColor =
    timeLeft <= 10 ? "text-cyber-red animate-pulse" : timeLeft <= 30 ? "text-cyber-orange" : "text-cyber-green"

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 rounded-lg border border-border bg-card/50 backdrop-blur">
      <div className="flex items-center gap-3">
        <Activity className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-sm text-foreground tracking-wide">
          {phaseLabel} — {status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        {!isGameOver && timeLeft > 0 && (
          <div className={`flex items-center gap-2 font-mono font-bold ${timerColor}`}>
            <Timer className="w-4 h-4" />
            <span className="text-lg tracking-wider">{formatTime(timeLeft)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="font-mono">
            {playersCount}/{maxPlayers}
          </span>
        </div>

        {username && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{username}</span>
          </div>
        )}

        <div className={`flex items-center gap-2 ${isConnected ? "text-cyber-green" : "text-muted-foreground"}`}>
          {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span className="text-xs tracking-wider">{isConnected ? "ONLINE" : "OFFLINE"}</span>
        </div>
      </div>
    </div>
  )
}
