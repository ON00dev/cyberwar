"use client"

import { Trophy, Medal, Crown, Shield, Skull, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player } from "./cyber-war-game"

interface GameOverModalProps {
  players: Player[]
  onBackToMenu: () => void
}

export function GameOverModal({ players, onBackToMenu }: GameOverModalProps) {
  // Ordena jogadores por pontuação
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const winner = sortedPlayers[0]

  // Calcula estatísticas
  const totalPoints = players.reduce((sum, p) => sum + p.score, 0)
  const defensePoints = players.filter((p) => p.role === "defesa").reduce((sum, p) => sum + p.score, 0)
  const hackerPoints = players.filter((p) => p.role === "hacker").reduce((sum, p) => sum + p.score, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Glowing background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg mx-4">
        {/* Terminal window */}
        <div className="border border-primary/50 rounded-lg overflow-hidden bg-card shadow-[0_0_60px_rgba(0,255,213,0.2)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-primary/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyber-red" />
              <div className="w-3 h-3 rounded-full bg-cyber-orange" />
              <div className="w-3 h-3 rounded-full bg-cyber-green" />
            </div>
            <span className="text-xs text-primary tracking-widest font-mono">GAME_OVER.exe</span>
            <div className="w-16" />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-wider text-foreground">TEMPO ESGOTADO</h2>
              <p className="text-sm text-muted-foreground tracking-wide">// PARTIDA FINALIZADA</p>
            </div>

            {/* Winner announcement */}
            {winner && (
              <div className="relative p-4 rounded-lg border border-cyber-yellow/30 bg-cyber-yellow/5 text-center">
                <Crown className="w-8 h-8 text-cyber-yellow mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">VENCEDOR</p>
                <p className="text-xl font-bold text-cyber-yellow flex items-center justify-center gap-2">
                  {winner.role === "defesa" ? (
                    <Shield className="w-5 h-5 text-cyber-green" />
                  ) : (
                    <Skull className="w-5 h-5 text-cyber-red" />
                  )}
                  {winner.username}
                </p>
                <p className="text-2xl font-mono font-bold text-foreground mt-1">{winner.score} PTS</p>
              </div>
            )}

            {/* Ranking */}
            <div className="space-y-2">
              <h3 className="text-sm text-muted-foreground tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                RANKING FINAL
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.username}
                    className={`flex items-center justify-between px-3 py-2 rounded border ${
                      index === 0 ? "border-cyber-yellow/50 bg-cyber-yellow/10" : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-mono ${index === 0 ? "text-cyber-yellow" : "text-muted-foreground"}`}
                      >
                        #{index + 1}
                      </span>
                      {index === 0 && <Medal className="w-4 h-4 text-cyber-yellow" />}
                      {player.role === "defesa" ? (
                        <Shield className="w-4 h-4 text-cyber-green" />
                      ) : (
                        <Skull className="w-4 h-4 text-cyber-red" />
                      )}
                      <span className="text-sm font-medium">{player.username}</span>
                    </div>
                    <span className="text-sm font-mono font-bold">{player.score} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">TOTAL</p>
                <p className="text-lg font-mono font-bold text-foreground">{totalPoints}</p>
              </div>
              <div className="p-3 rounded border border-cyber-green/30 bg-cyber-green/5">
                <p className="text-xs text-cyber-green mb-1">DEFESA</p>
                <p className="text-lg font-mono font-bold text-cyber-green">{defensePoints}</p>
              </div>
              <div className="p-3 rounded border border-cyber-red/30 bg-cyber-red/5">
                <p className="text-xs text-cyber-red mb-1">HACKERS</p>
                <p className="text-lg font-mono font-bold text-cyber-red">{hackerPoints}</p>
              </div>
            </div>

            <Button
              onClick={onBackToMenu}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wider"
            >
              <Home className="w-4 h-4 mr-2" />
              VOLTAR AO MENU
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
