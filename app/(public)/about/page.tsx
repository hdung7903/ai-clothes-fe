import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Target, Award, Lightbulb } from "lucide-react"

export default function AboutPage() {
  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      image: "/placeholder.svg?key=sarah",
      bio: "Former fashion designer with 10+ years in AI research",
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder",
      image: "/placeholder.svg?key=marcus",
      bio: "AI engineer specializing in computer vision and design",
    },
    {
      name: "Emily Watson",
      role: "Head of Design",
      image: "/placeholder.svg?key=emily",
      bio: "Fashion industry veteran with expertise in sustainable design",
    },
  ]

  const values = [
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Innovation",
      description: "Pushing the boundaries of AI-powered fashion design",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community",
      description: "Building a platform where creativity meets technology",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Quality",
      description: "Delivering premium products with attention to detail",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Sustainability",
      description: "Committed to eco-friendly practices and materials",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4">About FashionAI</Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">Revolutionizing Fashion with AI</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to democratize fashion design by making AI-powered clothing creation accessible to
              everyone, from professional designers to creative enthusiasts.
            </p>
          </div>

          {/* Story Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Founded in 2023, FashionAI emerged from a simple observation: while AI was transforming industries
                worldwide, fashion design remained largely unchanged. Our founders, combining decades of experience in
                fashion and artificial intelligence, set out to bridge this gap.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we're proud to offer a platform that transforms any image into stunning, wearable designs. From
                concept sketches to photographs, our AI understands the nuances of fashion and translates visual
                inspiration into custom clothing that reflects your unique style.
              </p>
            </CardContent>
          </Card>

          {/* Values Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="text-primary">{value.icon}</div>
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="text-center">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Create?</h3>
              <p className="text-muted-foreground mb-6">Join thousands of creators who are already designing with AI</p>
              <Button size="lg">Start Designing Now</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
