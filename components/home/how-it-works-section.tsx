import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Wand2, Palette, ShoppingCart } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Your Image",
    description:
      "Start by uploading any image that inspires you - from nature photos to artwork, anything can become fashion.",
  },
  {
    step: "02",
    icon: Wand2,
    title: "AI Magic Happens",
    description:
      "Our advanced AI analyzes your image and generates multiple unique clothing design variations in seconds.",
  },
  {
    step: "03",
    icon: Palette,
    title: "Customize & Perfect",
    description: "Fine-tune colors, adjust patterns, modify styles, and make the design perfectly match your vision.",
  },
  {
    step: "04",
    icon: ShoppingCart,
    title: "Order & Enjoy",
    description:
      "Place your order and receive your custom-designed, high-quality clothing piece delivered to your door.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-balance">
            {"How It "}
            <span className="text-primary">{"Works"}</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            {
              "From inspiration to creation in just four simple steps. Our AI makes fashion design accessible to everyone."
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="border-border hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader className="space-y-4 text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center relative">
                    <step.icon className="h-8 w-8 text-primary" />
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="h-0.5 w-8 bg-border"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
