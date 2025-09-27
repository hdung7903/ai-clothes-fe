"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

type Option<T> = {
    label: string;
    icon?: React.ReactNode;
    onClick?: (data: T) => void;
};

type DropdownMenuGenericProps<T> = {
    data: T;
    label?: string;
    options: Option<T>[];
};

export function BinhDropdownMenuGeneric<T>({ data, label = "Settings", options }: DropdownMenuGenericProps<T>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <MoreVertical className="w-5 h-5 ml-5 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-50" align="start" side="left">
                {label && <DropdownMenuLabel className="text-center">{label}</DropdownMenuLabel>}
                <DropdownMenuGroup>
                    {options.map((opt, idx) => (
                        <DropdownMenuItem key={idx} onClick={() => opt.onClick?.(data)}>
                            <div className="flex justify-between w-full items-center">
                                <p>{opt.label}</p>
                                {opt.icon}
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
