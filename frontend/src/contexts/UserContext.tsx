import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

export type UserRow = Database['public']['Tables']['users']['Row']

const STORAGE_KEY = 'aipb_current_user_id'

interface UserContextType {
  currentUser: UserRow | null
  users: UserRow[]
  setCurrentUserById: (userId: string) => void
  isLoading: boolean
  error: Error | null
  refetchUsers: () => Promise<UserRow[] | undefined>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refetchUsers = useCallback(async (): Promise<UserRow[] | undefined> => {
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (fetchError) throw fetchError
      setUsers(data ?? [])
      return data ?? []
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setUsers([])
      return undefined
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      setIsLoading(true)
      const list = await refetchUsers()
      if (cancelled) return

      const savedId = localStorage.getItem(STORAGE_KEY)
      const matched = list?.find((u) => u.id === savedId) ?? list?.[0] ?? null
      setCurrentUser(matched ?? null)
      if (matched && matched.id !== savedId) {
        localStorage.setItem(STORAGE_KEY, matched.id)
      } else if (matched) {
        localStorage.setItem(STORAGE_KEY, matched.id)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
      setIsLoading(false)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [refetchUsers])

  const setCurrentUserById = useCallback((userId: string) => {
    setCurrentUser((_prev) => {
      const next = users.find((u) => u.id === userId) ?? null
      if (next) {
        localStorage.setItem(STORAGE_KEY, userId)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
      return next
    })
  }, [users])

  // 사용자 목록이 바뀐 뒤 현재 유저가 목록에 없으면 첫 번째로 맞춤
  useEffect(() => {
    if (users.length === 0 || !currentUser) return
    const stillExists = users.some((u) => u.id === currentUser.id)
    if (!stillExists) {
      setCurrentUser(users[0] ?? null)
      localStorage.setItem(STORAGE_KEY, users[0]?.id ?? '')
    }
  }, [users, currentUser?.id])

  const value: UserContextType = {
    currentUser,
    users,
    setCurrentUserById,
    isLoading,
    error,
    refetchUsers
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
