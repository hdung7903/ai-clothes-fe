import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg border p-8">
          <div className="text-center mb-8">
            <div className="h-8 w-48 bg-muted rounded mb-2 animate-pulse mx-auto" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse mx-auto" />
          </div>
          <LoadingSpinner size="lg" text="Đang tải xác thực..." />
        </div>
      </div>
    </div>
  )
}

