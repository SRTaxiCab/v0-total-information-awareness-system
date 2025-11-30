"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface AdvancedFiltersProps {
  contentTypes: string[]
  setContentTypes: (types: string[]) => void
  tags: string[]
  setTags: (tags: string[]) => void
}

const CONTENT_TYPES = [
  { value: "text", label: "Text" },
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "url", label: "URL" },
  { value: "email", label: "Email" },
  { value: "article", label: "Article" },
]

export function AdvancedFilters({ contentTypes, setContentTypes, tags, setTags }: AdvancedFiltersProps) {
  const handleContentTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setContentTypes([...contentTypes, type])
    } else {
      setContentTypes(contentTypes.filter((t) => t !== type))
    }
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const tag = e.currentTarget.value.trim()
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag])
        e.currentTarget.value = ""
      }
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Content Type</h4>
            <div className="grid grid-cols-4 gap-4">
              {CONTENT_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={contentTypes.includes(type.value)}
                    onCheckedChange={(checked) => handleContentTypeChange(type.value, checked as boolean)}
                  />
                  <Label htmlFor={type.value} className="cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Tags</h4>
            <Input placeholder="Type a tag and press Enter" onKeyPress={handleAddTag} className="mb-3" />
            <div className="flex items-center gap-2 flex-wrap">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  #{tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                </Badge>
              ))}
              {tags.length === 0 && <span className="text-sm text-muted-foreground">No tags selected</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
