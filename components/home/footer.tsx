import { Button } from "@/components/ui/button"
import { Facebook, Instagram } from "lucide-react"

// TikTok icon component
const TikTokIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

export function Footer() {
  return (
    <footer id="contact" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center">
              <img 
                src="/branch.png" 
                alt="TEECRAFT Logo" 
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-xl font-bold text-foreground">TEECRAFT</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {"Cách mạng hóa thời trang với công nghệ TEECRAFT. Tạo ra những thiết kế trang phục độc đáo và cá nhân hóa từ bất kỳ hình ảnh nào."}
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://www.facebook.com/profile.php?id=61581261208179" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://www.instagram.com/teecraft.5/" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://www.tiktok.com/@teecraft5" target="_blank" rel="noopener noreferrer">
                  <TikTokIcon />
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{"Sản Phẩm"}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="/design" className="hover:text-primary transition-colors">
                  {"Công Cụ Thiết Kế"}
                </a>
              </li>
              <li>
                <a href="/products" className="hover:text-primary transition-colors">
                  {"Danh Mục Sản Phẩm"}
                </a>
              </li>
              {/* <li>
                <a href="/packages" className="hover:text-primary transition-colors">
                  {"Gói Token"}
                </a>
              </li> */}
              <li>
                <a href="/cart" className="hover:text-primary transition-colors">
                  {"Giỏ Hàng"}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{"Hỗ Trợ"}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="/contact" className="hover:text-primary transition-colors">
                  {"Liên Hệ"}
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-primary transition-colors">
                  {"Giới Thiệu"}
                </a>
              </li>
              <li>
                <a href="/account" className="hover:text-primary transition-colors">
                  {"Tài Khoản"}
                </a>
              </li>
              <li>
                <a href="/checkout" className="hover:text-primary transition-colors">
                  {"Thanh Toán"}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{"Công Ty"}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="/about" className="hover:text-primary transition-colors">
                  {"Về Chúng Tôi"}
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-primary transition-colors">
                  {"Liên Hệ"}
                </a>
              </li>
              <li>
                <a href="/auth/login" className="hover:text-primary transition-colors">
                  {"Đăng Nhập"}
                </a>
              </li>
              <li>
                <a href="/auth/register" className="hover:text-primary transition-colors">
                  {"Đăng Ký"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
          <p>{"© 2025 Bản quyền thuộc về TEECRAFT. Tất cả quyền được bảo lưu."}</p>
          <p className="text-sm mt-2">{"Design by hdung7903"}</p>
        </div>
      </div>
    </footer>
  )
}
