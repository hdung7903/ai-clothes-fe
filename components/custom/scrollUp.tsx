"use client"

import { useEffect, useState, useCallback } from "react"
import { ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ScrollUpProps {
  /**
   * Number of pixels scrolled vertically before the button appears
   * Defaults to 200
   */
  threshold?: number
  /**
   * Optional custom className to extend/override positioning or spacing
   */
  className?: string
  /**
   * Override base positioning classes. Defaults to fixed bottom-right.
   * Example: "fixed bottom-6 right-20"
   */
  positionClass?: string
}

export default function ScrollUp({ threshold = 200, className, positionClass = "fixed bottom-6 right-6" }: ScrollUpProps) {
  const [isVisible, setIsVisible] = useState(false)

  const handleScroll = useCallback(() => {
    // Use requestAnimationFrame to avoid flooding setState during scroll
    window.requestAnimationFrame(() => {
      setIsVisible(window.scrollY > threshold)
    })
  }, [threshold])

  useEffect(() => {
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div
      aria-hidden={!isVisible}
      className={
        positionClass +
        " z-50 transition-opacity duration-300 " +
        (isVisible ? "opacity-100" : "opacity-0 pointer-events-none ") +
        (className ? className : "")
      }
    >
      <Button
        aria-label="Scroll to top"
        size="icon"
        variant="secondary"
        className="rounded-full shadow-lg hover:shadow-xl"
        onClick={scrollToTop}
      >
        <ArrowUp className="size-5" />
      </Button>
    </div>
  )
}


