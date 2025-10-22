import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldX, Home, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Không có quyền truy cập
            </CardTitle>
            <CardDescription className="text-gray-600">
              Bạn không có quyền truy cập vào trang này. Chỉ có quản trị viên mới có thể truy cập khu vực quản trị.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-500">
              <p>Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với quản trị viên hệ thống.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" className="flex items-center gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Về trang chủ
                </Link>
              </Button>
              <Button asChild className="flex items-center gap-2">
                <Link href="javascript:history.back()">
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}