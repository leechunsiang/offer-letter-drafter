import { useState, useEffect } from 'react'
import { Plus, Users, Trash2, UserPlus, Crown, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { teamsService, TeamWithRole, TeamMember } from '@/lib/teams'
import { InviteMemberDialog } from '@/components/teams/InviteMemberDialog'
import { useAuth } from '@/contexts/AuthContext'

export default function Teams() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<TeamWithRole[]>([])
  const [selectedTeam, setSelectedTeam] = useState<TeamWithRole | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  useEffect(() => {
    loadTeams()
  }, [])

  useEffect(() => {
    if (selectedTeam) {
      loadMembers(selectedTeam.id)
    }
  }, [selectedTeam])

  const loadTeams = async () => {
    try {
      const data = await teamsService.getMyTeams()
      setTeams(data)
      if (data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0])
      }
    } catch (error) {
      console.error('Error loading teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async (teamId: string) => {
    try {
      const data = await teamsService.getMembers(teamId)
      setMembers(data)
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    setCreating(true)
    try {
      const team = await teamsService.create(newTeamName)
      // Optimistically add the new team with owner role
      const newTeam: TeamWithRole = { ...team, role: 'owner' }
      setTeams([newTeam, ...teams])
      setSelectedTeam(newTeam)
      setNewTeamName('')
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Failed to create team')
    } finally {
      setCreating(false)
    }
  }

  const handleInviteMember = async (email: string, role: 'admin' | 'member') => {
    if (!selectedTeam) return
    try {
      // Map UI role 'member' to backend role 'user'
      const backendRole = role === 'member' ? 'user' : role
      await teamsService.inviteUserByEmail(selectedTeam.id, email, backendRole)
      alert('Invitation sent successfully!')
      // We don't reload members here as the user isn't a member yet, just invited
    } catch (error) {
      console.error('Error inviting member:', error)
      alert('Failed to invite member')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      await teamsService.removeMember(selectedTeam.id, userId)
      await loadMembers(selectedTeam.id)
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Failed to remove member')
    }
  }

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return
    if (!confirm(`Are you sure you want to delete "${selectedTeam.name}"? This action cannot be undone.`)) return

    try {
      await teamsService.delete(selectedTeam.id)
      const updatedTeams = teams.filter(t => t.id !== selectedTeam.id)
      setTeams(updatedTeams)
      setSelectedTeam(updatedTeams[0] || null)
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('Failed to delete team')
    }
  }

  const isOwner = selectedTeam?.owner_id === user?.id

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Manage your teams and collaborate with others</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>My Teams</CardTitle>
            <CardDescription>Teams you're a member of</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreateTeam} className="space-y-2">
              <Label htmlFor="teamName">Create New Team</Label>
              <div className="flex gap-2">
                <Input
                  id="teamName"
                  placeholder="Team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  disabled={creating}
                />
                <Button type="submit" size="icon" disabled={creating || !newTeamName.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              {teams.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No teams yet. Create one to get started!
                </p>
              ) : (
                teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTeam?.id === team.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-muted border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{team.name}</span>
                      {team.owner_id === user?.id && (
                        <Crown className="h-3 w-3 ml-auto" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Details */}
        {selectedTeam ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedTeam.name}</CardTitle>
                  <CardDescription>{members.length} member{members.length !== 1 ? 's' : ''}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {isOwner && (
                    <>
                      <Button onClick={() => setInviteDialogOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteTeam}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Team
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Team Members</h3>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          {member.role === 'owner' && <Crown className="h-4 w-4 text-yellow-500" />}
                          {member.role === 'admin' && <Shield className="h-4 w-4 text-blue-500" />}
                          <div>
                            <p className="font-medium">{member.user_email}</p>
                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                          </div>
                        </div>
                        {isOwner && member.role !== 'owner' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.user_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2">
            <CardContent className="flex items-center justify-center min-h-[400px]">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a team or create a new one to get started</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={handleInviteMember}
      />
    </div>
  )
}
