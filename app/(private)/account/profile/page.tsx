"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Lock, Save, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { updateUserInfo } from "@/services/userServices"
import { changePassword } from "@/services/authServices"
import type { UpdateUserInfoRequest } from "@/services/userServices"
import type { ChangePasswordRequest } from "@/types/auth"

export default function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
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

  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setProfileMessage(null)
    
    // Basic validation
    if (!profileData.fullName.trim()) {
      setProfileMessage({ type: 'error', text: 'Vui lòng nhập họ và tên.' })
      setIsLoading(false)
      return
    }
    
    try {
      const updateData: UpdateUserInfoRequest = {
        fullName: profileData.fullName.trim(),
        phone: profileData.phone.trim() || undefined,
        bio: profileData.bio.trim() || undefined
      }
      
      const response = await updateUserInfo(updateData)
      
      if (response.success) {
        setProfileMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
        // TODO: Update user data in Redux store
      } else {
        const errorMessage = response.errors ? Object.values(response.errors).flat().join(', ') : 'Có lỗi xảy ra khi cập nhật thông tin.'
        setProfileMessage({ type: 'error', text: errorMessage })
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setProfileMessage({ type: 'error', text: error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPasswordLoading(true)
    setPasswordMessage(null)
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' })
      setIsPasswordLoading(false)
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' })
      setIsPasswordLoading(false)
      return
    }
    
    try {
      const changePasswordData: ChangePasswordRequest = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }
      
      const response = await changePassword(changePasswordData)
      
      if (response.success) {
        setPasswordMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' })
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        const errorMessage = response.errors ? Object.values(response.errors).flat().join(', ') : 'Có lỗi xảy ra khi đổi mật khẩu.'
        setPasswordMessage({ type: 'error', text: errorMessage })
      }
    } catch (error) {
      console.error('Password change error:', error)
      setPasswordMessage({ type: 'error', text: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đổi mật khẩu.' })
    } finally {
      setIsPasswordLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/account" className="text-primary hover:underline mb-4 inline-block flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại tài khoản
            </Link>
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Thông Tin Tài Khoản</h1>
              <p className="text-muted-foreground text-base sm:text-lg">Cập nhật hồ sơ và cài đặt tài khoản của bạn</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-6 w-6 text-blue-600" />
                  Thông Tin Hồ Sơ
                </CardTitle>
                <CardDescription className="text-base">Cập nhật thông tin cá nhân của bạn</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium">Họ và Tên *</Label>
                    <Input 
                      id="fullName" 
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Nhập họ và tên đầy đủ"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Nhập email của bạn"
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">Số Điện Thoại</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Nhập số điện thoại"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium">Giới Thiệu</Label>
                    <Textarea 
                      id="bio" 
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Giới thiệu về bản thân..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  
                  {profileMessage && (
                    <Alert className={profileMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <div className="flex items-center gap-2">
                        {profileMessage.type === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription className={profileMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                          {profileMessage.text}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                  
                  <Button type="submit" disabled={isLoading} className="flex items-center gap-2 w-full sm:w-auto">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lock className="h-6 w-6 text-green-600" />
                  Đổi Mật Khẩu
                </CardTitle>
                <CardDescription className="text-base">Cập nhật mật khẩu tài khoản của bạn</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm font-medium">Mật Khẩu Hiện Tại *</Label>
                    <div className="relative mt-1">
                      <Input 
                        id="currentPassword" 
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Nhập mật khẩu hiện tại"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent z-10"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-medium">Mật Khẩu Mới *</Label>
                    <div className="relative mt-1">
                      <Input 
                        id="newPassword" 
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Nhập mật khẩu mới"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent z-10"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Xác Nhận Mật Khẩu Mới *</Label>
                    <div className="relative mt-1">
                      <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Nhập lại mật khẩu mới"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent z-10"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {passwordMessage && (
                    <Alert className={passwordMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <div className="flex items-center gap-2">
                        {passwordMessage.type === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription className={passwordMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                          {passwordMessage.text}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                  
                  <Button type="submit" disabled={isPasswordLoading} className="flex items-center gap-2 w-full sm:w-auto">
                    {isPasswordLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {isPasswordLoading ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}
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
