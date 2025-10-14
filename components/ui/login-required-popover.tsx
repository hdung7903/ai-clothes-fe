"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LogIn } from "lucide-react"
import Link from "next/link"
import { useAppSelector } from "@/redux/hooks"

interface LoginRequiredPopoverProps {
  children: React.ReactNode
  action?: string
  className?: string
  onAction?: () => void
}

export function LoginRequiredPopover({ children, action = "add items to cart", className, onAction }: LoginRequiredPopoverProps) {
  const [open, setOpen] = useState(false)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isAuthenticated) {
      onAction?.()
    } else {
      setOpen(true)
    }
  }

  // If user is authenticated, render children directly with the action
  if (isAuthenticated) {
    return (
      <div className={className} onClick={handleClick}>
        {children}
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={className} onClick={handleClick}>
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="center" side="top" sideOffset={8}>
        <div className="flex flex-col items-center space-y-4 p-2">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Yêu Cầu Đăng Nhập</h3>
            <p className="text-sm text-muted-foreground">
              Bạn cần đăng nhập để {action}. Vui lòng đăng nhập để tiếp tục.
            </p>
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Link href="/auth/login" className="flex-1">
              <Button className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Đăng Nhập
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Đăng ký tại đây
              </Link>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
