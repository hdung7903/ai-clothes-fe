"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Server, Home, RefreshCw } from "lucide-react"

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <Server className="h-16 w-16 text-destructive mx-auto mb-4" />
            <div className="text-6xl font-bold text-destructive mb-2">500</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Server Error</h1>
            <p className="text-muted-foreground">
              Something went wrong on our end. Our team has been notified and is working on a fix.
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
