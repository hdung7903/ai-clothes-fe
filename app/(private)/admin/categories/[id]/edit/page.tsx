"use client"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
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
import * as React from "react"
import * as CategoryService from "@/services/cartegoryServices"
import type { Category } from "@/types/category"
import { Tree, TreeItem } from "@/components/ui/tree"

type PageProps = { params: Promise<{ id: string }> }

export default function Page({ params }: PageProps) {
  const { id } = React.use(params)
  if (!id) notFound()
  const router = useRouter()

  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [name, setName] = React.useState("")
  const [parentId, setParentId] = React.useState<string | null>(null)
  const [categories, setCategories] = React.useState<Category[]>([])
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [detail, all] = await Promise.all([
          CategoryService.getById(id),
          CategoryService.getAll(),
        ])
        if (ignore) return
        if (!detail.success || !detail.data) {
          setError("Failed to load category")
        } else {
          setName(detail.data.name)
          setParentId(detail.data.parentCategoryId ?? null)
        }
        setCategories(all.data || [])
      } catch {
        if (!ignore) setError("Network error")
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [id])

  const roots = React.useMemo(() => (categories || []).filter((c) => c.parentCategoryId == null), [categories])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Name is required")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await CategoryService.createOrUpdate({
        id,
        name: name.trim(),
        parentCategoryId: parentId,
      })
      if (res.success) {
        router.push(`/admin/categories/${id}`)
      } else {
        setError(Object.values(res.errors || {}).flat().join(", ") || "Failed to save")
      }
    } catch {
      setError("Network error")
    } finally {
      setSaving(false)
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
                  <BreadcrumbPage>Edit {id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Edit Category</h1>
            <Button variant="outline" asChild>
              <Link href={`/admin/categories/${id}`}>Cancel</Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground max-w-xl">Loading...</div>
          ) : (
            <form className="rounded-xl border bg-background p-4 grid gap-4 max-w-xl" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Parent Category</Label>
                <div className="rounded border">
                  <div className="p-2 text-xs text-muted-foreground">Select a parent (optional)</div>
                  <div className="max-h-64 overflow-auto p-1">
                    <Tree onSelect={(item) => {
                      if (item.id === id) return
                      setParentId(item.id)
                    }}>
                      {roots.map(function render(node) {
                        return (
                          <TreeItem key={node.id} id={node.id} label={node.name}>
                            {node.subCategories && node.subCategories.length > 0 && node.subCategories.map((child) => (
                              <TreeItem key={child.id} id={child.id} label={child.name}>
                                {child.subCategories && child.subCategories.length > 0 && child.subCategories.map((gchild) => (
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
                    <Button type="button" variant="outline" size="sm" onClick={() => setParentId(null)}>Clear</Button>
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/admin/categories/${id}`}>Back</Link>
                </Button>
              </div>
            </form>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


