"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { io, type Socket } from "socket.io-client"
import { GameCanvas } from "./game-canvas"
import { RankingPanel } from "./ranking-panel"
import { EntryModal } from "./entry-modal"
import { StatusBar } from "./status-bar"
import { GameOverModal } from "./game-over-modal"
import { QuestionModal } from "./question-modal"
import { questions, type Question } from "../data/questions"
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
  speed?: number
}

export interface Player {
  username: string
  role: Role
  score: number
}

const GAME_DURATION = 120
const ROOM_ID = "5123"
const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

export function CyberWarGame() {
  const [isConnected, setIsConnected] = useState(false)
  const [username, setUsername] = useState("")
  const [role, setRole] = useState<Role>(null)
  const roleRef = useRef<Role>(null)
  const usernameRef = useRef("")
  const [status, setStatus] = useState("AGUARDANDO CONEXÃO...")
  const [dataItems, setDataItems] = useState<DataItem[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [showEntry, setShowEntry] = useState(true)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [isGameOver, setIsGameOver] = useState(false)
  const [socket] = useState<Socket | null>(() => io(SERVER_URL))
  const [phase, setPhase] = useState<GamePhase>("idle")
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
  const gameLoopRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number | null>(null)
  
  // Quiz state
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null)
  const [pendingDataId, setPendingDataId] = useState<string | null>(null)

  useEffect(() => {
    if (!socket) return

    socket.on("room-info", (info: RoomInfo) => {
      setRoomInfo(info)
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
      setStatus("CONEXÃO PERDIDA")
      setPhase("disconnected")
    })

    return () => {
      socket.disconnect()
    }
  }, [socket])

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
      usernameRef.current = finalUsername
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
        // Revert speed to slower pace (2-4) -> Adjusted to 4-6 based on user feedback "speed not high"
        const speed = Math.random() * 2 + 4
        setDataItems((prev) => [...prev, { ...data, speed }])
      })

      socket.on("data-locked", ({ id }: { id: string }) => {
        setDataItems((prev) => prev.filter((item) => item.id !== id))
      })

      socket.on(
        "data-captured",
        (data: DataItem & { role?: Role; points?: number }) => {
          setDataItems((prev) =>
            prev.map((item) => (item.id === data.id ? { ...item, ...data } : item)),
          )

          if (data.capturedBy === usernameRef.current) {
            if (typeof window !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate(50)
            }
          }
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

      // Try multiple vibration patterns for better compatibility
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          // Some browsers prefer a single number, others an array
          const vibrated = navigator.vibrate(50)
          if (!vibrated) {
            navigator.vibrate([50])
          }
        } catch {
          // ignore error
        }
      }

      socket.emit("lock-data", { dataId })

      // Instead of emitting immediately, open quiz modal
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
      setActiveQuestion(randomQuestion)
      setPendingDataId(dataId)
      
      // Mark item as "being captured" locally to give feedback?
      // For now we just open modal.
    },
    [socket, role, isGameOver],
  )

  const handleQuizAnswer = (correct: boolean) => {
    setActiveQuestion(null)
    
    if (correct && pendingDataId && socket) {
      socket.emit("click-data", { dataId: pendingDataId })
      
      // Feedback visual extra se necessário
    } else {
      // Feedback de erro (opcional)
    }
    setPendingDataId(null)
  }

  useEffect(() => {
    if (!isConnected || isGameOver) return

    const gameLoop = () => {
      const now = performance.now()
      if (lastUpdateRef.current === null) {
        lastUpdateRef.current = now
      }
      const delta = now - lastUpdateRef.current

      if (delta >= 50) {
        lastUpdateRef.current = now
        setDataItems((prev) =>
          prev
            .map((item) => ({
              ...item,
              y: item.id === pendingDataId ? item.y : item.captured ? item.y + 5 : item.y + (item.speed || 3),
            }))
            .filter((item) => item.y < 500 || item.id === pendingDataId),
        )
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [isConnected, isGameOver, pendingDataId])

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
    <div
      className="relative min-h-screen overflow-hidden select-none"
      onCopy={(e) => e.preventDefault()}
    >
      {activeQuestion && (
        <QuestionModal
          key={activeQuestion.id}
          question={activeQuestion}
          onAnswer={handleQuizAnswer}
          onTimeout={() => handleQuizAnswer(false)}
        />
      )}
      
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
          maxPlayers={roomInfo?.maxPlayers ?? 20}
        />

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Game Canvas */}
          <div className="lg:col-span-3">
            <GameCanvas dataItems={dataItems} onDataClick={handleDataClick} role={role} />
          </div>

          {/* Ranking Panel */}
          <div className="lg:col-span-1">
            <RankingPanel players={players} currentRole={role} />
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
