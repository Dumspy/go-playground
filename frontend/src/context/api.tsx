import React from "react"
import createClient from "openapi-react-query";
import type { paths } from "@/types/shared-types";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { createApiClient } from "@/lib/api";

interface ApiContextValue {
  api: ReturnType<typeof createClient<paths>>
  tanClient: ReturnType<typeof useQueryClient>
}

export const ApiContext = React.createContext<ApiContextValue | undefined>(undefined)

export function ApiContextProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth()

  const tanClient = useQueryClient()
  
  const api = React.useMemo(() => {
    const fetchClient = createApiClient(getToken)
    return createClient(fetchClient)
  }, [getToken])

  return (
    <ApiContext.Provider value={{ api, tanClient }}>
      {children}
    </ApiContext.Provider>
  )
}

export function useApi() {
  const context = React.useContext(ApiContext)
  if (context === undefined) {
    throw new Error("useApi must be used within a ApiContextProvider")
  }
  return context
}