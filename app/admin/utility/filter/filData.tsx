// src/utils/filterAndSortData.ts
import Normalize from "../sort/Normalize"

export function filterAndSortData<T extends Record<string, any>>(
    data: T[],
    filters: { search: string; category: string },
    sort: { selectedSort: string },
    typeFilter: string,
    typeSearch: string
): T[] {
    const filtered = data.filter((p) => {
        const matchesSearch =
            filters.search === "" ||
            (p[typeSearch] && p[typeSearch].toLowerCase().includes(filters.search.toLowerCase()))

        const matchesCategory =
            filters.category === "all" || p[typeFilter] === filters.category

        return matchesSearch && matchesCategory
    })

    if (!sort.selectedSort) return filtered

    // Parse field + direction
    const [field, dir] = sort.selectedSort.split("-")
    const isAsc = dir === "asc"

    return [...filtered].sort((a, b) => {
        const va = Normalize(a[field])
        const vb = Normalize(b[field])

        if (va > vb) return isAsc ? 1 : -1
        if (va < vb) return isAsc ? -1 : 1
        return 0
    })
}

