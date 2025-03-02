import React from "react"
import { createApiClient } from "@/lib/api"

interface AuthContextValue {
    isAuthenticated: boolean
    login: (username: string, password: string) => Promise<boolean>
    logout: () => Promise<void>
    getToken: () => string | null
}

export const ApiContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false)
    const [token, setToken] = React.useState<string | null>(null)

    React.useEffect(() => {
      const storedToken = localStorage.getItem("authToken")
      if (storedToken) {
        setToken(storedToken)
        setIsAuthenticated(true)
      }
    }, [])

    const getToken = React.useCallback(() => token, [token])

    const login = async (username: string, password: string) => {
      try {
        const client = createApiClient(() => token)
        const response = await client.POST("/auth/login", {
          body: {
            username,
            password
          }
        })

        if (response.data?.authToken) {
          setToken(response.data.authToken)
          setIsAuthenticated(true)
          localStorage.setItem("authToken", response.data.authToken)
          return true
        }
        return false
      } catch (error) {
        console.error("Login failed", error)
        return false
      }

    }

    const logout = async () => {
      try {
        const client = createApiClient(() => token)
        await client.POST("/auth/logout")  
      } catch (error) {
        console.error("Logout failed", error)
      } finally {
        setToken(null)
        setIsAuthenticated(false)
        localStorage.removeItem("authToken")
      }
    }
    

  return (
    <ApiContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      getToken      
    }}>
      {children}
    </ApiContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(ApiContext)
  if (context === undefined) {
    throw new Error("useApi must be used within a ApiContextProvider")
  }
  return context
}