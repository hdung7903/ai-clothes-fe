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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-yellow-50/40 py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-yellow-500/5"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-green-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-6 bg-gradient-to-r from-green-600 to-yellow-500 text-white border-none px-6 py-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 mr-2" />
            Khởi Tạo Phong Cách Riêng
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-700 via-green-600 to-yellow-600 bg-clip-text text-transparent leading-tight">
            Mỗi chiếc áo kể một câu chuyện
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            TEECRAFT là startup chuyên về trang phục tùy chỉnh bằng AI, cung cấp nền tảng để khách hàng cá nhân hóa áo thun và sản phẩm thời trang ngay trên website. Kết hợp công nghệ AI với trải nghiệm thương mại điện tử hiện đại, chúng tôi giúp bạn thể hiện phong cách một cách dễ dàng, thú vị và khác biệt.
          </p>
          
          {/* Hero Image */}
          <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="relative w-full aspect-[3/2] group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-yellow-400/20 rounded-xl group-hover:scale-105 transition-transform duration-300"></div>
              <Image
                src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                alt="Thiết kế áo thun tùy chỉnh với AI"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-xl shadow-2xl"
              />
            </div>
            <div className="relative w-full aspect-[3/2] group">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-green-500/20 rounded-xl group-hover:scale-105 transition-transform duration-300"></div>
              <Image
                src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                alt="Cá nhân hóa thời trang hiện đại"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-2 border-green-100 shadow-xl bg-gradient-to-br from-white to-green-50/30">
            <CardContent className="pt-8">
              <p className="text-lg text-gray-800 leading-relaxed">
                Ra đời trong thời đại cá nhân hóa và chuyển đổi số, TEECRAFT thấu hiểu nhu cầu thể hiện bản sắc qua trang phục. Nền tảng của chúng tôi cho phép bạn tải ảnh, chọn kiểu dáng, tinh chỉnh chi tiết và tạo nên thiết kế độc nhất chỉ trong vài thao tác. Bên cạnh đó, kho thiết kế có sẵn do đội ngũ sáng tạo xây dựng giúp bạn lựa chọn nhanh chóng khi cần sự tiện lợi.
                <br /><br />
                Không chỉ là sản phẩm, chúng tôi mang đến trải nghiệm truyền cảm hứng. Mỗi chiếc áo được đầu tư tỉ mỉ từ chất liệu vải, phom dáng đến công nghệ in, đảm bảo bền bỉ, thoải mái và sắc nét. TEECRAFT kết nối AI với thời trang hiện đại, biến trang phục thành lời tuyên ngôn cá tính của bạn.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mission, Vision, Objectives Sections */}
      <section className="py-20 bg-gradient-to-br from-green-50/50 via-white to-yellow-50/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission */}
            <Card className="border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200">
                    <Lightbulb className="h-4 w-4 mr-1" /> Sứ Mệnh
                  </Badge>
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-900">Sứ Mệnh Của Chúng Tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Đổi mới trải nghiệm thời trang bằng AI và công cụ thiết kế trực quan, giúp mọi người dễ dàng sáng tạo sản phẩm mang dấu ấn riêng, với tiêu chuẩn chất lượng cao từ vật liệu tới quy trình sản xuất.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="border-2 border-yellow-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border border-yellow-200">
                    <Users className="h-4 w-4 mr-1" /> Tầm Nhìn
                  </Badge>
                  <Target className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-yellow-900">Tầm Nhìn Của Chúng Tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Trở thành nền tảng tiên phong về thiết kế trang phục cá nhân hóa bằng AI tại Việt Nam, mở rộng ra khu vực, xây dựng cộng đồng sáng tạo nơi khách hàng là nhà thiết kế thực thụ.
                </p>
              </CardContent>
            </Card>

            {/* Objectives */}
            <Card className="border-2 border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200">
                    <MapPin className="h-4 w-4 mr-1" /> Mục Tiêu
                  </Badge>
                  <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-amber-900">Mục Tiêu Của Chúng Tôi</CardTitle>
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

      {/* Contact Section - Phiên bản nhẹ nhàng */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative subtle accents */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-green-100 rounded-full blur-2xl opacity-30"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-yellow-100 rounded-full blur-2xl opacity-30"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-6 bg-gradient-to-r from-green-600 to-yellow-500 text-white border-none px-6 py-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 mr-2" />
            Kết Nối Với Chúng Tôi
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sẵn sàng kể câu chuyện của bạn?
          </h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-lg">
            Tham gia cộng đồng TEECRAFT và bắt đầu cá nhân hóa ngay hôm nay.
          </p>
          
          {/* Buttons */}
          <div className="flex justify-center mb-12">
            <a href="https://www.facebook.com/profile.php?id=61581261208179" target="_blank" rel="noopener noreferrer">
              <Button className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-yellow-500 text-white hover:from-green-700 hover:to-yellow-600 shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg font-semibold">
                <Facebook className="h-5 w-5" />
                <span>Theo Dõi Facebook</span>
              </Button>
            </a>
          </div>

          {/* Contact Details */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left mb-16">
            {/* Phone */}
            <div className="flex items-center space-x-4 p-6 bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all border border-green-100">
              <div className="p-3 bg-green-100 rounded-full">
                <Phone className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Số Điện Thoại</p>
                <a href="tel:+84332210528" className="text-lg font-semibold text-green-700 hover:text-green-800">
                  0332 210 528
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-4 p-6 bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all border border-yellow-100">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Mail className="h-6 w-6 text-yellow-700" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600">Email</p>
                <a href="mailto:teecraft942025@gmail.com" className="text-base font-semibold text-yellow-700 hover:text-yellow-800 break-all">
                  teecraft942025@gmail.com
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all border border-amber-100">
              <div className="p-3 bg-amber-100 rounded-full mt-1">
                <MapPin className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Địa Chỉ</p>
                <p className="text-base font-semibold text-amber-700">
                  Đê La Thành, Đống Đa, Hà Nội, Việt Nam
                </p>
              </div>
            </div>
          </div>

          {/* Footer Image - smaller and more subtle */}
          <div className="mt-12 relative w-full max-w-4xl mx-auto aspect-[21/9] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/about_3.png"
              alt="Workspace sáng tạo TEECRAFT"
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
          </div>
        </div>
      </section>
    </div>
  )
}
