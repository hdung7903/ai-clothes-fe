"use client"
import * as React from "react"
import { TemplateEditForm } from "@/components/admin/template-edit-form"

interface TemplateFormProps {
  templateId?: string;
  mode: 'create' | 'edit';
  productId?: string;
}

export function TemplateForm({ templateId, mode, productId }: TemplateFormProps) {
  return (
    <TemplateEditForm 
      templateId={templateId} 
      mode={mode} 
      productId={productId} 
    />
  )
}