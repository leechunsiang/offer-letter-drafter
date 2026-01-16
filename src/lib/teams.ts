import { supabase } from './supabase'

export interface Team {
  id: string
  name: string
  owner_id: string
  invite_code: string
  created_at: string
  updated_at: string
}

export interface TeamWithRole extends Team {
  role: 'owner' | 'admin' | 'user'
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'user'
  joined_at: string
  user_email?: string
}

export interface TeamInvitation {
  id: string
  team_id: string
  team_name?: string
  inviter_id: string
  invitee_email: string
  invitee_id: string | null
  role: 'admin' | 'user'
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  expires_at: string
}

// Helper function to generate a random invite code
function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export const teamsService = {
  async getMyTeams(): Promise<TeamWithRole[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user's team memberships
    const { data: memberships, error: memberError } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)

    if (memberError) throw memberError
    if (!memberships || memberships.length === 0) return []

    // Get team details for each membership
    const teamIds = memberships.map(m => m.team_id)
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds)
      .order('created_at', { ascending: false })

    if (teamsError) throw teamsError

    // Combine teams with roles
    return (teamsData || []).map(team => {
      const membership = memberships.find((m: any) => m.team_id === team.id)
      return {
        ...team,
        role: membership?.role || 'user'
      } as TeamWithRole
    })
  },

  async create(name: string): Promise<Team> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Generate unique invite code
    let inviteCode = generateRandomCode()
    let isUnique = false

    while (!isUnique) {
      const { data } = await supabase
        .from('teams')
        .select('id')
        .eq('invite_code', inviteCode)
        .single()

      if (!data) {
        isUnique = true
      } else {
        inviteCode = generateRandomCode()
      }
    }

    const { data, error } = await supabase
      .from('teams')
      .insert({
        name,
        owner_id: user.id,
        invite_code: inviteCode
      })
      .select()
      .single()

    if (error) throw error

    // Note: team member is added automatically via database trigger
    return data as Team
  },

  async update(id: string, name: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Team
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getMembers(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('id, team_id, user_id, role, joined_at')
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true })

    if (error) throw error

    if (!data || data.length === 0) return []

    // Fetch user emails from auth.users
    const userIds = data.map(m => m.user_id)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds)

    if (usersError) {
      console.error('Error fetching user emails:', usersError)
      // Return members without emails if query fails
      return data as TeamMember[]
    }

    // Map emails to members
    return data.map(member => ({
      ...member,
      user_email: users?.find(u => u.id === member.user_id)?.email || undefined
    })) as TeamMember[]
  },

  async removeMember(teamId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async updateMemberRole(teamId: string, userId: string, role: 'owner' | 'admin' | 'user'): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async getMyRole(teamId: string): Promise<'owner' | 'admin' | 'user' | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single()

    if (error) return null
    return data.role as 'owner' | 'admin' | 'user'
  },

  // ==================== INVITATION METHODS ====================

  async inviteUserByEmail(teamId: string, email: string, role: 'admin' | 'user'): Promise<TeamInvitation> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('team_invitations')
      .insert({
        team_id: teamId,
        inviter_id: user.id,
        invitee_email: email,
        role,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data as TeamInvitation
  },

  async joinTeamByCode(inviteCode: string): Promise<Team> {
    const { data, error } = await supabase.rpc('join_team_by_invite_code', {
      input_invite_code: inviteCode
    })

    if (error) throw error
    return data as Team
  },

  async regenerateInviteCode(teamId: string): Promise<string> {
    // Generate unique invite code
    let inviteCode = generateRandomCode()
    let isUnique = false

    while (!isUnique) {
      const { data } = await supabase
        .from('teams')
        .select('id')
        .eq('invite_code', inviteCode)
        .single()

      if (!data) {
        isUnique = true
      } else {
        inviteCode = generateRandomCode()
      }
    }

    const { error } = await supabase
      .from('teams')
      .update({ invite_code: inviteCode })
      .eq('id', teamId)

    if (error) throw error
    return inviteCode
  },

  async getPendingInvitations(): Promise<TeamInvitation[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('team_invitations')
      .select('*, teams(name)')
      .eq('status', 'pending')
      .or(`invitee_id.eq.${user.id},invitee_email.eq.${user.email}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((item: any) => ({
      ...item,
      team_name: item.teams?.name
    })) as TeamInvitation[]
  },

  async getInvitationCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { count, error } = await supabase
      .from('team_invitations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .or(`invitee_id.eq.${user.id},invitee_email.eq.${user.email}`)

    if (error) throw error
    return count || 0
  },

  async acceptInvitation(invitationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get invitation details
    const { data: invitation, error: invError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('id', invitationId)
      .single()

    if (invError || !invitation) throw new Error('Invitation not found')

    // Add user to team
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: invitation.team_id,
        user_id: user.id,
        role: invitation.role
      })

    if (memberError) throw memberError

    // Update invitation status
    await supabase
      .from('team_invitations')
      .update({ status: 'accepted', invitee_id: user.id })
      .eq('id', invitationId)
  },

  async rejectInvitation(invitationId: string): Promise<void> {
    const { error } = await supabase
      .from('team_invitations')
      .update({ status: 'rejected' })
      .eq('id', invitationId)

    if (error) throw error
  },

  async getPendingInvitationsForTeam(teamId: string): Promise<TeamInvitation[]> {
    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as TeamInvitation[]
  },
  async revokeInvitation(invitationId: string): Promise<void> {
    const { error } = await supabase
      .from('team_invitations')
      .delete()
      .eq('id', invitationId)

    if (error) throw error
  },

  async claimOwnership(teamId: string, accessKey: string): Promise<void> {
    const { data, error } = await supabase.rpc('claim_team_ownership', {
      input_team_id: teamId,
      input_access_key: accessKey
    })

    if (error) throw error
  }
}
