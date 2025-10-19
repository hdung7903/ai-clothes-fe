import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, Bell, Palette, Globe } from "lucide-react"

export default function TuyChonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/tai-khoan" className="text-primary hover:underline mb-4 inline-block">
              ← Quay lại tài khoản
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Tùy Chọn</h1>
            <p className="text-muted-foreground">Tùy chỉnh các tùy chọn thiết kế và thông báo của bạn</p>
          </div>

          <div className="space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Thông Báo
                </CardTitle>
                <CardDescription>Quản lý các thông báo bạn muốn nhận</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Thông báo qua email</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo về đơn hàng và cập nhật qua email
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="design-updates">Cập nhật thiết kế</Label>
                    <p className="text-sm text-muted-foreground">
                      Thông báo khi có cập nhật về thiết kế của bạn
                    </p>
                  </div>
                  <Switch id="design-updates" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="promotional">Khuyến mãi</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông tin về các chương trình khuyến mãi
                    </p>
                  </div>
                  <Switch id="promotional" />
                </div>
              </CardContent>
            </Card>

            {/* Design Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Tùy Chọn Thiết Kế
                </CardTitle>
                <CardDescription>Tùy chỉnh trải nghiệm thiết kế của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Tự động lưu</Label>
                    <p className="text-sm text-muted-foreground">
                      Tự động lưu thiết kế khi bạn đang chỉnh sửa
                    </p>
                  </div>
                  <Switch id="auto-save" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-quality">Chất lượng cao</Label>
                    <p className="text-sm text-muted-foreground">
                      Hiển thị thiết kế với chất lượng cao (có thể chậm hơn)
                    </p>
                  </div>
                  <Switch id="high-quality" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="grid-snap">Bắt lưới</Label>
                    <p className="text-sm text-muted-foreground">
                      Tự động căn chỉnh các phần tử theo lưới
                    </p>
                  </div>
                  <Switch id="grid-snap" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Language & Region */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Ngôn Ngữ & Khu Vực
                </CardTitle>
                <CardDescription>Cài đặt ngôn ngữ và khu vực</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <select 
                    id="language" 
                    className="w-full p-2 border border-input rounded-md bg-background"
                    defaultValue="vi"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                  <select 
                    id="currency" 
                    className="w-full p-2 border border-input rounded-md bg-background"
                    defaultValue="VND"
                  >
                    <option value="VND">VND (₫)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quyền Riêng Tư
                </CardTitle>
                <CardDescription>Quản lý quyền riêng tư và bảo mật</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="public-profile">Hồ sơ công khai</Label>
                    <p className="text-sm text-muted-foreground">
                      Cho phép người khác xem thiết kế của bạn
                    </p>
                  </div>
                  <Switch id="public-profile" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics">Phân tích sử dụng</Label>
                    <p className="text-sm text-muted-foreground">
                      Cho phép thu thập dữ liệu để cải thiện dịch vụ
                    </p>
                  </div>
                  <Switch id="analytics" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
