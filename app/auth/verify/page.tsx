"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { verifyEmailAction, requestEmailVerificationAction, clearError } from "@/redux/authSlice"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((s) => s.auth)
  const presetEmail = searchParams.get("email") ?? ""

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Prefer email from localStorage, fallback to query param
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('pendingVerificationEmail') : null
      if (saved) setEmail(saved)
      else setEmail(presetEmail)
    } catch {
      setEmail(presetEmail)
    }
  }, [presetEmail])

  const onVerify = async () => {
    if (!email || code.length !== 6) return
    const result = await dispatch(verifyEmailAction({ email, verificationCode: code }))
    if (verifyEmailAction.fulfilled.match(result)) {
      setSuccess(true)
      setTimeout(() => router.push("/auth/login"), 1500)
    }
  }

  const onResend = async () => {
    if (!email) return
    await dispatch(requestEmailVerificationAction({ email }))
  }

  return (
    <div className="min-h-[calc(100dvh-8rem)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>Email verified! Redirecting to login…</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">We sent a code to</p>
              <p className="text-sm font-medium break-all">{email || '—'}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Verification code</label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full" onClick={onVerify} disabled={isLoading || !email || code.length !== 6}>
              Verify Email
            </Button>
            <Button variant="ghost" className="w-full" onClick={onResend} disabled={isLoading || !email}>
              Resend Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

