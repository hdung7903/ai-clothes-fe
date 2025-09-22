import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>{"AI-Powered Fashion Revolution"}</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
              {"Transform "}
              <span className="text-primary">{"Images"}</span>
              {" into "}
              <span className="text-accent">{"Custom Fashion"}</span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty leading-relaxed max-w-2xl">
              {
                "Revolutionary AI technology that turns your inspiration images into stunning, wearable fashion designs. Create unique clothing pieces tailored to your style and vision."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-6">
                {"Start Creating Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                {"View Gallery"}
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                <span>{"10,000+ Designs Created"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-accent rounded-full"></div>
                <span>{"AI-Powered Technology"}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8">
              <img
                src="/ai-fashion-design-interface-with-clothing-sketches.jpg"
                alt="AI Fashion Design Interface"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              {"✨ AI Magic"}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
