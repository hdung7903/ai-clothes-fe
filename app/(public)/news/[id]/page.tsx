import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock, Share, Heart } from "lucide-react"
import Link from "next/link"

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  // Mock article data - in real app, fetch based on params.id
  const article = {
    id: params.id,
    title: "Introducing AI-Powered Pattern Generation",
    content: `
      <p>We're excited to announce our latest breakthrough in AI-powered fashion design: advanced pattern generation capabilities that can transform simple sketches into intricate, professional-quality designs.</p>
      
      <h2>What's New</h2>
      <p>Our new pattern generation system uses cutting-edge machine learning algorithms to understand the nuances of fashion design. Whether you're working with geometric shapes, organic forms, or abstract concepts, our AI can interpret your vision and create stunning patterns that are ready for production.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li><strong>Intelligent Pattern Recognition:</strong> Upload any sketch or image, and our AI will identify key design elements</li>
        <li><strong>Style Transfer:</strong> Apply different artistic styles to your patterns with a single click</li>
        <li><strong>Seamless Tiling:</strong> Automatically generate patterns that tile perfectly across any garment</li>
        <li><strong>Color Palette Suggestions:</strong> Get AI-recommended color combinations that work beautifully together</li>
      </ul>
      
      <h2>How It Works</h2>
      <p>The process is incredibly simple. Just upload your base image or sketch, select your preferred style parameters, and let our AI do the rest. Within seconds, you'll have multiple pattern variations to choose from, each optimized for different garment types.</p>
      
      <p>This update represents months of research and development, incorporating feedback from our community of designers and fashion enthusiasts. We're confident it will revolutionize how you approach pattern design.</p>
    `,
    category: "Product Update",
    author: "Sarah Chen",
    date: "2024-01-20",
    readTime: "5 min read",
    image: "/placeholder.svg?key=pattern-article",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/news" className="text-primary hover:underline">
              ← Back to News
            </Link>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <Badge className="mb-4">{article.category}</Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">{article.title}</h1>

            <div className="flex items-center gap-6 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Like
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="aspect-video rounded-lg overflow-hidden mb-8">
            <img src={article.image || "/placeholder.svg"} alt={article.title} className="w-full h-full object-cover" />
          </div>

          {/* Article Content */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
            </CardContent>
          </Card>

          {/* Related Articles */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="overflow-hidden">
                <div className="aspect-video">
                  <img
                    src="/placeholder.svg?key=related1"
                    alt="Related article"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <Badge className="mb-2">Tutorial</Badge>
                  <h3 className="font-semibold mb-2">How to Create Your First AI Design</h3>
                  <p className="text-muted-foreground text-sm">Step-by-step guide for beginners</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="aspect-video">
                  <img
                    src="/placeholder.svg?key=related2"
                    alt="Related article"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <Badge className="mb-2">Community</Badge>
                  <h3 className="font-semibold mb-2">Community Spotlight</h3>
                  <p className="text-muted-foreground text-sm">Amazing designs from our users</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
