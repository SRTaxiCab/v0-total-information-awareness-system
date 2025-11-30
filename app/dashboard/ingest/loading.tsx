import { Skeleton } from "@/components/ui/skeleton"

export default function IngestLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
