import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/store/useStore"
import { Users, FileCheck, Clock, Plus, FileText, ArrowRight, CheckCircle } from "lucide-react"
import { AddCandidateDialog } from "@/components/candidates/AddCandidateDialog"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  const candidates = useStore((state) => state.candidates)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  const totalCandidates = candidates.length
  const generated = candidates.filter((c) => c.status === 'Generated').length
  const pending = candidates.filter((c) => c.status === 'Pending').length

  // Get recent candidates (last 5)
  const recentCandidates = candidates.slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your offer letter generation pipeline.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/templates">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Manage Templates
            </Button>
          </Link>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        </div>
      </div>

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Candidates</CardTitle>
              <CardDescription>
                You have {totalCandidates} total candidates.
              </CardDescription>
            </div>
            <Link to="/candidates">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentCandidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No candidates yet. Add one to get started!
                </div>
              ) : (
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Name</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Role</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Status</th>
                        <th className="h-10 px-2 text-right font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCandidates.map((candidate) => (
                        <tr key={candidate.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="p-2 font-medium">{candidate.name}</td>
                          <td className="p-2">{candidate.role}</td>
                          <td className="p-2">
                            <div className={cn(
                              "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                              candidate.status === "Generated" 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            )}>
                              {candidate.status === "Generated" ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <Clock className="mr-1 h-3 w-3" />
                              )}
                              {candidate.status}
                            </div>
                          </td>
                          <td className="p-2 text-right text-muted-foreground">{candidate.offerDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddCandidateDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  )
}
