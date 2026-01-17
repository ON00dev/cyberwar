"use client"

import type React from "react"

import { useRef, useEffect, useCallback } from "react"
import type { DataItem, Role } from "./cyber-war-game"

interface GameCanvasProps {
  dataItems: DataItem[]
  onDataClick: (dataId: string) => void
  role: Role
}

export function GameCanvas({ dataItems, onDataClick, role }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "critico":
        return "#ff3366"
      case "confidencial":
        return "#ff9f1c"
      default:
        return "#ffd60a"
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid background
    ctx.strokeStyle = "rgba(0, 255, 213, 0.05)"
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw scan lines
    const scanLineY = (Date.now() / 20) % canvas.height
    ctx.strokeStyle = "rgba(0, 255, 213, 0.1)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, scanLineY)
    ctx.lineTo(canvas.width, scanLineY)
    ctx.stroke()

    // Draw data items
    dataItems.forEach((item) => {
      if (item.captured) return

      const color = getTypeColor(item.type)
      const size = 24

      // Glow effect
      ctx.shadowColor = color
      ctx.shadowBlur = 15

      // Draw hexagon shape
      ctx.fillStyle = color
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const x = item.x + size / 2 + (size / 2) * Math.cos(angle)
        const y = item.y + size / 2 + (size / 2) * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()

      // Inner detail
      ctx.shadowBlur = 0
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const x = item.x + size / 2 + (size / 4) * Math.cos(angle)
        const y = item.y + size / 2 + (size / 4) * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()

      // Type indicator
      ctx.fillStyle = "#fff"
      ctx.font = "bold 10px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const label = item.type === "critico" ? "!" : item.type === "confidencial" ? "?" : "•"
      ctx.fillText(label, item.x + size / 2, item.y + size / 2)
    })

    // Reset shadow
    ctx.shadowBlur = 0
  }, [dataItems])

  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      draw()
      requestAnimationFrame(animate)
    })
    return () => cancelAnimationFrame(animationFrame)
  }, [draw])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!role || role === "observer") return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    dataItems.forEach((item) => {
      if (!item.captured && mx > item.x && mx < item.x + 24 && my > item.y && my < item.y + 24) {
        onDataClick(item.id)
      }
    })
  }

  return (
    <div className="relative">
      {/* Terminal-style frame */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
            <span className="text-xs text-muted-foreground tracking-wider">BATTLEFIELD_MONITOR.sys</span>
          </div>
          <span className="text-xs text-primary">{dataItems.filter((d) => !d.captured).length} PACKETS ACTIVE</span>
        </div>

        {/* Canvas container */}
        <div className="relative bg-[#050a12]">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            onClick={handleClick}
            className={`w-full h-auto ${role && role !== "observer" ? "cursor-crosshair" : "cursor-default"}`}
          />

          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary/50" />
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary/50" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary/50" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary/50" />
        </div>
      </div>
    </div>
  )
}
