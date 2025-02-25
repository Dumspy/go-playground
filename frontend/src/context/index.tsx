import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import { ApiContextProvider } from "./api"

interface IGlobalContentProps {
  children: React.ReactNode
}

const queryClient = new QueryClient()

export default function GlobalContext({ children }: IGlobalContentProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiContextProvider>
        {children}
      </ApiContextProvider>
    </QueryClientProvider>
  )
}