"use client"
import Link from "next/link"
import * as React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import * as CategoryService from "@/services/cartegoryServices"
import { useRouter } from "next/navigation"
import { Tree, TreeItem } from "@/components/ui/tree"

export default function Page() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [parentId, setParentId] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [categories, setCategories] = React.useState<{ id: string; name: string; parentCategoryId: string | null | undefined; subCategories?: any[] }[]>([])

  React.useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const res = await CategoryService.getAll()
        if (!ignore) setCategories(res.data || [])
      } catch {}
    })()
    return () => {
      ignore = true
    }
  }, [])

  const treeData = React.useMemo(() => {
    // Use nested subCategories from API for tree
    const roots = categories.filter((c) => c.parentCategoryId == null)
    return roots
  }, [categories])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Name is required")
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await CategoryService.createOrUpdate({
        id: null,
        name: name.trim(),
        parentCategoryId: parentId.trim() ? parentId.trim() : null,
      })
      if (res.success) {
        router.push("/admin/categories")
      } else {
        setError(Object.values(res.errors || {}).flat().join(", ") || "Failed to create category")
      }
    } catch {
      setError("Network error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/categories">Categories</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>New</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Create Category</h1>
            <Button variant="outline" asChild>
              <Link href="/admin/categories">Cancel</Link>
            </Button>
          </div>
          <form className="rounded-xl border bg-background p-4 grid gap-4 max-w-xl" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parentId">Parent Category ID</Label>
              <div className="rounded border">
                <div className="p-2 text-xs text-muted-foreground">Select a parent (optional)</div>
                <div className="max-h-64 overflow-auto p-1">
                  <Tree
                    onSelect={(item) => {
                      setParentId(item.id)
                    }}
                  >
                    {treeData.map(function render(node) {
                      return (
                        <TreeItem key={node.id} id={node.id} label={node.name}>
                          {node.subCategories && node.subCategories.length > 0 && node.subCategories.map((child: any) => (
                            <TreeItem key={child.id} id={child.id} label={child.name}>
                              {child.subCategories && child.subCategories.length > 0 && child.subCategories.map((gchild: any) => (
                                <TreeItem key={gchild.id} id={gchild.id} label={gchild.name} />
                              ))}
                            </TreeItem>
                          ))}
                        </TreeItem>
                      )
                    })}
                  </Tree>
                </div>
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm">Selected: {parentId || 'None'}</span>
                  <Button type="button" variant="outline" size="sm" onClick={() => setParentId("")}>Clear</Button>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create"}</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/categories">Back</Link>
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


