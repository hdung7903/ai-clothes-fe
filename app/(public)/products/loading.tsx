import { ProductGridSkeleton } from "@/components/ui/loading/product-skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 w-64 bg-muted rounded mb-2 animate-pulse" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse" />
      </div>
      <ProductGridSkeleton />
    </div>
  )
}
