"use client"
import React, { useState } from "react"
import { ArrowUp, ArrowDown } from "lucide-react"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type SortType<T> = {
    sortItems: string[]
    sortData?: T[]
    asc?: boolean
    onChange?: (sort: { selectedSort: string }) => void
}

const BinhSort = ({ sortItems, asc = true, onChange }: SortType<object>) => {
    const [sort, setSort] = useState({ selectedSort: "" })

    function handleSort(value: string) {
        const newSort = { ...sort, selectedSort: value.toLowerCase() }
        setSort(newSort)
        onChange?.(newSort) // báo cho component cha
    }

    return (
        <Select onValueChange={handleSort}>
            <SelectTrigger className="w-[180px]  shadow-black">
                <SelectValue placeholder="Select to sort" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Increase</SelectLabel>
                    {sortItems.map((item) => (
                        <SelectItem key={`${item}-asc`} value={`${item}-asc`}>
                            <div className="flex items-center gap-2">
                                <ArrowUp className="h-4 w-4" />
                                {item}
                            </div>
                        </SelectItem>
                    ))}
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Decrease</SelectLabel>
                    {sortItems.map((item) => (
                        <SelectItem key={`${item}-desc`} value={`${item}-desc`}>
                            <div className="flex items-center gap-2">
                                <ArrowDown className="h-4 w-4" />
                                {item}
                            </div>
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

export default BinhSort
