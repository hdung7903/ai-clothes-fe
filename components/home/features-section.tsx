import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Zap, ShoppingBag, Users, Sparkles, Camera, Shirt, Heart } from "lucide-react"

const features = [
  {
    icon: Camera,
    title: "Image-to-Design AI",
    description:
      "Upload any image and watch our AI transform it into stunning clothing designs with incredible accuracy and creativity.",
  },
  {
    icon: Palette,
    title: "Custom Design Tools",
    description:
      "Fine-tune colors, patterns, and styles with our intuitive design interface. Make every piece uniquely yours.",
  },
  {
    icon: Shirt,
    title: "Product Catalog",
    description: "Browse thousands of AI-generated designs or create your own. From casual wear to haute couture.",
  },
  {
    icon: Users,
    title: "User Accounts",
    description:
      "Save your designs, track orders, and build your personal fashion portfolio with secure user accounts.",
  },
  {
    icon: ShoppingBag,
    title: "Seamless Shopping",
    description: "Easy checkout process with multiple payment options. From design to doorstep in just a few clicks.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate professional-quality designs in seconds. Our AI processes images faster than ever before.",
  },
  {
    icon: Sparkles,
    title: "Style Recommendations",
    description: "Get personalized style suggestions based on your preferences and current fashion trends.",
  },
  {
    icon: Heart,
    title: "Community Features",
    description: "Share your creations, get inspired by others, and connect with fellow fashion enthusiasts.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-balance">
            {"Powerful Features for "}
            <span className="text-primary">{"Creative Fashion"}</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            {"Everything you need to transform your fashion ideas into reality with cutting-edge AI technology"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
