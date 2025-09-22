import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, Edit, Share, Trash2 } from "lucide-react"
import Link from "next/link"

export default function SavedDesignsPage() {
  const designs = [
    {
      id: "DES-001",
      name: "Summer Floral Tee",
      date: "2024-01-20",
      status: "Draft",
      image: "/floral-t-shirt-design.jpg",
    },
    {
      id: "DES-002",
      name: "Geometric Hoodie",
      date: "2024-01-18",
      status: "Complete",
      image: "/geometric-hoodie-design.jpg",
    },
    {
      id: "DES-003",
      name: "Abstract Art Dress",
      date: "2024-01-15",
      status: "Complete",
      image: "/abstract-dress-design.jpg",
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
            <h1 className="text-3xl font-bold text-foreground mb-2">My Saved Designs</h1>
            <p className="text-muted-foreground">Manage your created and saved designs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <Card key={design.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={design.image || "/placeholder.svg"}
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    className="absolute top-2 right-2"
                    variant={design.status === "Complete" ? "default" : "secondary"}
                  >
                    {design.status}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    {design.name}
                  </CardTitle>
                  <CardDescription>Created on {design.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
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
