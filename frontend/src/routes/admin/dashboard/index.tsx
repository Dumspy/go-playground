import { createFileRoute, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useNavigate } from '@tanstack/react-router'
import { FooTab } from './FooTab'
import { BarTab } from './BarTab'

const searchSchema = z.object({
  category: z.enum(['foo', 'bar']).catch('foo'),
})

type Search = z.infer<typeof searchSchema>
type Category = Search['category']

export const Route = createFileRoute('/admin/dashboard/')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { category } = useSearch({ from: '/admin/dashboard/' })
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
          <TabsTrigger value="foo">Foo</TabsTrigger>
          <TabsTrigger value="bar">Bar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="foo">
          <FooTab />
        </TabsContent>
        
        <TabsContent value="bar">
          <BarTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
