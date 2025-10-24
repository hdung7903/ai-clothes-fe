import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function DesignDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-10 w-48 mb-4" />
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-10 w-80 mb-2" />
                <Skeleton className="h-5 w-64" />
              </div>
              
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Information */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Design Templates */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-56" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i}>
                        <Skeleton className="w-full h-48 rounded-lg mb-2" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Icons */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="w-full h-20 rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              {/* Design Info */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </div>

                  <Separator />

                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-20" />
                  </div>

                  <Separator />

                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-5 w-24" />
                  </div>

                  <Separator />

                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Separator className="my-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
