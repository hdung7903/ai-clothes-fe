import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

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
            <h3 className="text-lg font-semibold text-foreground">{"Sản Phẩm"}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Công Cụ Thiết Kế"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Tính Năng TEECRAFT"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Danh Mục Sản Phẩm"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Đơn Hàng Tùy Chỉnh"}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{"Hỗ Trợ"}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Trung Tâm Trợ Giúp"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Hướng Dẫn"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Liên Hệ"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Hướng Dẫn Kích Thước"}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{"Công Ty"}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Về Chúng Tôi"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Tuyển Dụng"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Chính Sách Bảo Mật"}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {"Điều Khoản Dịch Vụ"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
          <p>{"© 2025 Bản quyền thuộc về TEECRAFT. Tất cả quyền được bảo lưu."}</p>
        </div>
      </div>
    </footer>
  )
}
