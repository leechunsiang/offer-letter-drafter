import { create } from 'zustand'
import { candidatesService, templatesService, companySettingsService } from '@/lib/database'
import { initializeDatabase, seedInitialData } from '@/lib/initDb'

export interface Candidate {
  id: string
  name: string
  email: string
  role: string
  status: 'Pending' | 'Generated' | 'Submitted' | 'Approved' | 'Rejected'
  offerDate: string
  customContent?: string
  feedback?: string
}

export interface Template {
  id: string
  name: string
  content: string
  isDefault: boolean
}

export interface CompanySettings {
  info: {
    name: string
    address: string
    website: string
    phone: string
  }
  branding: {
    logoUrl: string
    primaryColor: string
  }
  emailConfig: {
    senderName: string
    senderEmail: string
  }
}

interface Store {
  candidates: Candidate[]
  templates: Template[]
  companySettings: CompanySettings
  isLoading: boolean
  error: string | null
  initialized: boolean

  initialize: () => Promise<void>
  loadCandidates: (teamId?: string) => Promise<void>
  loadTemplates: (teamId?: string) => Promise<void>
  loadCompanySettings: (teamId?: string) => Promise<void>
  addCandidate: (candidate: Omit<Candidate, 'id' | 'status'>, teamId: string) => Promise<void>
  updateCandidateStatus: (id: string, status: Candidate['status'], feedback?: string) => Promise<void>
  updateCandidateContent: (id: string, content: string) => Promise<void>
  addTemplate: (template: Omit<Template, 'id'>, teamId: string) => Promise<void>
  updateTemplate: (id: string, updates: Partial<Template>, teamId?: string) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  deleteCandidate: (id: string) => Promise<void>
  updateCompanySettings: (settings: Partial<CompanySettings>, teamId: string) => Promise<void>
}

const defaultCompanySettings: CompanySettings = {
  info: {
    name: '',
    address: '',
    website: '',
    phone: '',
  },
  branding: {
    logoUrl: '',
    primaryColor: '#000000',
  },
  emailConfig: {
    senderName: '',
    senderEmail: '',
  },
}

export const useStore = create<Store>((set, get) => ({
  candidates: [],
  templates: [],
  companySettings: defaultCompanySettings,
  isLoading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return

    set({ isLoading: true, error: null })
    try {
      // Check and initialize database
      const dbInitialized = await initializeDatabase()
      if (!dbInitialized) {
        set({
          error: 'Database tables not found. Please run the SQL schema from supabase-schema.sql in your Supabase dashboard. See DATABASE_SETUP.md for instructions.',
          isLoading: false
        })
        return
      }

      // Seed initial data if needed
      await seedInitialData()

      // Load all data
      await Promise.all([
        get().loadCandidates(),
        get().loadTemplates(),
        get().loadCompanySettings(),
      ])

      // Set up real-time subscriptions
      candidatesService.subscribe(() => {
        get().loadCandidates()
      })

      templatesService.subscribe(() => {
        get().loadTemplates()
      })

      companySettingsService.subscribe(() => {
        get().loadCompanySettings()
      })

      set({ initialized: true, isLoading: false })
    } catch (error) {
      console.error('Error initializing store:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to initialize', isLoading: false })
    }
  },

  loadCandidates: async (teamId) => {
    try {
      const candidates = await candidatesService.getAll(teamId)
      set({ candidates, error: null })
    } catch (error) {
      console.error('Error loading candidates:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to load candidates' })
    }
  },

  loadTemplates: async (teamId) => {
    try {
      const templates = await templatesService.getAll(teamId)
      set({ templates, error: null })
    } catch (error) {
      console.error('Error loading templates:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to load templates' })
    }
  },

  loadCompanySettings: async (teamId) => {
    try {
      const settings = await companySettingsService.get(teamId)
      if (settings) {
        set({ companySettings: settings, error: null })
      }
    } catch (error) {
      console.error('Error loading company settings:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to load settings' })
    }
  },

  addCandidate: async (candidate, teamId) => {
    try {
      const newCandidate = await candidatesService.create(candidate, teamId)
      set((state) => ({
        candidates: [newCandidate, ...state.candidates],
        error: null,
      }))
    } catch (error) {
      console.error('Error adding candidate:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to add candidate' })
      throw error
    }
  },

  updateCandidateStatus: async (id, status, feedback) => {
    try {
      const updatedCandidate = await candidatesService.updateStatus(id, status, feedback)
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.id === id ? updatedCandidate : c
        ),
        error: null,
      }))
    } catch (error) {
      console.error('Error updating candidate status:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update candidate' })
      throw error
    }
  },

  updateCandidateContent: async (id, content) => {
    try {
      const updatedCandidate = await candidatesService.updateContent(id, content)
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.id === id ? updatedCandidate : c
        ),
        error: null,
      }))
    } catch (error) {
      console.error('Error updating candidate content:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update candidate content' })
      throw error
    }
  },

  addTemplate: async (template, teamId) => {
    try {
      const newTemplate = await templatesService.create(template, teamId)
      set((state) => ({
        templates: [newTemplate, ...state.templates],
        error: null,
      }))
    } catch (error) {
      console.error('Error adding template:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to add template' })
      throw error
    }
  },

  updateTemplate: async (id, updates, teamId) => {
    try {
      const updatedTemplate = await templatesService.update(id, updates, teamId)
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === id ? updatedTemplate : t
        ),
        error: null,
      }))
    } catch (error) {
      console.error('Error updating template:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update template' })
      throw error
    }
  },

  deleteTemplate: async (id) => {
    try {
      await templatesService.delete(id)
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
        error: null,
      }))
    } catch (error) {
      console.error('Error deleting template:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to delete template' })
      throw error
    }
  },

  deleteCandidate: async (id) => {
    try {
      await candidatesService.delete(id)
      set((state) => ({
        candidates: state.candidates.filter((c) => c.id !== id),
        error: null,
      }))
    } catch (error) {
      console.error('Error deleting candidate:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to delete candidate' })
      throw error
    }
  },

  updateCompanySettings: async (settings, teamId) => {
    try {
      const currentSettings = get().companySettings
      const mergedSettings = {
        info: { ...currentSettings.info, ...settings.info },
        branding: { ...currentSettings.branding, ...settings.branding },
        emailConfig: { ...currentSettings.emailConfig, ...settings.emailConfig },
      }
      const updated = await companySettingsService.upsert(mergedSettings, teamId)
      set({ companySettings: updated, error: null })
    } catch (error) {
      console.error('Error updating company settings:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update settings' })
      throw error
    }
  },
}))
