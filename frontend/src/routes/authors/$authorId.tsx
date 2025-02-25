import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/authors/$authorId')({
  component: AuthorComponent,
})

function AuthorComponent() {
  const { authorId } = Route.useParams()
  
  const { data: author, isLoading } = useQuery({
    queryKey: ['author', authorId],
    queryFn: async () => {
      const response = await fetch(`/api/authors/${authorId}`)
      if (!response.ok) throw new Error('Failed to fetch author')
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[250px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-[200px] mb-4" />
            <Skeleton className="h-4 w-[300px]" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{author.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {author.biography || 'No biography available'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Published Books</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {author.books?.length > 0 ? (
              <div className="space-y-4">
                {author.books.map((book) => (
                  <Card key={book.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Published: {new Date(book.publishedDate).getFullYear()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No books found for this author</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
