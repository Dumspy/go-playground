import React from "react"
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "@/types/shared-types";
import { useQueryClient } from "@tanstack/react-query";

interface ApiContextValue {
  api: ReturnType<typeof createClient<paths>>
  tanClient: ReturnType<typeof useQueryClient>
}

export const ApiContext = React.createContext<ApiContextValue | undefined>(undefined)

export function ApiContextProvider({ children }: { children: React.ReactNode }) {
  const tanClient = useQueryClient()
  const api = React.useMemo(() => {
    const fetchClient = createFetchClient<paths>({
      baseUrl: "http://localhost:8080/api/v1",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    return createClient(fetchClient)
  }, [])

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