import { useState } from 'react'
import { format } from 'date-fns'
import { Trash2, Clock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TeamInvitation } from '@/lib/teams'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface InvitationListProps {
  invitations: TeamInvitation[]
  onRevoke: (invitationId: string) => Promise<void>
}

export function InvitationList({ invitations, onRevoke }: InvitationListProps) {
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) return
    
    setRevokingId(id)
    try {
      await onRevoke(id)
    } finally {
      setRevokingId(null)
    }
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/10">
        <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No pending invitations</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell className="font-medium">{invitation.invitee_email}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {invitation.role}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(invitation.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-yellow-600 text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Pending</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(invitation.id)}
                  disabled={revokingId === invitation.id}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Revoke
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
