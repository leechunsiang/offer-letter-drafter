import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { teamsService, TeamWithRole } from '@/lib/teams'
import { useAuth } from './AuthContext'

interface TeamContextType {
  currentTeam: TeamWithRole | null
  teams: TeamWithRole[]
  loading: boolean
  selectTeam: (teamId: string) => void
  refreshTeams: () => Promise<void>
  getCurrentRole: () => 'owner' | 'admin' | 'user' | null
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

const TEAM_STORAGE_KEY = 'selected_team_id'

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currentTeam, setCurrentTeam] = useState<TeamWithRole | null>(null)
  const [teams, setTeams] = useState<TeamWithRole[]>([])
  const [loading, setLoading] = useState(true)

  const loadTeams = useCallback(async () => {
    if (!user) {
      setTeams([])
      setCurrentTeam(null)
      setLoading(false)
      return
    }

    try {
      const userTeams = await teamsService.getMyTeams()
      setTeams(userTeams)

      // Try to restore previously selected team
      const savedTeamId = localStorage.getItem(TEAM_STORAGE_KEY)
      if (savedTeamId && userTeams.find(t => t.id === savedTeamId)) {
        setCurrentTeam(userTeams.find(t => t.id === savedTeamId) || null)
      } else if (userTeams.length > 0) {
        // Select first team if no saved team
        setCurrentTeam(userTeams[0])
        localStorage.setItem(TEAM_STORAGE_KEY, userTeams[0].id)
      } else {
        setCurrentTeam(null)
      }
    } catch (error) {
      console.error('Error loading teams:', error)
      setTeams([])
      setCurrentTeam(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  const selectTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    if (team) {
      setCurrentTeam(team)
      localStorage.setItem(TEAM_STORAGE_KEY, teamId)
    }
  }

  const refreshTeams = async () => {
    await loadTeams()
  }

  const getCurrentRole = () => {
    return currentTeam?.role || null
  }

  const value = {
    currentTeam,
    teams,
    loading,
    selectTeam,
    refreshTeams,
    getCurrentRole
  }

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}
