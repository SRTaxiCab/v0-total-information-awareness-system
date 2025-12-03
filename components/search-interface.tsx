"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { SearchResults } from "@/components/search-results"
import { SavedQueries } from "@/components/saved-queries"
import { AdvancedFilters } from "@/components/advanced-filters"
import type { Project, Document } from "@/lib/types/database"

interface SearchInterfaceProps {
  userId: string
  projects: Project[]
}

export function SearchInterface({ userId, projects }: SearchInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [contentTypes, setContentTypes] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [results, setResults] = useState<Document[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchMode, setSearchMode] = useState<"search" | "saved">("search")

  const supabase = createClient()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const { data, error } = await supabase.rpc("search_documents", {
        search_query: searchQuery,
        user_uuid: userId,
        project_uuid: selectedProject === "all" ? null : selectedProject,
        content_types: contentTypes.length > 0 ? contentTypes : null,
        tags_filter: tags.length > 0 ? tags : null,
        limit_count: 50,
      })

      if (error) throw error
      setResults(data || [])
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents, events, entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-12 text-base"
            />
          </div>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48 h-12">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="h-12">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={handleSearch} disabled={isSearching} className="h-12 px-6">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {showFilters && (
          <AdvancedFilters
            contentTypes={contentTypes}
            setContentTypes={setContentTypes}
            tags={tags}
            setTags={setTags}
          />
        )}

        {(contentTypes.length > 0 || tags.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {contentTypes.map((type) => (
              <Badge key={type} variant="secondary">
                {type}
              </Badge>
            ))}
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setContentTypes([])
                setTags([])
              }}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as any)}>
        <TabsList>
          <TabsTrigger value="search">Search Results</TabsTrigger>
          <TabsTrigger value="saved">Saved Queries</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6">
          <SearchResults results={results} isLoading={isSearching} />
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <SavedQueries userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
