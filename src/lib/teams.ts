import { supabase } from './supabase'

export interface Team {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user_email?: string
}

export const teamsService = {
  async getMyTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Team[]
  },

  async create(name: string): Promise<Team> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('teams')
      .insert({
        name,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Add owner as team member
    await supabase.from('team_members').insert({
      team_id: data.id,
      user_id: user.id,
      role: 'owner',
    })

    return data as Team
  },

  async update(id: string, name: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update({ name, updated_at: new Date().toISOString() })
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
      .select('*')
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true })

    if (error) throw error
    
    // Map to TeamMember format (user_email will show user_id for now)
    return (data || []).map(member => ({
      id: member.id,
      team_id: member.team_id,
      user_id: member.user_id,
      role: member.role,
      joined_at: member.joined_at,
      user_email: member.user_id // Show user_id instead of email for now
    }))
  },

  async addMember(teamId: string, email: string, role: 'admin' | 'member' = 'member'): Promise<void> {
    // For now, we'll need the user to provide the user_id directly
    // In a real app, you'd use a server-side function to look up by email
    throw new Error('Adding members by email is not yet supported. Please use user ID.')
  },

  async removeMember(teamId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async getMyRole(teamId: string): Promise<'owner' | 'admin' | 'member' | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single()

    if (error) return null
    return data.role as 'owner' | 'admin' | 'member'
  }
}
