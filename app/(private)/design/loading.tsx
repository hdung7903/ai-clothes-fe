import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DesignLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" text="Loading design tool..." />
        <p className="text-sm text-muted-foreground">
          Preparing your AI fashion design workspace
        </p>
      </div>
    </div>
  )
}

