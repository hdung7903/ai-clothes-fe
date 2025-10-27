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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { getUsers, getUsersPaginated, banUser, changeUserRole, getProfile, type GetUsersParams } from "@/services/userServices"
import type { UserProfile } from "@/types/user"
import { toast } from "sonner"

type Row = {
  id: string
  fullName: string
  email: string
  role: string
  isBanned: boolean
}

export default function Page() {
  const [query, setQuery] = React.useState("")
  const [pageSize, setPageSize] = React.useState(5)
  const [page, setPage] = React.useState(1)
  const [rows, setRows] = React.useState<Row[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string>("")
  const [roleFilter, setRoleFilter] = React.useState<string>("all")
  const [isBannedFilter, setIsBannedFilter] = React.useState<string>("all")
  const [selectedUser, setSelectedUser] = React.useState<Row | null>(null)
  const [showUserDialog, setShowUserDialog] = React.useState(false)
  const [currentUserId, setCurrentUserId] = React.useState<string>("")
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalCount, setTotalCount] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError("")
      try {
        // Check permissions first
        const hasPermission = await checkAdminPermissions()
        if (!hasPermission) {
          setError("Bạn không có quyền truy cập tài nguyên này. Vui lòng liên hệ quản trị viên.")
          return
        }

        const params: GetUsersParams = {
          pageNumber: page,
          pageSize: pageSize,
          keyword: query || undefined,
          fieldName: query ? "name" : undefined,
          role: roleFilter !== "all" ? (roleFilter as 'User' | 'Administrator' | 'Moderator') : undefined,
          isBanned: isBannedFilter === "true" ? true : isBannedFilter === "false" ? false : undefined,
        }
        
        // Use new paginated function
        const paginatedResponse = await getUsersPaginated(params)
        
        if (!cancelled && paginatedResponse) {
          const userRows: Row[] = paginatedResponse.items.map((user) => {
            return {
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              role: user.role,
              isBanned: user.isBanned,
            }
          })
          setRows(userRows)
          setTotalPages(paginatedResponse.totalPages)
          setTotalCount(paginatedResponse.totalCount)
        }
      } catch (e) {
        if (!cancelled) {
          const errorMessage = e instanceof Error ? e.message : "Không thể tải danh sách người dùng"
          setError(errorMessage)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [page, pageSize, query, roleFilter, isBannedFilter])

  // Get current user ID and check permissions
  React.useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const profile = await getProfile();
        if (profile.data?.id) {
          setCurrentUserId(profile.data.id);
        }
      } catch (error) {
        console.error('Error getting current user ID:', error);
        // Fallback: try to get from localStorage or use a placeholder
        try {
          const tokens = localStorage.getItem('auth.tokens');
          if (tokens) {
            const parsed = JSON.parse(tokens);
            // You might need to get user ID from token or another API call
            // For now, we'll use a placeholder
            setCurrentUserId("current-user-id");
          }
        } catch (localError) {
          console.error('Error parsing tokens:', localError);
        }
      }
    };
    
    getCurrentUserId();
  }, []);

  // Check if user has admin permissions
  const checkAdminPermissions = async () => {
    try {
      // Try to get user profile to check permissions
      const profile = await getProfile();
      if (profile.data?.roles?.includes('Administrator')) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  };

  const handleViewUser = (user: Row) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await banUser(userId, isBanned);
      
      // Show success toast
      toast.success(
        isBanned ? "Đã cấm người dùng thành công" : "Đã gỡ cấm người dùng thành công",
        {
          description: isBanned 
            ? "Người dùng đã bị cấm và không thể đăng nhập" 
            : "Người dùng đã được gỡ cấm và có thể đăng nhập bình thường"
        }
      );
      
      // Refresh the user list
      const params: GetUsersParams = {
        pageNumber: page,
        pageSize: pageSize,
        keyword: query || undefined,
        fieldName: query ? "name" : undefined,
        role: roleFilter !== "all" ? (roleFilter as 'User' | 'Administrator' | 'Moderator') : undefined,
        isBanned: isBannedFilter === "true" ? true : isBannedFilter === "false" ? false : undefined,
      };
      const paginatedResponse = await getUsersPaginated(params);
      const userRows: Row[] = paginatedResponse.items.map((user) => {
        return {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isBanned: user.isBanned,
        }
      });
      setRows(userRows);
      setTotalPages(paginatedResponse.totalPages);
      setTotalCount(paginatedResponse.totalCount);
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error("Không thể cập nhật trạng thái người dùng", {
        description: "Vui lòng thử lại sau"
      });
      setError("Không thể cập nhật trạng thái người dùng");
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'User' | 'Administrator') => {
    try {
      await changeUserRole(userId, newRole);
      
      // Show success toast
      toast.success("Đã thay đổi vai trò thành công", {
        description: `Vai trò đã được cập nhật thành ${newRole === 'Administrator' ? 'Quản trị viên' : 'Người dùng'}`
      });
      
      // Refresh the user list
      const params: GetUsersParams = {
        pageNumber: page,
        pageSize: pageSize,
        keyword: query || undefined,
        fieldName: query ? "name" : undefined,
        role: roleFilter !== "all" ? (roleFilter as 'User' | 'Administrator' | 'Moderator') : undefined,
        isBanned: isBannedFilter === "true" ? true : isBannedFilter === "false" ? false : undefined,
      };
      const paginatedResponse = await getUsersPaginated(params);
      const userRows: Row[] = paginatedResponse.items.map((user) => {
        return {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isBanned: user.isBanned,
        }
      });
      setRows(userRows);
      setTotalPages(paginatedResponse.totalPages);
      setTotalCount(paginatedResponse.totalCount);
    } catch (error) {
      console.error('Error changing user role:', error);
      toast.error("Không thể thay đổi vai trò người dùng", {
        description: "Vui lòng thử lại sau"
      });
      setError("Không thể thay đổi vai trò người dùng");
    }
  };

  // Using server-side pagination from API
  const currentPage = page
  const pageItems = rows

  return (
    <>
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
                  <BreadcrumbPage>Users</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                <p className="text-muted-foreground">Quản lý và theo dõi tất cả người dùng trong hệ thống</p>
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1 max-w-sm">
                    <Input
                      placeholder="Tìm kiếm người dùng..."
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value)
                        setPage(1)
                      }}
                      className="pl-10"
                    />
                    <svg
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select
                      value={roleFilter}
                      onValueChange={(v) => {
                        setRoleFilter(v)
                        setPage(1)
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                        <SelectItem value="Administrator">Quản trị viên</SelectItem>
                        <SelectItem value="User">Người dùng</SelectItem>
                        <SelectItem value="Moderator">Điều hành viên</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={isBannedFilter}
                      onValueChange={(v) => {
                        setIsBannedFilter(v)
                        setPage(1)
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="false">Hoạt động</SelectItem>
                        <SelectItem value="true">Bị cấm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Hiển thị:</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      setPageSize(Number(v))
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">dòng</span>
                </div>
              </div>
            </div>
          </div>
          {/* Table Section */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Danh sách người dùng</h2>
                <div className="text-sm text-muted-foreground">
                  Trang {currentPage} của {totalPages} ({totalCount} người dùng)
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="font-semibold">Người dùng</TableHead>
                      <TableHead className="font-semibold">Vai trò</TableHead>
                      <TableHead className="font-semibold">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="text-sm text-muted-foreground">Đang tải dữ liệu...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {error && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                              <svg className="h-8 w-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <h3 className="text-lg font-semibold text-destructive mb-2">Không thể tải dữ liệu</h3>
                              <p className="text-sm text-muted-foreground max-w-md">{error}</p>
                              {error.includes('quyền') && (
                                <div className="mt-4 p-3 bg-muted rounded-lg">
                                  <p className="text-xs text-muted-foreground">
                                    💡 <strong>Gợi ý:</strong> Bạn cần có quyền quản trị viên để truy cập trang này. 
                                    Vui lòng liên hệ quản trị viên hệ thống để được cấp quyền.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading && !error && pageItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <div className="text-muted-foreground">👥</div>
                            <span className="text-sm text-muted-foreground">Không tìm thấy người dùng nào</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading && !error && pageItems.map((u) => (
                      <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              u.id === currentUserId 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-primary/10 text-primary'
                            }`}>
                              <span className="text-sm font-medium">
                                {u.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{u.fullName}</span>
                                {u.id === currentUserId && (
                                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                    Bạn
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.role === 'Administrator' 
                              ? 'bg-purple-100 text-purple-800' 
                              : u.role === 'Moderator'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role === 'Administrator' ? 'Quản trị viên' : 
                             u.role === 'Moderator' ? 'Điều hành viên' : 'Người dùng'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.isBanned 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {u.isBanned ? 'Bị cấm' : 'Hoạt động'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewUser(u)}
                              className="h-8"
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Xem
                            </Button>
                            {u.id !== currentUserId && currentUserId && (
                              <Select onValueChange={(value) => handleChangeRole(u.id, value as 'User' | 'Administrator')}>
                                <SelectTrigger className="w-[140px] h-8">
                                  <SelectValue placeholder="Đổi vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="User">Người dùng</SelectItem>
                                  <SelectItem value="Administrator">Quản trị viên</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            {u.id !== currentUserId && currentUserId && (
                              <Button 
                                variant={u.isBanned ? "default" : "destructive"} 
                                size="sm"
                                onClick={() => handleBanUser(u.id, !u.isBanned)}
                                className="h-8"
                              >
                                {u.isBanned ? (
                                  <>
                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Bỏ cấm
                                  </>
                                ) : (
                                  <>
                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                    </svg>
                                    Cấm
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground">
                Trang {currentPage} của {totalPages} ({totalCount} người dùng)
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setPage(currentPage - 1)
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {/* Show page numbers with smart range */}
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1
                    const isNearCurrent = Math.abs(pageNum - currentPage) <= 1
                    const isFirst = pageNum === 1
                    const isLast = pageNum === totalPages
                    
                    if (isNearCurrent || isFirst || isLast) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === pageNum}
                            onClick={(e) => {
                              e.preventDefault()
                              setPage(pageNum)
                            }}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }
                    
                    if (isNearCurrent || i === 0 || i === totalPages - 1) return null
                    if (pageNum === Math.floor(totalPages / 2)) {
                      return (
                        <PaginationItem key="ellipsis">
                          <span className="px-2">...</span>
                        </PaginationItem>
                      )
                    }
                    
                    return null
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setPage(currentPage + 1)
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </SidebarInset>
      
      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Thông tin người dùng</DialogTitle>
            <DialogDescription>
              Xem chi tiết thông tin của người dùng
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedUser.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Vai trò</label>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedUser.role === 'Administrator' 
                          ? 'bg-purple-100 text-purple-800' 
                          : selectedUser.role === 'Moderator'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedUser.role === 'Administrator' ? 'Quản trị viên' : 
                         selectedUser.role === 'Moderator' ? 'Điều hành viên' : 'Người dùng'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedUser.isBanned 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedUser.isBanned ? 'Bị cấm' : 'Hoạt động'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Đóng
            </Button>
            {selectedUser && selectedUser.id !== currentUserId && (
              <Button asChild>
                <Link href={`/admin/users/${selectedUser.id}/edit`}>
                  Chỉnh sửa
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


