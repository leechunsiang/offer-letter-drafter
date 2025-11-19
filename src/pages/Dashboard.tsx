import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/store/useStore"
import { Users, FileCheck, Clock } from "lucide-react"

export default function Dashboard() {
  const candidates = useStore((state) => state.candidates)
  
  const totalCandidates = candidates.length
  const generated = candidates.filter((c) => c.status === 'Generated').length
  const pending = candidates.filter((c) => c.status === 'Pending').length

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidates}</div>
            <p className="text-xs text-muted-foreground">
              Active candidates in pipeline
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Generated Offers
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generated}</div>
            <p className="text-xs text-muted-foreground">
              Offers created and ready
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Action
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending}</div>
            <p className="text-xs text-muted-foreground">
              Candidates awaiting offer generation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
