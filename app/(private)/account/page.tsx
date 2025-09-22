import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Heart, Settings, History, Palette } from "lucide-react"

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Account</h1>
            <p className="text-muted-foreground">Manage your account and design preferences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/account/orders">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Order History
                  </CardTitle>
                  <CardDescription>View your past orders and track current ones</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/account/designs">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    My Saved Designs
                  </CardTitle>
                  <CardDescription>Access your saved and draft designs</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/account/favorites">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Favorite Designs
                  </CardTitle>
                  <CardDescription>Your liked and bookmarked designs</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/account/profile">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Account Info
                  </CardTitle>
                  <CardDescription>Update your profile and change password</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/account/preferences">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Preferences
                  </CardTitle>
                  <CardDescription>Customize your design preferences</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
