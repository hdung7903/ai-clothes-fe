import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent p-12 lg:p-20 text-center">
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>{"Ready to Create?"}</span>
            </div>

            <h2 className="text-3xl lg:text-5xl font-bold text-white text-balance">
              {"Start Your Fashion "}
              <br />
              {"Journey Today"}
            </h2>

            <p className="text-xl text-white/90 text-pretty max-w-2xl mx-auto">
              {
                "Join thousands of creators who are already transforming their ideas into stunning fashion pieces with our AI technology."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                {"Start Designing Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary bg-transparent"
              >
                {"Learn More"}
              </Button>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 border border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
