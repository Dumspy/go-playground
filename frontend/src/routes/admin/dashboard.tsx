import React from 'react'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useNavigate } from '@tanstack/react-router'

// Define tab values and labels first
const tabDefinitions = [
  { value: 'authors', label: 'Authors', component: React.lazy(() => import('@/components/admin/dashboard/tabs/authors')) },
];

// Use the definitions for schema validation
const searchSchema = z.object({
  category: z.enum(tabDefinitions.map(tab => tab.value) as [string, ...string[]]).catch(tabDefinitions[0].value),
})

type Search = z.infer<typeof searchSchema>
type Category = Search['category']

export const Route = createFileRoute('/admin/dashboard')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { category } = useSearch({ from: '/admin/dashboard' })
  const navigate = useNavigate()

  const handleTabChange = (value: string) => {
    navigate({
      to: '/admin/dashboard',
      search: { category: value as Category },
      replace: true,
    })
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      <Tabs value={category} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          {tabDefinitions.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabDefinitions.map(tab => {
          const TabComponent = tab.component
          return (
            <TabsContent key={tab.value} value={tab.value}>
              <React.Suspense fallback={<div>Loading...</div>}>
                <TabComponent />
              </React.Suspense>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  )
}
