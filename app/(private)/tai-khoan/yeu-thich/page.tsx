import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Palette } from "lucide-react"

export default function YeuThichPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/tai-khoan" className="text-primary hover:underline mb-4 inline-block">
              ← Quay lại tài khoản
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Thiết Kế Yêu Thích</h1>
            <p className="text-muted-foreground">Các thiết kế bạn đã thích và đánh dấu</p>
          </div>

          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có thiết kế yêu thích</h3>
            <p className="text-muted-foreground mb-4">
              Bạn chưa thích thiết kế nào. Hãy khám phá và thích những thiết kế bạn yêu thích!
            </p>
            <Link href="/products">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                Khám Phá Sản Phẩm
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
