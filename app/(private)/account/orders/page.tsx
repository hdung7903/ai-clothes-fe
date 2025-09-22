import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ShoppingCart, Eye } from "lucide-react"
import Link from "next/link"

export default function FavoriteDesignsPage() {
  const favorites = [
    {
      id: "FAV-001",
      name: "Vintage Band Tee",
      designer: "AI Designer",
      price: "$29.99",
      image: "/vintage-band-t-shirt.jpg",
    },
    {
      id: "FAV-002",
      name: "Minimalist Hoodie",
      designer: "Community",
      price: "$49.99",
      image: "/minimalist-hoodie-design.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/account" className="text-primary hover:underline mb-4 inline-block">
              ← Back to Account
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Favorite Designs</h1>
            <p className="text-muted-foreground">Your liked and bookmarked designs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={favorite.image || "/placeholder.svg"}
                    alt={favorite.name}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle>{favorite.name}</CardTitle>
                  <CardDescription>by {favorite.designer}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary">{favorite.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
