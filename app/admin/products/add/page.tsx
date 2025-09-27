"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function AddProductPage() {
    const [form, setForm] = useState({
        id: "PROD-001",
        name: "Custom T-Shirt Design",
        price: "29.99",
        category: "T-Shirts",
        rating: 4.8,
        image: "/custom-t-shirt-design.jpg",
        isNew: true,
    });

    const handleChange = (field: string, value: string | number | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Product Submitted:", form);
        alert("✅ Product added! Check console for data.");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <Card className="w-full max-w-xl shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Add Product</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Product ID */}
                        <div className="grid gap-2">
                            <Label htmlFor="id">Product ID</Label>
                            <Input
                                id="id"
                                value={form.id}
                                onChange={(e) => handleChange("id", e.target.value)}
                                required
                            />
                        </div>

                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                required
                            />
                        </div>

                        {/* Price */}
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price (USD)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={form.price}
                                onChange={(e) => handleChange("price", e.target.value)}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                value={form.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                                required
                            />
                        </div>

                        {/* Rating */}
                        <div className="grid gap-2">
                            <Label htmlFor="rating">Rating</Label>
                            <Input
                                id="rating"
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={form.rating}
                                onChange={(e) => handleChange("rating", Number(e.target.value))}
                            />
                        </div>

                        {/* Image */}
                        <div className="grid gap-2">
                            <Label htmlFor="image">Image URL</Label>
                            <Input
                                id="image"
                                value={form.image}
                                onChange={(e) => handleChange("image", e.target.value)}
                            />
                        </div>

                        {/* Is New */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isNew"
                                checked={form.isNew}
                                onCheckedChange={(checked) => handleChange("isNew", !!checked)}
                            />
                            <Label htmlFor="isNew">Mark as New</Label>
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full">
                            Add Product
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
