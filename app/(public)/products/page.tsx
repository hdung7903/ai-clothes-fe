"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ShoppingCart, Search } from "lucide-react"
import Link from "next/link"
import { ProductGridSkeleton } from "@/components/ui/loading/product-skeleton"

export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    // Simulate API call
    const loadProducts = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate loading
      setProducts([
        {
          id: "PROD-001",
          name: "Custom T-Shirt Design",
          price: "$29.99",
          category: "T-Shirts",
          rating: 4.8,
          image: "/custom-t-shirt-design.jpg",
          isNew: true,
        },
        {
          id: "PROD-002",
          name: "Custom Hoodie",
          price: "$49.99",
          category: "Hoodies",
          rating: 4.9,
          image: "/custom-hoodie.png",
          isNew: false,
        },
        {
          id: "PROD-003",
          name: "Floral T-Shirt Design",
          price: "$32.99",
          category: "T-Shirts",
          rating: 4.7,
          image: "/floral-t-shirt-design.jpg",
          isNew: true,
        },
        {
          id: "PROD-004",
          name: "Geometric Hoodie Design",
          price: "$54.99",
          category: "Hoodies",
          rating: 4.6,
          image: "/geometric-hoodie-design.jpg",
          isNew: false,
        },
        {
          id: "PROD-005",
          name: "Abstract Dress Design",
          price: "$69.99",
          category: "Dresses",
          rating: 4.8,
          image: "/abstract-dress-design.jpg",
          isNew: true,
        },
        {
          id: "PROD-006",
          name: "Vintage Band T-Shirt",
          price: "$34.99",
          category: "T-Shirts",
          rating: 4.5,
          image: "/vintage-band-t-shirt.jpg",
          isNew: false,
        },
      ])
      setIsLoading(false)
    }

    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Products</h1>
          <p className="text-muted-foreground">Discover AI-designed clothing and create your own</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search products..." className="pl-10" />
          </div>
          <Select>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="t-shirts">T-Shirts</SelectItem>
              <SelectItem value="hoodies">Hoodies</SelectItem>
              <SelectItem value="dresses">Dresses</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isNew && <Badge className="absolute top-2 left-2">New</Badge>}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{product.category}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{product.price}</div>
                      <div className="text-sm text-muted-foreground">★ {product.rating}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        View Details
                      </Button>
                    </Link>
                    <Button size="icon">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
