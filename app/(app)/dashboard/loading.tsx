import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded bg-gray-100" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded bg-gray-100" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
