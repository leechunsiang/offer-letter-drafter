import { create } from 'zustand'

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
  addCandidate: (candidate: Omit<Candidate, 'id' | 'status'>) => void
  updateCandidateStatus: (id: string, status: 'Pending' | 'Generated') => void
  addTemplate: (template: Omit<Template, 'id'>) => void
  updateTemplate: (id: string, content: string) => void
  updateCompanySettings: (settings: Partial<CompanySettings>) => void
}

export const useStore = create<Store>((set) => ({
  candidates: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Software Engineer',
      status: 'Pending',
      offerDate: '2023-10-26',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Product Manager',
      status: 'Generated',
      offerDate: '2023-10-25',
    },
  ],
  templates: [
    {
      id: '1',
      name: 'Standard Offer',
      content: `Dear {{name}},

We are pleased to offer you the position of {{role}} at our company.

Start Date: {{offerDate}}

Sincerely,
HR Team`,
    },
  ],
  companySettings: {
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
  },
  addCandidate: (candidate) =>
    set((state) => ({
      candidates: [
        ...state.candidates,
        { ...candidate, id: Math.random().toString(36).substr(2, 9), status: 'Pending' },
      ],
    })),
  updateCandidateStatus: (id, status) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === id ? { ...c, status } : c
      ),
    })),
  addTemplate: (template) =>
    set((state) => ({
      templates: [
        ...state.templates,
        { ...template, id: Math.random().toString(36).substr(2, 9) },
      ],
    })),
  updateTemplate: (id, content) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, content } : t
      ),
    })),
  updateCompanySettings: (settings) =>
    set((state) => ({
      companySettings: { ...state.companySettings, ...settings },
    })),
}))
