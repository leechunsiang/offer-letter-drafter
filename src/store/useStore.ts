import { create } from 'zustand'
import { candidatesService, templatesService, companySettingsService } from '@/lib/database'
import { initializeDatabase, seedInitialData } from '@/lib/initDb'

export interface Candidate {
  id: string
  name: string
  email: string
  role: string
  status: 'Pending' | 'Generated'
  offerDate: string
}

export interface Template {
  id: string
  name: string
  content: string
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
  loadCandidates: () => Promise<void>
  loadTemplates: () => Promise<void>
  loadCompanySettings: () => Promise<void>
  addCandidate: (candidate: Omit<Candidate, 'id' | 'status'>) => Promise<void>
  updateCandidateStatus: (id: string, status: 'Pending' | 'Generated') => Promise<void>
  addTemplate: (template: Omit<Template, 'id'>) => Promise<void>
  updateTemplate: (id: string, content: string) => Promise<void>
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>
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

  loadCandidates: async () => {
    try {
      const candidates = await candidatesService.getAll()
      set({ candidates, error: null })
    } catch (error) {
      console.error('Error loading candidates:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to load candidates' })
    }
  },

  loadTemplates: async () => {
    try {
      const templates = await templatesService.getAll()
      set({ templates, error: null })
    } catch (error) {
      console.error('Error loading templates:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to load templates' })
    }
  },

  loadCompanySettings: async () => {
    try {
      const settings = await companySettingsService.get()
      if (settings) {
        set({ companySettings: settings, error: null })
      }
    } catch (error) {
      console.error('Error loading company settings:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to load settings' })
    }
  },

  addCandidate: async (candidate) => {
    try {
      const newCandidate = await candidatesService.create(candidate)
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

  updateCandidateStatus: async (id, status) => {
    try {
      const updatedCandidate = await candidatesService.updateStatus(id, status)
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

  addTemplate: async (template) => {
    try {
      const newTemplate = await templatesService.create(template)
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

  updateTemplate: async (id, content) => {
    try {
      const updatedTemplate = await templatesService.update(id, content)
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

  updateCompanySettings: async (settings) => {
    try {
      const currentSettings = get().companySettings
      const mergedSettings = {
        info: { ...currentSettings.info, ...settings.info },
        branding: { ...currentSettings.branding, ...settings.branding },
        emailConfig: { ...currentSettings.emailConfig, ...settings.emailConfig },
      }
      const updated = await companySettingsService.upsert(mergedSettings)
      set({ companySettings: updated, error: null })
    } catch (error) {
      console.error('Error updating company settings:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update settings' })
      throw error
    }
  },
}))
