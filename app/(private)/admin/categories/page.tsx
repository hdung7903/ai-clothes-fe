"use client"
import Link from "next/link"
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import * as React from "react"
import * as CategoryService from "@/services/cartegoryServices"
import type { Category } from "@/types/category"
import { Tree, TreeItem } from "@/components/ui/tree"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"

export default function Page() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [pageSize, setPageSize] = React.useState(10)
  const [page, setPage] = React.useState(1)
  const [items, setItems] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      setIsLoading(true)
      try {
        const res = await CategoryService.getAll()
        if (!ignore) {
          setItems(res.data || [])
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    run()
    return () => {
      ignore = true
    }
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((c) => c.name.toLowerCase().includes(q))
  }, [items, query])

  const treeData = React.useMemo<Category[]>(() => {
    // API already returns nested subCategories; just filter by query and keep structure
    const filterTree = (nodes: Category[]): Category[] => {
      return nodes
        .map((n) => ({ ...n, subCategories: filterTree(n.subCategories || []) }))
        .filter((n) => {
          if (!query.trim()) return true
          const match = n.name.toLowerCase().includes(query.trim().toLowerCase())
          const hasChildMatch = (n.subCategories || []).length > 0
          return match || hasChildMatch
        })
    }
    // Only keep roots (parentCategoryId null) to display
    const roots = filtered.filter((c) => c.parentCategoryId == null)
    return filterTree(roots)
  }, [filtered, query])

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await CategoryService.deleteById(id)
      setItems((prev) => prev.filter((c) => c.id !== id))
    } finally {
      setDeletingId(null)
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Categories</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-semibold">Category Management</h1>
              <Button asChild>
                <Link href="/admin/categories/new">Add Category</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <Input
                placeholder="Search categories by name"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                className="md:max-w-sm"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-background p-2">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading...</div>
            ) : treeData.length === 0 ? (
              <div className="p-4 text-sm">No categories found.</div>
            ) : (
              <Tree className="py-1">
                {treeData.map(function render(node) {
                  return (
                    <TreeItem
                      key={node.id}
                      id={node.id}
                      label={
                        <div className="flex items-center gap-2 w-full">
                          <span className="truncate">{node.name}</span>
                          <button
                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/categories/${node.id}`)
                            }}
                            aria-label="View details"
                            type="button"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      }
                    >
                      {node.subCategories && node.subCategories.length > 0 && node.subCategories.map((child) => (
                        <TreeItem
                          key={child.id}
                          id={child.id}
                          label={
                            <div className="flex items-center gap-2 w-full">
                              <span className="truncate">{child.name}</span>
                              <button
                                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/admin/categories/${child.id}`)
                                }}
                                aria-label="View details"
                                type="button"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          }
                        >
                          {child.subCategories && child.subCategories.length > 0 && child.subCategories.map((gchild) => (
                            <TreeItem
                              key={gchild.id}
                              id={gchild.id}
                              label={
                                <div className="flex items-center gap-2 w-full">
                                  <span className="truncate">{gchild.name}</span>
                                  <button
                                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/admin/categories/${gchild.id}`)
                                    }}
                                    aria-label="View details"
                                    type="button"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                </div>
                              }
                            />
                          ))}
                        </TreeItem>
                      ))}
                    </TreeItem>
                  )
                })}
              </Tree>
            )}
            {/* Actions row for selected item */}
            {/* For simplicity, keep actions as links below the tree when a node is selected in future enhancement */}
          </div>
          {/* Pagination removed for tree view */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


