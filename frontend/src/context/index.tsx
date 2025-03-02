import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import { ApiContextProvider } from "./api"
import { AuthContextProvider } from "./auth"

interface IGlobalContentProps {
  children: React.ReactNode
}

const queryClient = new QueryClient()

export default function GlobalContext({ children }: IGlobalContentProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <ApiContextProvider>
          {children}
        </ApiContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  )
}