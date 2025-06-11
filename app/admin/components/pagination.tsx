"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from "lucide-react"

interface AdminPaginationProps {
  currentPage: number
  totalCount: number
  itemsPerPage: number
  basePath: string
}

export function AdminPagination({ currentPage, totalCount, itemsPerPage, basePath }: AdminPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`${basePath}?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center space-x-2 space-x-reverse mt-6 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        aria-label="الصفحة الأولى"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="الصفحة السابقة"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <span className="text-sm text-gray-700">
        صفحة {currentPage} من {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="الصفحة التالية"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="الصفحة الأخيرة"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
    </div>
  )
}
