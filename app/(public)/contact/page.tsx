import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Clock, Send, Sparkles, MessageCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Liên Hệ - TEECRAFT",
  description: "Liên hệ với TEECRAFT để được hỗ trợ về thiết kế áo thun cá nhân hóa, công nghệ AI và các dịch vụ thời trang tùy chỉnh.",
  keywords: "TEECRAFT, liên hệ, hỗ trợ khách hàng, thiết kế áo thun, AI, thời trang tùy chỉnh",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-green-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-green-600 to-yellow-500 text-white border-none px-6 py-2 text-sm font-medium">
              <MessageCircle className="h-4 w-4 mr-2" />
              Hỗ Trợ Khách Hàng 24/7
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-700 via-green-600 to-yellow-600 bg-clip-text text-transparent leading-tight font-[family-name:var(--font-playfair)] tracking-wide antialiased">
              Liên Hệ Với TEECRAFT
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Chúng tôi rất muốn nghe từ bạn. Gửi tin nhắn cho chúng tôi và chúng tôi sẽ phản hồi sớm nhất có thể.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="border-2 border-green-100 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-yellow-100 rounded-full">
                    <Send className="h-6 w-6 text-green-700" />
                  </div>
                  <CardTitle className="text-2xl font-[family-name:var(--font-playfair)] tracking-wide">Gửi Tin Nhắn Cho Chúng Tôi</CardTitle>
                </div>
                <CardDescription className="text-base">Điền vào biểu mẫu bên dưới và chúng tôi sẽ liên hệ lại với bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-base font-medium">Tên</Label>
                    <Input id="firstName" className="mt-2 h-11" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-base font-medium">Họ</Label>
                    <Input id="lastName" className="mt-2 h-11" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-base font-medium">Email</Label>
                  <Input id="email" type="email" className="mt-2 h-11" />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-base font-medium">Chủ Đề</Label>
                  <Select>
                    <SelectTrigger className="mt-2 h-11">
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
                  <Label htmlFor="message" className="text-base font-medium">Tin Nhắn</Label>
                  <Textarea id="message" placeholder="Hãy cho chúng tôi biết cách chúng tôi có thể giúp bạn..." rows={6} className="mt-2" />
                </div>
                <Button className="w-full h-12 bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all">
                  <Send className="h-5 w-5 mr-2" />
                  Gửi Tin Nhắn
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="border-2 border-yellow-100 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-gradient-to-br from-yellow-100 to-green-100 rounded-full">
                      <Sparkles className="h-6 w-6 text-yellow-700" />
                    </div>
                    <CardTitle className="text-2xl font-[family-name:var(--font-playfair)] tracking-wide">Thông Tin Liên Hệ</CardTitle>
                  </div>
                  <CardDescription className="text-base">Đây là những cách khác để liên hệ với chúng tôi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-green-100 rounded-full shrink-0">
                      <Mail className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Email</p>
                      <a href="mailto:Teecraft942025@gmail.com" className="text-green-700 hover:text-green-800 font-medium break-all">
                        Teecraft942025@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-yellow-50 to-white rounded-xl border border-yellow-100 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-yellow-100 rounded-full shrink-0">
                      <Phone className="h-5 w-5 text-yellow-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Điện Thoại</p>
                      <a href="tel:0332210528" className="text-yellow-700 hover:text-yellow-800 font-medium">
                        0332 210 528
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-amber-100 rounded-full shrink-0">
                      <MapPin className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Địa Chỉ</p>
                      <p className="text-amber-700 font-medium">
                        Đê La Thành, Đống Đa
                        <br />
                        Hà Nội, Việt Nam
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-green-100 rounded-full shrink-0">
                      <Clock className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Giờ Làm Việc</p>
                      <p className="text-green-700 font-medium">
                        Thứ 2 - Thứ 6: 9:00 - 18:00
                        <br />
                        Thứ 7 - Chủ Nhật: 10:00 - 16:00
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-100 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full">
                      <MessageCircle className="h-6 w-6 text-amber-700" />
                    </div>
                    <CardTitle className="text-2xl font-[family-name:var(--font-playfair)] tracking-wide">Câu Hỏi Thường Gặp</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100">
                    <p className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                      <span className="text-green-600 font-bold">Q:</span>
                      <span>Thiết kế được tạo ra trong bao lâu?</span>
                    </p>
                    <p className="text-gray-700 ml-6">
                      Hầu hết các thiết kế được tạo ra trong vòng 30-60 giây bằng công nghệ AI của TEECRAFT.
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-white rounded-xl border border-yellow-100">
                    <p className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">Q:</span>
                      <span>Bạn hỗ trợ những định dạng ảnh nào?</span>
                    </p>
                    <p className="text-gray-700 ml-6">
                      Chúng tôi hỗ trợ các định dạng JPG, PNG, GIF và WebP với kích thước tối đa 10MB.
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100">
                    <p className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                      <span className="text-amber-600 font-bold">Q:</span>
                      <span>Tôi có thể chỉnh sửa thiết kế đã tạo không?</span>
                    </p>
                    <p className="text-gray-700 ml-6">
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
