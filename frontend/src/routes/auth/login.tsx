import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/context/auth'
import { toast } from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from 'react'

// Define the validation schema
const loginSchema = z.object({
  username: z.string(),
  password: z.string()
})

// Type for the form values
type LoginFormValues = z.infer<typeof loginSchema>

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const { login } = useAuth()
  const { navigate } = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true)
      const success = await login(values.username, values.password)
      
      if (success) {
        toast("Login successful", {
          description: "Welcome back!",
        })
        navigate({ to: '/admin/dashboard' })
      } else {
        toast("Login failed", {
          description: "Invalid username or password. Please try again.",
        })
      }
    } catch (error) {
      toast("Login error", {
        description: "An unexpected error occurred. Please try again.",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center h-[calc(100vh-4rem-1px)] bg-gray-50">
      <Card className="w-[350px] m-4">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to sign in</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="yourusername" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">System login only</p>
        </CardFooter>
      </Card>
    </div>
  )
}