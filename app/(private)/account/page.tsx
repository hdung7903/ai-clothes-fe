import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, History, Palette } from "lucide-react"

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Tài Khoản Của Tôi</h1>
            <p className="text-muted-foreground">Quản lý tài khoản và tùy chọn thiết kế của bạn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/account/orders">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Lịch Sử Đơn Hàng
                  </CardTitle>
                  <CardDescription>Xem các đơn hàng trước đây và theo dõi đơn hàng hiện tại</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/account/designs">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Thiết Kế Đã Lưu
                  </CardTitle>
                  <CardDescription>Truy cập các thiết kế đã lưu và bản nháp của bạn</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/account/profile">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Thông Tin Tài Khoản
                  </CardTitle>
                  <CardDescription>Cập nhật hồ sơ và thay đổi mật khẩu</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
