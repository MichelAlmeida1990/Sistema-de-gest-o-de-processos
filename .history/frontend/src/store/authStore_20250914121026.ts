import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: number
  username: string
  email: string
  name: string
  role: string
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  token: string | null
  refreshToken: string | null
}

interface AuthActions {
  login: (token: string, refreshToken: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
  checkToken: () => boolean
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  refreshToken: null,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: (token: string, refreshToken: string, user: User) => {
        set({
          isAuthenticated: true,
          token,
          refreshToken,
          user,
          isLoading: false,
        })
      },

      logout: () => {
        set({
          ...initialState,
          isLoading: false,
        })
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData },
          })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      checkToken: () => {
        const { token } = get()
        
        if (!token) {
          return false
        }

        try {
          const decoded = jwtDecode(token) as any
          const currentTime = Date.now() / 1000
          
          if (decoded.exp < currentTime) {
            // Token expirado
            get().logout()
            return false
          }
          
          return true
        } catch (error) {
          // Token inválido
          get().logout()
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)

