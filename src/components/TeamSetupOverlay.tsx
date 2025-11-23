import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Plus, LogIn } from 'lucide-react'
import { teamsService } from '@/lib/teams'
import { useTeam } from '@/contexts/TeamContext'

export default function TeamSetupOverlay() {
  const { refreshTeams } = useTeam()
  const [isCreating, setIsCreating] = useState(true)
  const [teamName, setTeamName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert('Please enter a team name')
      return
    }

    setLoading(true)
    try {
      await teamsService.create(teamName)
      alert('Team created successfully!')
      await refreshTeams()
    } catch (error) {
      console.error('Create team error:', error)
      alert((error as Error).message || 'Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      alert('Please enter an invite code')
      return
    }

    setLoading(true)
    try {
      await teamsService.joinTeamByCode(inviteCode.toUpperCase())
      alert('Joined team successfully!')
      await refreshTeams()
    } catch (error) {
      console.error('Join team error:', error)
      alert((error as Error).message || 'Failed to join team')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-center mb-6">
          <Users className="h-12 w-12 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">Welcome to Teams!</h2>
        <p className="text-center text-muted-foreground mb-6">
          Create a new team or join an existing one to get started
        </p>

        <div className="flex gap-2 mb-6">
          <Button
            variant={isCreating ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
          <Button
            variant={!isCreating ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setIsCreating(false)}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Join Team
          </Button>
        </div>

        {isCreating ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                placeholder="e.g. My Company"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleCreateTeam}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You'll be the owner of this team and can invite others later
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="e.g. ABC12345"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinTeam()}
                className="font-mono uppercase"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleJoinTeam}
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Team'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Ask your team admin for an invite code
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
