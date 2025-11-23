import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { teamsService } from '@/lib/teams'
import { useTeam } from '@/contexts/TeamContext'
import { useToast } from '@/contexts/ToastContext'
import { Users, Plus, LogIn } from 'lucide-react'

export default function TeamOnboarding() {
  const navigate = useNavigate()
  const { refreshTeams } = useTeam()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [teamName, setTeamName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) {
      showToast('Please enter a team name', 'error')
      return
    }

    setLoading(true)
    try {
      await teamsService.create(teamName.trim())
      showToast('Team created successfully!', 'success')
      await refreshTeams()
      navigate('/')
    } catch (error) {
      console.error('Error creating team:', error)
      showToast('Failed to create team', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) {
      showToast('Please enter an invite code', 'error')
      return
    }

    setLoading(true)
    try {
      await teamsService.joinTeamByCode(inviteCode.trim().toUpperCase())
      showToast('Successfully joined team!', 'success')
      await refreshTeams()
      navigate('/')
    } catch (error) {
      console.error('Error joining team:', error)
      showToast('Invalid invite code or failed to join team', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Teams!</CardTitle>
          <CardDescription>
            Create a new team or join an existing one to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'create'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Team
            </button>
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'join'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Join Team
            </button>
          </div>

          {/* Create Team Form */}
          {mode === 'create' && (
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="e.g., My Company"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !teamName.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Team'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                You'll be the owner of this team and can invite others later
              </p>
            </form>
          )}

          {/* Join Team Form */}
          {mode === 'join' && (
            <form onSubmit={handleJoinTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  placeholder="e.g., ABC12345"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  disabled={loading}
                  maxLength={8}
                  className="uppercase tracking-widest text-center text-lg font-mono"
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !inviteCode.trim()}>
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? 'Joining...' : 'Join Team'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Ask your team admin for an invite code to join their team
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

