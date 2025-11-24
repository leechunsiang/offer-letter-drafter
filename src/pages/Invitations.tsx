import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Check, X, Mail, Shield, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { teamsService, TeamInvitation } from '@/lib/teams'
import { useToast } from '@/contexts/ToastContext'

export default function Invitations() {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    try {
      const data = await teamsService.getPendingInvitations()
      setInvitations(data)
    } catch (error) {
      console.error('Error loading invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (id: string) => {
    setProcessingId(id)
    try {
      await teamsService.acceptInvitation(id)
      showToast("You have successfully joined the team.", "success")
      await loadInvitations()
      // Ideally we should reload the app or context to refresh teams list, 
      // but for now just updating the list is fine.
      window.location.reload() // Reload to update sidebar teams list
    } catch (error) {
      console.error('Error accepting invitation:', error)
      showToast("Failed to accept invitation. Please try again.", "error")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to decline this invitation?')) return

    setProcessingId(id)
    try {
      await teamsService.rejectInvitation(id)
      showToast("You have declined the invitation.", "info")
      await loadInvitations()
    } catch (error) {
      console.error('Error rejecting invitation:', error)
      showToast("Failed to decline invitation. Please try again.", "error")
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invitations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Invitations</h1>
        <p className="text-muted-foreground">Manage your team invitations</p>
      </div>

      {invitations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No pending invitations</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              You don't have any pending invitations at the moment. When someone invites you to a team, it will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Join {invitation.team_name || 'Team'}
                      <Badge variant="outline" className="ml-2 capitalize font-normal">
                        {invitation.role}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Invited by {invitation.inviter_id} • {format(new Date(invitation.created_at), 'PPP')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {invitation.role === 'admin' ? (
                      <Shield className="h-5 w-5 text-blue-500" />
                    ) : (
                      <User className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(invitation.id)}
                    disabled={!!processingId}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleAccept(invitation.id)}
                    disabled={!!processingId}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept Invitation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
