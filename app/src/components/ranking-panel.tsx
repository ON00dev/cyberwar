"use client"

import { Shield, Skull, Trophy, TrendingUp } from "lucide-react"
import type { Player, Role } from "./cyber-war-game"

interface RankingPanelProps {
  players: Player[]
}

export function RankingPanel({ players, currentRole }: RankingPanelProps & { currentRole: Role | null }) {
  const defenders = players.filter((p) => p.role === "defesa").sort((a, b) => b.score - a.score)

  const hackers = players.filter((p) => p.role === "hacker").sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-4">
      {/* Main ranking card */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="flex items-center gap-2 px-4 py-3 bg-muted border-b border-border">
          <Trophy className="w-4 h-4 text-cyber-yellow" />
          <span className="text-sm font-bold tracking-wider">RANKING</span>
        </div>

        <div className="p-4 space-y-6">
          {(currentRole === "hacker" ? ["hackers", "defenders"] : ["defenders", "hackers"]).map((group) =>
            group === "defenders" ? (
              <div key="defenders">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-cyber-green" />
                  <span className="text-xs font-bold text-cyber-green tracking-wider">DEFENSORES</span>
                </div>

                {defenders.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Nenhum defensor conectado</p>
                ) : (
                  <div className="space-y-2">
                    {defenders.map((player, index) => (
                      <div
                        key={player.username}
                        className="flex items-center justify-between p-2 rounded bg-cyber-green/5 border border-cyber-green/20"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-cyber-green font-bold w-4">#{index + 1}</span>
                          <span className="text-sm truncate max-w-[100px]">{player.username}</span>
                        </div>
                        <div className="flex items-center gap-1 text-cyber-green">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-sm font-bold">{player.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div key="hackers">
                <div className="flex items-center gap-2 mb-3">
                  <Skull className="w-4 h-4 text-cyber-red" />
                  <span className="text-xs font-bold text-cyber-red tracking-wider">INVASORES</span>
                </div>

                {hackers.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Nenhum invasor conectado</p>
                ) : (
                  <div className="space-y-2">
                    {hackers.map((player, index) => (
                      <div
                        key={player.username}
                        className="flex items-center justify-between p-2 rounded bg-cyber-red/5 border border-cyber-red/20"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-cyber-red font-bold w-4">#{index + 1}</span>
                          <span className="text-sm truncate max-w-[100px]">{player.username}</span>
                        </div>
                        <div className="flex items-center gap-1 text-cyber-red">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-sm font-bold">{player.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      </div>

      {/* Stats card */}
      <div className="border border-border rounded-lg overflow-hidden bg-card p-4">
        <h3 className="text-xs font-bold text-muted-foreground tracking-wider mb-3">ESTATÍSTICAS DA SESSÃO</h3>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-2 rounded bg-muted">
            <p className="text-lg font-bold text-cyber-green">{defenders.length}</p>
            <p className="text-xs text-muted-foreground">Defensores</p>
          </div>
          <div className="p-2 rounded bg-muted">
            <p className="text-lg font-bold text-cyber-red">{hackers.length}</p>
            <p className="text-xs text-muted-foreground">Invasores</p>
          </div>
        </div>
      </div>
    </div>
  )
}
