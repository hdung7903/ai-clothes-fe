"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Lock, Save, Eye, EyeOff } from "lucide-react"
import { useAppSelector } from "@/redux/hooks"

export default function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth)
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    bio: ""
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [profileMessage, setProfileMessage] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setProfileMessage("")
    
    try {
      // TODO: Implement profile update API call
      console.log("Update profile:", profileData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProfileMessage("Cập nhật thông tin thành công!")
    } catch (error) {
      setProfileMessage("Có lỗi xảy ra khi cập nhật thông tin.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setPasswordMessage("")
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("Mật khẩu mới và xác nhận mật khẩu không khớp.")
      setIsLoading(false)
      return
    }
    
    try {
      // TODO: Implement password update API call
      console.log("Update password:", passwordData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPasswordMessage("Đổi mật khẩu thành công!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      setPasswordMessage("Có lỗi xảy ra khi đổi mật khẩu.")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/account" className="text-primary hover:underline mb-4 inline-block">
              ← Quay lại tài khoản
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Thông Tin Tài Khoản</h1>
            <p className="text-muted-foreground">Cập nhật hồ sơ và cài đặt tài khoản của bạn</p>
          </div>

          <div className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông Tin Hồ Sơ
                </CardTitle>
                <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Họ và Tên</Label>
                    <Input 
                      id="fullName" 
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Nhập email của bạn"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Số Điện Thoại</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Giới Thiệu</Label>
                    <Textarea 
                      id="bio" 
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Giới thiệu về bản thân..."
                      rows={3}
                    />
                  </div>
                  
                  {profileMessage && (
                    <div className={`text-sm ${profileMessage.includes('thành công') ? 'text-green-600' : 'text-destructive'}`}>
                      {profileMessage}
                    </div>
                  )}
                  
                  <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Đổi Mật Khẩu
                </CardTitle>
                <CardDescription>Cập nhật mật khẩu tài khoản của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Mật Khẩu Hiện Tại</Label>
                    <div className="relative">
                      <Input 
                        id="currentPassword" 
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword">Mật Khẩu Mới</Label>
                    <div className="relative">
                      <Input 
                        id="newPassword" 
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Nhập mật khẩu mới"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Xác Nhận Mật Khẩu Mới</Label>
                    <div className="relative">
                      <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {passwordMessage && (
                    <div className={`text-sm ${passwordMessage.includes('thành công') ? 'text-green-600' : 'text-destructive'}`}>
                      {passwordMessage}
                    </div>
                  )}
                  
                  <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {isLoading ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
