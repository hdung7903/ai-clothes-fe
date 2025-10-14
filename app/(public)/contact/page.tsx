import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Liên Hệ - TEECRAFT",
  description: "Liên hệ với TEECRAFT để được hỗ trợ về thiết kế áo thun cá nhân hóa, công nghệ AI và các dịch vụ thời trang tùy chỉnh.",
  keywords: "TEECRAFT, liên hệ, hỗ trợ khách hàng, thiết kế áo thun, AI, thời trang tùy chỉnh",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Liên Hệ Với TEECRAFT</h1>
            <p className="text-xl text-muted-foreground">
              Chúng tôi rất muốn nghe từ bạn. Gửi tin nhắn cho chúng tôi và chúng tôi sẽ phản hồi sớm nhất có thể.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Gửi Tin Nhắn Cho Chúng Tôi</CardTitle>
                <CardDescription>Điền vào biểu mẫu bên dưới và chúng tôi sẽ liên hệ lại với bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Tên</Label>
                    <Input id="firstName" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Họ</Label>
                    <Input id="lastName" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" />
                </div>
                <div>
                  <Label htmlFor="subject">Chủ Đề</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chủ đề" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Câu Hỏi Chung</SelectItem>
                      <SelectItem value="support">Hỗ Trợ Kỹ Thuật</SelectItem>
                      <SelectItem value="billing">Câu Hỏi Thanh Toán</SelectItem>
                      <SelectItem value="partnership">Hợp Tác</SelectItem>
                      <SelectItem value="feedback">Phản Hồi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Tin Nhắn</Label>
                  <Textarea id="message" placeholder="Hãy cho chúng tôi biết cách chúng tôi có thể giúp bạn..." rows={6} />
                </div>
                <Button className="w-full">Gửi Tin Nhắn</Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                <CardTitle>Liên Hệ Với Chúng Tôi</CardTitle>
                <CardDescription>Đây là những cách khác để liên hệ với chúng tôi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">Teecraft942025@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Điện Thoại</p>
                      <p className="text-muted-foreground">0332210528</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Địa Chỉ</p>
                      <p className="text-muted-foreground">
                        De La Thanh, Đống Đa
                        <br />
                        Hà Nội, Việt Nam
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Giờ Làm Việc</p>
                      <p className="text-muted-foreground">
                        Thứ 2 - Thứ 6: 9:00 - 18:00
                        <br />
                        Thứ 7 - Chủ Nhật: 10:00 - 16:00
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Câu Hỏi Thường Gặp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium mb-1">Thiết kế được tạo ra trong bao lâu?</p>
                    <p className="text-muted-foreground text-sm">
                      Hầu hết các thiết kế được tạo ra trong vòng 30-60 giây bằng công nghệ AI của TEECRAFT.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Bạn hỗ trợ những định dạng ảnh nào?</p>
                    <p className="text-muted-foreground text-sm">
                      Chúng tôi hỗ trợ các định dạng JPG, PNG, GIF và WebP với kích thước tối đa 10MB.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Tôi có thể chỉnh sửa thiết kế đã tạo không?</p>
                    <p className="text-muted-foreground text-sm">
                      Có! Bạn có thể tùy chỉnh màu sắc, hoa văn và vị trí sau khi tạo thiết kế.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
