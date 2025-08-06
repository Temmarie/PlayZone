"use client"

import { useCallback, useRef } from "react"

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.1) => {
      try {
        const audioContext = getAudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        oscillator.type = type

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration)
      } catch (error) {
        console.warn("Audio playback failed:", error)
      }
    },
    [getAudioContext],
  )

  const playClick = useCallback(() => {
    playTone(800, 0.1, "square", 0.05)
  }, [playTone])

  const playSuccess = useCallback(() => {
    playTone(523, 0.2, "sine", 0.1) // C5
    setTimeout(() => playTone(659, 0.2, "sine", 0.1), 100) // E5
    setTimeout(() => playTone(784, 0.3, "sine", 0.1), 200) // G5
  }, [playTone])

  const playError = useCallback(() => {
    playTone(200, 0.3, "sawtooth", 0.1)
  }, [playTone])

  const playMove = useCallback(() => {
    playTone(400, 0.1, "triangle", 0.05)
  }, [playTone])

  const playEat = useCallback(() => {
    playTone(600, 0.15, "square", 0.08)
  }, [playTone])

  const playGameOver = useCallback(() => {
    playTone(300, 0.2, "sawtooth", 0.1)
    setTimeout(() => playTone(250, 0.2, "sawtooth", 0.1), 150)
    setTimeout(() => playTone(200, 0.4, "sawtooth", 0.1), 300)
  }, [playTone])

  const playLineClear = useCallback(() => {
    playTone(800, 0.1, "square", 0.08)
    setTimeout(() => playTone(1000, 0.1, "square", 0.08), 50)
    setTimeout(() => playTone(1200, 0.2, "square", 0.08), 100)
  }, [playTone])

  const playWordFound = useCallback(() => {
    playTone(440, 0.1, "sine", 0.06) // A4
    setTimeout(() => playTone(554, 0.1, "sine", 0.06), 80) // C#5
    setTimeout(() => playTone(659, 0.2, "sine", 0.06), 160) // E5
  }, [playTone])

  return {
    playClick,
    playSuccess,
    playError,
    playMove,
    playEat,
    playGameOver,
    playLineClear,
    playWordFound,
    playTone,
  }
}
