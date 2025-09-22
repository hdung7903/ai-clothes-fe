import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Home, LogIn } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
            <div className="text-6xl font-bold text-destructive mb-2">401</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Unauthorized</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page. Please log in or contact support.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>

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
