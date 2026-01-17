"use client"

import { useState, type ChangeEvent, type KeyboardEvent } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Shield, Skull, Eye, Terminal } from "lucide-react"
import type { Role, RoomInfo } from "./cyber-war-game"

interface EntryModalProps {
  onJoin: (username: string, role: Role) => void
  roomInfo: RoomInfo | null
}

export function EntryModal({ onJoin, roomInfo }: EntryModalProps) {
  const [username, setUsername] = useState("")
  const [step, setStep] = useState<"name" | "role">("name")

  const isDefendersFull = (roomInfo?.defendersCount ?? 0) >= 5
  const isHackersFull = (roomInfo?.hackersCount ?? 0) >= 5

  const handleContinue = () => {
    if (username.trim() === "") {
      onJoin("", "observer")
    } else {
      setStep("role")
    }
  }

  const handleRoleSelect = (role: Role) => {
    onJoin(username, role)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,213,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,213,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />

      <div className="relative w-full max-w-md mx-4">
        {/* Terminal window */}
        <div className="border border-border rounded-lg overflow-hidden bg-card shadow-2xl shadow-primary/5">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-muted border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-cyber-red" />
              <div className="w-3 h-3 rounded-full bg-cyber-orange" />
              <div className="w-3 h-3 rounded-full bg-cyber-green" />
            </div>
            <div className="flex-1 text-center text-xs text-muted-foreground tracking-wider">SYSTEM_ACCESS.exe</div>
          </div>

          <div className="p-6">
            {step === "name" ? (
              <div className="space-y-6">
                <div className="text-center">
                  <Terminal className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h2 className="text-xl font-bold tracking-tight">
                    <span className="text-primary">CYBER</span>
                    <span className="text-accent">_WAR</span>
                  </h2>
                  <p className="text-muted-foreground text-sm mt-2">// Insira suas credenciais de acesso</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground tracking-wider">USER_ID:</label>
                    <Input
                      value={username}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                      placeholder="Digite seu codinome..."
                      className="bg-muted border-border focus:border-primary focus:ring-primary/20 font-mono"
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleContinue()}
                    />
                    <p className="text-xs text-muted-foreground">* Deixe vazio para modo observador</p>
                  </div>

                  <Button
                    onClick={handleContinue}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-wider"
                  >
                    {username.trim() === "" ? "ENTRAR COMO OBSERVADOR" : "CONTINUAR →"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground tracking-wider mb-2">OPERADOR: {username}</p>
                  <h2 className="text-xl font-bold">SELECIONE SUA FACÇÃO</h2>
                </div>

                <div className="grid gap-4">
                  <button
                    onClick={() => handleRoleSelect("defesa")}
                    disabled={isDefendersFull}
                    className={`group p-4 rounded-lg border transition-all text-left flex items-center justify-between ${
                      isDefendersFull
                        ? "border-muted bg-muted/10 opacity-50 cursor-not-allowed"
                        : "border-cyber-green/30 bg-cyber-green/5 hover:bg-cyber-green/10 hover:border-cyber-green/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-cyber-green/20 text-cyber-green">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-cyber-green">DEFENSOR {isDefendersFull && "(LOTADO)"}</h3>
                        <p className="text-xs text-muted-foreground">Proteja os dados contra invasores</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-mono text-muted-foreground">{roomInfo?.defendersCount ?? 0}/5</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect("hacker")}
                    disabled={isHackersFull}
                    className={`group p-4 rounded-lg border transition-all text-left flex items-center justify-between ${
                      isHackersFull
                        ? "border-muted bg-muted/10 opacity-50 cursor-not-allowed"
                        : "border-cyber-red/30 bg-cyber-red/5 hover:bg-cyber-red/10 hover:border-cyber-red/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-cyber-red/20 text-cyber-red">
                        <Skull className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-cyber-red">INVASOR {isHackersFull && "(LOTADO)"}</h3>
                        <p className="text-xs text-muted-foreground">Capture dados sensíveis do sistema</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-mono text-muted-foreground">{roomInfo?.hackersCount ?? 0}/5</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect("observer")}
                    className="group p-4 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-muted text-muted-foreground">
                        <Eye className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-muted-foreground">OBSERVADOR</h3>
                        <p className="text-xs text-muted-foreground">Apenas monitore a batalha</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
