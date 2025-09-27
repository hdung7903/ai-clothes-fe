"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button'
import React from 'react'
import { ArrowRight, UserIcon, Shirt } from "lucide-react";
import Link from 'next/link';

const dashData = [
    {
        name: "Products",
        description: "Manage all store products easily. Add, edit, or remove products and keep information up to date.",
        icon: Shirt,
        arrowIcon: ArrowRight,
        webName: "@Fashion AI",
        link: "/admin/products",
    },
    {
        name: "Users",
        description: "Manage all registered users",
        icon: UserIcon,
        arrowIcon: ArrowRight,
        webName: "@Fashion AI",
        link: "/admin/users",
    }
    // ... các mục khác giữ nguyên
]

// Mảng màu cố định cho từng card
const cardColors = [
    "hsla(349, 70%, 75%, 0.1)",
    "hsla(116, 70%, 75%, 0.1)",
    "hsla(349, 70%, 75%, 0.1)",
    "hsla(116, 70%, 75%, 0.1)",
    "hsla(349, 70%, 75%, 0.1)",
    "hsla(116, 70%, 75%, 0.1)",
    "hsla(349, 70%, 75%, 0.1)",
    "hsla(116, 70%, 75%, 0.1)",
    // thêm màu cho các mục khác nếu cần
];

const AdminDashboard = () => {
    return (
        <div className="ml-10 flex flex-wrap gap-x-6 gap-y-6">
            {dashData.map(({ name, description, icon: Icon, arrowIcon: ArrowIcon, webName, link }, index) => (
                <Tooltip key={link}>
                    <TooltipTrigger asChild>
                        <Link href={link}>
                            <Card
                                className="flex flex-col justify-between w-[280px] h-[200px] shadow-md rounded-2xl text-center p-4 transition hover:shadow-lg hover:scale-[1.02] hover:border-black hover:border cursor-pointer"
                                style={{ backgroundColor: cardColors[index] }}
                            >
                                {/* Header */}
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <Icon className="w-6 h-6 text-gray-600" />
                                        <ArrowIcon className="w-6 h-6 text-gray-400" />
                                    </div>
                                </CardHeader>

                                {/* Title + Description */}
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-lg font-semibold truncate">{name}</CardTitle>
                                    <CardDescription className="text-base line-clamp-2">{description}</CardDescription>
                                </CardHeader>

                                {/* Footer */}
                                <CardFooter className="justify-center mt-auto">
                                    <CardDescription className="text-xs text-muted-foreground truncate">
                                        {webName}
                                    </CardDescription>
                                </CardFooter>
                            </Card>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{description}</p>
                    </TooltipContent>
                </Tooltip>
            ))}
        </div>
    );
};

export default AdminDashboard;
