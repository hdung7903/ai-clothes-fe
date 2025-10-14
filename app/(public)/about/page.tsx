import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Lightbulb, Users, Target, Sparkles, MapPin, Mail, Phone, Facebook } from "lucide-react"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Về Chúng Tôi - TEECRAFT",
  description: "TEECRAFT là startup sáng tạo chuyên về trang phục tùy chỉnh bằng AI, mang đến nền tảng độc đáo để khách hàng cá nhân hóa áo thun và sản phẩm thời trang trực tiếp trên website.",
  keywords: "TEECRAFT, thời trang tùy chỉnh, AI, áo thun cá nhân hóa, thiết kế thời trang, startup Việt Nam",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Mỗi chiếc áo kể một câu chuyện
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            TEECRAFT là startup chuyên về trang phục tùy chỉnh bằng AI, cung cấp nền tảng để khách hàng cá nhân hóa áo thun và sản phẩm thời trang ngay trên website. Kết hợp công nghệ AI với trải nghiệm thương mại điện tử hiện đại, chúng tôi giúp bạn thể hiện phong cách một cách dễ dàng, thú vị và khác biệt.
          </p>
          {/* Hero Image */}
          <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="relative w-full aspect-[3/2]">
              <Image
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
                alt="Áo thun tùy chỉnh bằng AI"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-xl shadow-xl"
              />
            </div>
            <div className="relative w-full aspect-[3/2]">
              <Image
                src="https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
                alt="Thiết kế thời trang cá nhân hóa"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Ra đời trong thời đại cá nhân hóa và chuyển đổi số, TEECRAFT thấu hiểu nhu cầu thể hiện bản sắc qua trang phục. Nền tảng của chúng tôi cho phép bạn tải ảnh, chọn kiểu dáng, tinh chỉnh chi tiết và tạo nên thiết kế độc nhất chỉ trong vài thao tác. Bên cạnh đó, kho thiết kế có sẵn do đội ngũ sáng tạo xây dựng giúp bạn lựa chọn nhanh chóng khi cần sự tiện lợi.
                <br /><br />
                Không chỉ là sản phẩm, chúng tôi mang đến trải nghiệm truyền cảm hứng. Mỗi chiếc áo được đầu tư tỉ mỉ từ chất liệu vải, phom dáng đến công nghệ in, đảm bảo bền bỉ, thoải mái và sắc nét. TEECRAFT kết nối AI với thời trang hiện đại, biến trang phục thành lời tuyên ngôn cá tính của bạn.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mission, Vision, Objectives Sections - Rút gọn */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Lightbulb className="h-4 w-4 mr-1" /> Sứ Mệnh
                  </Badge>
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Sứ Mệnh Của Chúng Tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Đổi mới trải nghiệm thời trang bằng AI và công cụ thiết kế trực quan, giúp mọi người dễ dàng sáng tạo sản phẩm mang dấu ấn riêng, với tiêu chuẩn chất lượng cao từ vật liệu tới quy trình sản xuất.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Users className="h-4 w-4 mr-1" /> Tầm Nhìn
                  </Badge>
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Tầm Nhìn Của Chúng Tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Trở thành nền tảng tiên phong về thiết kế trang phục cá nhân hóa bằng AI tại Việt Nam, mở rộng ra khu vực, xây dựng cộng đồng sáng tạo nơi khách hàng là nhà thiết kế thực thụ.
                </p>
              </CardContent>
            </Card>

            {/* Objectives */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <MapPin className="h-4 w-4 mr-1" /> Mục Tiêu
                  </Badge>
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Mục Tiêu Của Chúng Tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  - Ngắn hạn (2025–2026): Hoàn thiện nền tảng AI, mở rộng thư viện thiết kế, tăng nhận diện thương hiệu.
                  <br />- Trung hạn (2027–2029): Xây dựng cộng đồng sáng tạo, mở rộng đối tác thời trang & logistics, thử nghiệm thị trường quốc tế.
                  <br />- Dài hạn (2030–2035): Dẫn đầu khu vực về thời trang cá nhân hóa bằng AI, đa dạng hóa dòng sản phẩm bền vững.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Sẵn sàng kể câu chuyện của bạn?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Tham gia cộng đồng TEECRAFT và bắt đầu cá nhân hóa ngay hôm nay.</p>
          
          {/* Buttons */}
          <div className="flex justify-center mb-12">
            <a href="https://www.facebook.com/profile.php?id=61581261208179" target="_blank" rel="noopener noreferrer">
              <Button className="flex items-center space-x-2 bg-black text-white hover:bg-gray-800">
                <Facebook className="h-4 w-4" />
                <span>Theo Dõi Facebook</span>
              </Button>
            </a>
          </div>

          {/* Contact Details - Phone, Email, Address */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left mb-16">
            {/* Phone */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Phone className="h-6 w-6 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Số Điện Thoại</p>
                <a href="tel:+84332210528" className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                  0332 210 528
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Mail className="h-6 w-6 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <a href="mailto:teecraft942025@gmail.com" className="text-lg font-semibold text-gray-900 hover:text-blue-600 whitespace-nowrap">
                  teecraft942025@gmail.com
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <MapPin className="h-6 w-6 text-gray-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Địa Chỉ</p>
                <p className="text-lg font-semibold text-gray-900">
                  Đê La Thành, Đống Đa, Hà Nội, Việt Nam
                </p>
              </div>
            </div>
          </div>

          {/* Footer Image*/}
          <div className="mt-16 relative w-full max-w-5xl mx-auto aspect-[16/6]">
            <Image
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
              alt="Cộng đồng thời trang"
              fill
              sizes="(max-width: 1024px) 100vw, 1000px"
              className="object-cover rounded-xl shadow-xl"
            />
          </div>
        </div>
      </section>
    </div>
  )
}