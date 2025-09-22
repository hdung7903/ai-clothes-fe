import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-foreground">FashionAI</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {"Transforming fashion with AI technology. Create unique, personalized clothing designs from any image."}
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{"Product"}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Design Tools"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"AI Features"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Product Catalog"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Custom Orders"}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{"Support"}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Help Center"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Tutorials"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Contact Us"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Size Guide"}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{"Company"}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"About Us"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Careers"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Privacy Policy"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Terms of Service"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
          <p>{"© 2024 FashionAI. All rights reserved. Powered by cutting-edge AI technology."}</p>
        </div>
      </div>
    </footer>
  )
}
