import { supabase } from './supabase'
import type { Candidate, Template, CompanySettings } from '@/store/useStore'

export interface DbCandidate {
  id: string
  name: string
  email: string
  role: string
  status: 'Pending' | 'Generated' | 'Submitted' | 'Approved' | 'Rejected'
  offer_date: string
  custom_content?: string
  feedback?: string
  created_at: string
  updated_at: string
}

export interface DbTemplate {
  id: string
  name: string
  content: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface DbCompanySettings {
  id: string
  company_name: string
  company_address: string
  company_website: string
  company_phone: string
  logo_url: string
  primary_color: string
  sender_name: string
  sender_email: string
  created_at: string
  updated_at: string
}

const mapDbCandidateToCandidate = (dbCandidate: DbCandidate): Candidate => ({
  id: dbCandidate.id,
  name: dbCandidate.name,
  email: dbCandidate.email,
  role: dbCandidate.role,
  status: dbCandidate.status,
  offerDate: dbCandidate.offer_date,
  customContent: dbCandidate.custom_content,
  feedback: dbCandidate.feedback,
})

const mapDbTemplateToTemplate = (dbTemplate: DbTemplate): Template => ({
  id: dbTemplate.id,
  name: dbTemplate.name,
  content: dbTemplate.content,
  isDefault: dbTemplate.is_default,
})

const mapDbSettingsToSettings = (dbSettings: DbCompanySettings): CompanySettings => ({
  info: {
    name: dbSettings.company_name,
    address: dbSettings.company_address,
    website: dbSettings.company_website,
    phone: dbSettings.company_phone,
  },
  branding: {
    logoUrl: dbSettings.logo_url,
    primaryColor: dbSettings.primary_color,
  },
  emailConfig: {
    senderName: dbSettings.sender_name,
    senderEmail: dbSettings.sender_email,
  },
})

export const candidatesService = {
  async getAll(teamId?: string): Promise<Candidate[]> {
    let query = supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })

    if (teamId) {
      query = query.eq('team_id', teamId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data as DbCandidate[]).map(mapDbCandidateToCandidate)
  },

  async create(candidate: Omit<Candidate, 'id' | 'status'>, teamId?: string): Promise<Candidate> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error('User not authenticated')
    const user = session.user

    if (!teamId) throw new Error('Team ID is required')

    const { data, error } = await supabase
      .from('candidates')
      .insert({
        name: candidate.name,
        email: candidate.email,
        role: candidate.role,
        offer_date: candidate.offerDate,
        status: 'Pending',
        user_id: user.id,
        team_id: teamId,
      })
      .select()
      .single()

    if (error) throw error
    return mapDbCandidateToCandidate(data as DbCandidate)
  },

  async updateStatus(id: string, status: Candidate['status'], feedback?: string): Promise<Candidate> {
    const updates: any = { status }
    if (feedback !== undefined) {
      updates.feedback = feedback
    }

    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapDbCandidateToCandidate(data as DbCandidate)
  },

  async updateContent(id: string, content: string): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .update({ custom_content: content })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapDbCandidateToCandidate(data as DbCandidate)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  subscribe(callback: () => void, teamId?: string) {
    const filter = teamId ? `team_id=eq.${teamId}` : undefined
    const channel = supabase
      .channel('candidates-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidates', filter },
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}

export const templatesService = {
  async getAll(teamId?: string): Promise<Template[]> {
    let query = supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (teamId) {
      query = query.eq('team_id', teamId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data as DbTemplate[]).map(mapDbTemplateToTemplate)
  },

  async create(template: Omit<Template, 'id'>, teamId?: string): Promise<Template> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error('User not authenticated')
    const user = session.user

    if (!teamId) throw new Error('Team ID is required')

    // If this is set as default, unset other defaults first for this team
    if (template.isDefault) {
      await supabase
        .from('templates')
        .update({ is_default: false })
        .eq('team_id', teamId)
        .neq('id', '00000000-0000-0000-0000-000000000000') // Safety check
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        name: template.name,
        content: template.content,
        is_default: template.isDefault,
        user_id: user.id,
        team_id: teamId,
      })
      .select()
      .single()

    if (error) throw error
    return mapDbTemplateToTemplate(data as DbTemplate)
  },

  async update(id: string, updates: Partial<Template>, teamId?: string): Promise<Template> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error('User not authenticated')

    // If setting as default, unset all others first for this team
    if (updates.isDefault === true && teamId) {
      await supabase
        .from('templates')
        .update({ is_default: false })
        .eq('team_id', teamId)
        .neq('id', id)
    }

    const dbUpdates: Partial<DbTemplate> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.content !== undefined) dbUpdates.content = updates.content
    if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault

    const { data, error } = await supabase
      .from('templates')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapDbTemplateToTemplate(data as DbTemplate)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  subscribe(callback: () => void, teamId?: string) {
    const filter = teamId ? `team_id=eq.${teamId}` : undefined
    const channel = supabase
      .channel('templates-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'templates', filter },
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}

export const companySettingsService = {
  async get(teamId?: string): Promise<CompanySettings | null> {
    console.log('companySettingsService.get called', { teamId });
    
    if (!teamId) {
      console.log('No team ID provided, returning null');
      return null;
    }

    const query = supabase
      .from('company_settings')
      .select('*')
      .eq('team_id', teamId)

    const { data, error } = await query.limit(1).maybeSingle()

    if (error) {
      console.error('companySettingsService.get error:', error);
      throw error
    }
    console.log('companySettingsService.get data:', data);
    if (!data) return null
    return mapDbSettingsToSettings(data as DbCompanySettings)
  },

  async upsert(settings: CompanySettings, teamId?: string): Promise<CompanySettings> {
    console.log('companySettingsService.upsert called', { settings, teamId });
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error('User not authenticated')
    const user = session.user

    if (!teamId) throw new Error('Team ID is required')

// Check for EXISTING settings for THIS TEAM
    const { data: existingData } = await supabase
      .from('company_settings')
      .select('id')
      .eq('team_id', teamId)
      .limit(1)
      .maybeSingle()
    
    console.log('companySettingsService.upsert existingData:', existingData);

    const settingsData = {
      company_name: settings.info.name,
      company_address: settings.info.address,
      company_website: settings.info.website,
      company_phone: settings.info.phone,
      logo_url: settings.branding.logoUrl,
      primary_color: settings.branding.primaryColor,
      sender_name: settings.emailConfig.senderName,
      sender_email: settings.emailConfig.senderEmail,
      user_id: user.id,
      team_id: teamId,
    }

    if (existingData) {
      console.log('Updating existing settings...');
      const { data, error } = await supabase
        .from('company_settings')
        .update(settingsData)
        .eq('id', existingData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating settings:', error);
        throw error
      }
      return mapDbSettingsToSettings(data as DbCompanySettings)
    } else {
      console.log('Inserting new settings...');
      const { data, error } = await supabase
        .from('company_settings')
        .insert(settingsData)
        .select()
        .single()

      if (error) {
        console.error('Error inserting settings:', error);
        throw error
      }
      return mapDbSettingsToSettings(data as DbCompanySettings)
    }
  },

  subscribe(callback: () => void, teamId?: string) {
    const filter = teamId ? `team_id=eq.${teamId}` : undefined
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'company_settings', filter },
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}
