import { useState, useEffect, useMemo } from "react"
import type { Question } from "../data/questions"

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const result = [...items]
  let currentSeed = seed || 1

  function random() {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296
    return currentSeed / 4294967296
  }

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }

  return result
}

interface QuestionModalProps {
  question: Question
  onAnswer: (correct: boolean) => void
  onTimeout: () => void
}

export function QuestionModal({ question, onAnswer, onTimeout }: QuestionModalProps) {
  const [timeLeft, setTimeLeft] = useState(10)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const shuffledOptions = useMemo(
    () =>
      shuffleWithSeed(
        question.options.map((opt, index) => ({
          text: opt,
          originalIndex: index,
        })),
        hashString(question.id),
      ),
    [question],
  )

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onTimeout])

  const handleOptionClick = (originalIndex: number) => {
    if (selectedOption !== null) return // Evita múltiplos cliques
    
    setSelectedOption(originalIndex)
    
    // Mostra resultado por 1s antes de fechar
    setTimeout(() => {
        const isCorrect = originalIndex === question.correctIndex
        onAnswer(isCorrect)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold tracking-wider text-muted-foreground">DESAFIO DE SEGURANÇA</span>
          <span className={`text-lg font-mono font-bold ${timeLeft <= 3 ? "text-red-500 animate-pulse" : "text-primary"}`}>
            00:{timeLeft.toString().padStart(2, "0")}
          </span>
        </div>

        <div className="w-full bg-secondary h-1 mb-6 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>

        <h3 className="text-lg font-medium text-center mb-8">{question.text}</h3>

        <div className="space-y-3 select-none">
          {shuffledOptions.map((option, index) => {
            const originalIndex = option.originalIndex
            let buttonStyle = "border-border bg-muted/50 hover:bg-muted hover:border-primary text-foreground"
            let iconStyle = "text-muted-foreground"

            if (selectedOption !== null) {
                if (originalIndex === question.correctIndex) {
                    buttonStyle = "border-green-500 bg-green-500/20 text-green-500" // Mostra a correta
                    iconStyle = "text-green-500"
                } else if (selectedOption === originalIndex) {
                    buttonStyle = "border-red-500 bg-red-500/20 text-red-500" // Mostra o erro
                    iconStyle = "text-red-500"
                } else {
                    buttonStyle = "opacity-50 border-border bg-muted/20" // Apaga as outras
                }
            }

            return (
            <button
              key={index}
              disabled={selectedOption !== null}
              onClick={() => handleOptionClick(originalIndex)}
              className={`w-full p-4 text-left text-sm rounded-lg border transition-all duration-300 focus:outline-none ${buttonStyle}`}
            >
              <span className={`font-mono mr-3 ${iconStyle}`}>
                {String.fromCharCode(65 + index)}.
              </span>
              {option.text}
            </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
