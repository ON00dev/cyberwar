"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { io, type Socket } from "socket.io-client"
import { GameCanvas } from "./game-canvas"
import { RankingPanel } from "./ranking-panel"
import { EntryModal } from "./entry-modal"
import { StatusBar } from "./status-bar"
import { GameOverModal } from "./game-over-modal"
import { Shield, Skull, Eye } from "lucide-react"

export type Role = "defesa" | "hacker" | "observer" | null
export type DataType = "critico" | "confidencial" | "normal"
type GamePhase = "idle" | "waiting" | "running" | "ended" | "disconnected"

export interface RoomInfo {
  playersCount: number
  defendersCount: number
  hackersCount: number
  maxPlayers: number
}

export interface DataItem {
  id: string
  x: number
  y: number
  type: DataType
  captured: boolean
  capturedBy?: string
}

export interface Player {
  username: string
  role: Role
  score: number
}

const GAME_DURATION = 90
const ROOM_ID = "5123"
const SERVER_URL = "http://localhost:3000"

export function CyberWarGame() {
  const [isConnected, setIsConnected] = useState(false)
  const [username, setUsername] = useState("")
  const [role, setRole] = useState<Role>(null)
  const roleRef = useRef<Role>(null)
  const [status, setStatus] = useState("AGUARDANDO CONEXÃO...")
  const [dataItems, setDataItems] = useState<DataItem[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [showEntry, setShowEntry] = useState(true)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [isGameOver, setIsGameOver] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [phase, setPhase] = useState<GamePhase>("idle")
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
  const gameLoopRef = useRef<number | null>(null)

  useEffect(() => {
    const newSocket = io(SERVER_URL)
    setSocket(newSocket)

    newSocket.on("connect", () => {
      // Connection established
    })

    newSocket.on("room-info", (info: RoomInfo) => {
      setRoomInfo(info)
    })

    newSocket.on("disconnect", () => {
      setIsConnected(false)
      setStatus("CONEXÃO PERDIDA")
      setPhase("disconnected")
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const endGame = useCallback(() => {
    setIsGameOver(true)
    setStatus("⏱️ TEMPO ESGOTADO - PARTIDA FINALIZADA")
    setPhase("ended")

    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
      gameLoopRef.current = null
    }
  }, [])

  const backToMenu = useCallback(() => {
    if (socket) {
      socket.emit("leave-room")
      socket.off("role-assigned")
      socket.off("match-start")
      socket.off("new-data")
      socket.off("data-captured")
      socket.off("players-update")
      socket.off("time-update")
      socket.off("match-end")
    }

    setIsGameOver(false)
    setIsConnected(false)
    setShowEntry(true)
    setTimeLeft(GAME_DURATION)
    setDataItems([])
    setPlayers([])
    setUsername("")
    setRole(null)
    setStatus("AGUARDANDO CONEXÃO...")
    setPhase("idle")
  }, [socket])

  const handleJoin = useCallback(
    (name: string, selectedRole: Role) => {
      if (!socket) return

      const finalUsername = name.trim() || "Observador"
      const finalRole: Role = name.trim() === "" ? "observer" : selectedRole

      setUsername(finalUsername)
      setShowEntry(false)
      setStatus("CONECTANDO À SALA...")
      setIsGameOver(false)
      setDataItems([])
      setPlayers([])
      setTimeLeft(GAME_DURATION)
      setPhase("waiting")

      socket.on("role-assigned", (assignedRole: Exclude<Role, null>) => {
        setRole(assignedRole)
        roleRef.current = assignedRole
        setIsConnected(true)
        setStatus("🚀 CONECTADO - AGUARDANDO JOGADORES")
        setPhase("waiting")
      })

      socket.on("match-start", (payload?: { timeLeft?: number }) => {
        setIsGameOver(false)
        setTimeLeft(payload?.timeLeft ?? GAME_DURATION)
        setStatus("🚀 PARTIDA EM ANDAMENTO")
        setDataItems([])
        setPhase("running")
      })

      socket.on("new-data", (data: DataItem) => {
        setDataItems((prev) => [...prev, data])
      })

      socket.on(
        "data-captured",
        (data: DataItem & { role?: Role; points?: number }) => {
          setDataItems((prev) =>
            prev.map((item) => (item.id === data.id ? { ...item, ...data } : item)),
          )
        },
      )

      socket.on(
        "players-update",
        (serverPlayers: Array<{ username: string; role: Role; score: number }>) => {
          setPlayers(
            serverPlayers.map((p) => ({
              username: p.username,
              role: p.role,
              score: p.score,
            })),
          )
        },
      )

      socket.on("time-update", ({ timeLeft: serverTimeLeft }: { timeLeft: number }) => {
        setTimeLeft(serverTimeLeft)
      })

      socket.on(
        "match-end",
        ({ players: finalPlayers }: { players: Array<{ username: string; role: Role; score: number }> }) => {
          socket.off("players-update")
          socket.off("time-update")
          socket.off("new-data")
          socket.off("data-captured")

          setPlayers(
            finalPlayers.map((p) => ({
              username: p.username,
              role: p.role,
              score: p.score,
            })),
          )
          endGame()
        },
      )

      socket.once("error", (msg: string) => {
        if (!roleRef.current) {
          alert(msg)
          backToMenu()
        }
      })

      socket.emit("join-room", {
        username: finalUsername,
        roomId: ROOM_ID,
        role: finalRole,
      })
    },
    [socket, endGame, backToMenu],
  )

  const handleDataClick = useCallback(
    (dataId: string) => {
      if (!socket || !role || role === "observer" || isGameOver) return

      socket.emit("click-data", { dataId })
    },
    [socket, role, isGameOver],
  )

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [socket])

  // Game loop for falling data
  useEffect(() => {
    if (!isConnected || isGameOver) return

    const gameLoop = () => {
      setDataItems((prev) =>
        prev
          .map((item) => ({
            ...item,
            y: item.captured ? item.y : item.y + 2,
          }))
          .filter((item) => item.y < 500 || item.captured),
      )
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [isConnected, isGameOver])

  const getRoleIcon = () => {
    switch (role) {
      case "defesa":
        return <Shield className="w-5 h-5" />
      case "hacker":
        return <Skull className="w-5 h-5" />
      case "observer":
        return <Eye className="w-5 h-5" />
      default:
        return null
    }
  }

  const getRoleColor = () => {
    switch (role) {
      case "defesa":
        return "text-cyber-green"
      case "hacker":
        return "text-cyber-red"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,213,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,213,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                <span className="text-primary">CYBER</span>
                <span className="text-foreground">_</span>
                <span className="text-accent">WAR</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1 tracking-widest">// COMPUTAÇÃO EM NUVEM, BIG DATA & SEGURANÇA DIGITAL - GRUPO 3</p>
            </div>

            {role && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded border ${getRoleColor()} border-current/30 bg-current/5`}
              >
                {getRoleIcon()}
                <span className="uppercase tracking-wider text-sm">
                  {role === "defesa" ? "DEFENSOR" : role === "hacker" ? "INVASOR" : "OBSERVADOR"}
                </span>
              </div>
            )}
          </div>
        </header>

        <StatusBar
          status={status}
          isConnected={isConnected}
          username={username}
          timeLeft={timeLeft}
          isGameOver={isGameOver}
          phase={phase}
          playersCount={roomInfo?.playersCount ?? 0}
        />

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Game Canvas */}
          <div className="lg:col-span-3">
            <GameCanvas dataItems={dataItems} onDataClick={handleDataClick} role={role} />
          </div>

          {/* Ranking Panel */}
          <div className="lg:col-span-1">
            <RankingPanel players={players} />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-cyber-red shadow-[0_0_10px_rgba(255,51,102,0.5)]" />
            <span className="text-muted-foreground">
              CRÍTICO <span className="text-foreground">(+5 pts)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-cyber-orange shadow-[0_0_10px_rgba(255,159,28,0.5)]" />
            <span className="text-muted-foreground">
              CONFIDENCIAL <span className="text-foreground">(+3 pts)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-cyber-yellow shadow-[0_0_10px_rgba(255,214,10,0.5)]" />
            <span className="text-muted-foreground">
              NORMAL <span className="text-foreground">(+1 pt)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Entry Modal */}
      {showEntry && (
        <EntryModal onJoin={handleJoin} roomInfo={roomInfo} />
      )}

      {isGameOver && <GameOverModal players={players} onBackToMenu={backToMenu} />}
    </div>
  )
}
