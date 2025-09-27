"use client";

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState, ChangeEvent, FormEvent } from "react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
type User = {
    name: string;
    age: number;
    email: string;
    address: string;
    gender: boolean; // true = male, false = female
    dob: Date;
    phone: string;
    avatar: string; // URL hoặc base64
};
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
const EditAccountPage: React.FC = () => {
    // Giả lập dữ liệu user ban đầu
    const [user, setUser] = useState<User>({
        name: "John Doe",
        age: 25,
        email: "john@example.com",
        address: "123 Main St",
        gender: true,
        dob: new Date("1998-01-01"),
        phone: "0123456789",
        avatar: "/professional-man-boutique-owner.jpg", // URL mặc định nếu có
    });


    function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
        throw new Error("Function not implemented.");
    }

    function handleGenderChange(event: ChangeEvent<HTMLInputElement>): void {
        throw new Error("Function not implemented.");
    }

    function handleDobChange(event: ChangeEvent<HTMLInputElement>): void {
        throw new Error("Function not implemented.");
    }

    return (
        <>
            <div className="flex flex-col">
                <Tabs defaultValue="account" className="w-[90%] ml-20">
                    <TabsList className="w-[30%] mb-5">
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    <TabsContent className="w-full" value="account">
                        <div className="flex">
                            <div className="w-1/3 min-h-120 flex flex-col mr-10">
                                <Card className="text-center h-full">
                                    <CardHeader>
                                        <CardTitle>Avatar</CardTitle>
                                        <CardDescription>@Fashion AI</CardDescription>
                                    </CardHeader>
                                    <CardContent >
                                        <div className="flex justify-center items-center mb-5">
                                            <Avatar className="w-32 h-32">
                                                <AvatarImage src={user.avatar} alt="@shadcn" />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div>
                                            {user.name}
                                        </div>
                                        <div className="text-gray-400">
                                            {user.email}
                                        </div>
                                        <Button className="mt-5">Up load</Button>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="w-2/3 flex flex-col gap-4">
                                <div className="w-full sm:w-1/2">
                                    <Label>Name</Label>
                                    <Input name="name" value={user.name} onChange={handleInputChange} className="w-full max-w-xs" />
                                </div>

                                <div className="w-full sm:w-1/4">
                                    <Label>Age</Label>
                                    <Input type="number" name="age" value={user.age} onChange={handleInputChange} className="w-full max-w-xs" />
                                </div>

                                <div className="w-full sm:w-1/2">
                                    <Label>Email</Label>
                                    <Input type="email" name="email" value={user.email} onChange={handleInputChange} className="w-full max-w-xs" />
                                </div>

                                <div className="w-full sm:w-1/2">
                                    <Label>Phone</Label>
                                    <Input name="phone" value={user.phone} onChange={handleInputChange} className="w-full max-w-xs" />
                                </div>

                                <div className="w-full sm:w-2/3">
                                    <Label>Address</Label>
                                    <Input name="address" value={user.address} onChange={handleInputChange} className="w-full max-w-xs" />
                                </div>

                                <div className="w-full sm:w-1/2">
                                    <Label>Gender</Label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-1">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="male"
                                                checked={user.gender === true}
                                                onChange={handleGenderChange}
                                            />
                                            Male
                                        </label>
                                        <label className="flex items-center gap-1">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="female"
                                                checked={user.gender === false}
                                                onChange={handleGenderChange}
                                            />
                                            Female
                                        </label>
                                    </div>
                                </div>

                                <div className="w-full sm:w-1/2">
                                    <Label>Date of Birth</Label>
                                    <Input type="date" value={user.dob.toISOString().split("T")[0]} onChange={handleDobChange} className="w-full max-w-xs" />
                                </div>

                                <Button type="submit" className="mt-4 w-full sm:w-1/3">
                                    Save Changes
                                </Button>
                            </div>

                        </div>
                    </TabsContent>
                    <TabsContent value="password">Change your password here.</TabsContent>
                </Tabs>

            </div>
        </>
    );
};

export default EditAccountPage;
