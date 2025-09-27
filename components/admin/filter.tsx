"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

type FilterProps = {
  categories: string[]
  /** callback khi filters thay đổi */
  onChange?: (filters: { search: string; category: string }) => void
  filterBy: string
  searchBy: string
}

export default function Filter({ categories, onChange, filterBy, searchBy }: FilterProps) {
  const [filters, setFilters] = useState({ search: "", category: "all" })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value }
    setFilters(newFilters)
    onChange?.(newFilters)
  }

  const handleCategoryChange = (value: string) => {
    const newFilters = { ...filters, category: value }
    setFilters(newFilters)
    onChange?.(newFilters)
  }

  return (
    <div className="flex items-center gap-4 py-4">
      <Input
        placeholder={searchBy}
        value={filters.search}
        onChange={handleSearchChange}
        className="max-w-xs  shadow-black"
      />

      <Select value={filters.category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[180px] shadow-black">
          <SelectValue placeholder={filterBy} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
