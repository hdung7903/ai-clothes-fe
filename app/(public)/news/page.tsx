import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, User, Search } from "lucide-react"
import Link from "next/link"

export default function NewsPage() {
  const articles = [
    {
      id: "news-001",
      title: "Introducing AI-Powered Pattern Generation",
      excerpt:
        "Our latest update brings advanced pattern generation capabilities that can create intricate designs from simple sketches.",
      category: "Product Update",
      author: "Sarah Chen",
      date: "2024-01-20",
      readTime: "5 min read",
      image: "/placeholder.svg?key=pattern-gen",
    },
    {
      id: "news-002",
      title: "Sustainable Fashion: Our Eco-Friendly Materials",
      excerpt:
        "Learn about our commitment to sustainability and the eco-friendly materials we use in all our products.",
      category: "Sustainability",
      author: "Emily Watson",
      date: "2024-01-18",
      readTime: "7 min read",
      image: "/placeholder.svg?key=sustainable",
    },
    {
      id: "news-003",
      title: "How to Create Your First AI Design: A Beginner's Guide",
      excerpt: "Step-by-step tutorial for newcomers to get started with AI-powered clothing design.",
      category: "Tutorial",
      author: "Marcus Rodriguez",
      date: "2024-01-15",
      readTime: "10 min read",
      image: "/placeholder.svg?key=tutorial",
    },
    {
      id: "news-004",
      title: "Community Spotlight: Amazing Designs from Our Users",
      excerpt: "Showcasing incredible designs created by our community members using FashionAI.",
      category: "Community",
      author: "Design Team",
      date: "2024-01-12",
      readTime: "6 min read",
      image: "/placeholder.svg?key=community",
    },
    {
      id: "news-005",
      title: "The Future of Fashion: AI and Creativity",
      excerpt: "Exploring how artificial intelligence is reshaping the fashion industry and empowering designers.",
      category: "Industry Insights",
      author: "Sarah Chen",
      date: "2024-01-10",
      readTime: "8 min read",
      image: "/placeholder.svg?key=future-fashion",
    },
  ]

  const categories = ["All", "Product Update", "Tutorial", "Sustainability", "Community", "Industry Insights"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">News & Tutorials</h1>
            <p className="text-muted-foreground">Stay updated with the latest features, tips, and industry insights</p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search articles..." className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button key={category} variant="outline" size="sm">
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured Article */}
          <Card className="mb-8 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="aspect-video md:aspect-auto">
                <img
                  src={articles[0].image || "/placeholder.svg"}
                  alt={articles[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <Badge className="w-fit mb-2">{articles[0].category}</Badge>
                <h2 className="text-2xl font-bold mb-3">{articles[0].title}</h2>
                <p className="text-muted-foreground mb-4">{articles[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {articles[0].author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {articles[0].date}
                  </div>
                  <span>{articles[0].readTime}</span>
                </div>
                <Link href={`/news/${articles[0].id}`}>
                  <Button>Read Article</Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(1).map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video">
                  <img
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <Badge className="w-fit mb-2">{article.category}</Badge>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {article.author}
                    </div>
                    <span>{article.readTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {article.date}
                    </div>
                    <Link href={`/news/${article.id}`}>
                      <Button variant="outline" size="sm">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline">Load More Articles</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
