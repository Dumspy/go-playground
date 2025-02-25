import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

interface IGlobalContentProps {
  children: React.JSX.Element | React.JSX.Element[]
}

const queryClient = new QueryClient()

export default function GlobalContext({ children }: IGlobalContentProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}