import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useApi } from '@/context/api'
import React from 'react'

export const Route = createFileRoute('/authors/$authorId')({
  component: AuthorComponent,
})

function AuthorComponent() {
  const { authorId } = Route.useParams()
  const { api } = useApi()

  const { data: author, isLoading, error } = api.useQuery('get', '/authors/{id}', {
    params: {
      path: { id: Number(authorId)},
    },
  })
  
  // Move useMemo here, before any conditional returns
  const fullName = React.useMemo(() => {
    // Handle case where author might be undefined
    if (!author) return "Unknown Author";
    
    return [author.FirstName, author.LastName]
      .filter(Boolean)
      .join(' ') || "Unknown Author";
  }, [author]);
  
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

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load author information. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle case where author data is undefined or null
  if (!author) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Author Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The author you are looking for could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{fullName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            No biography available
            {/* {author.biography || 'No biography available'} */}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Published Books</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4"> 
            {author.Books && author.Books.length > 0 ? (
              <div className="space-y-4">
                {author.Books.map((book) => (
                  <Card key={book.ID || `book-${Math.random()}`}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{book.Title || 'Untitled'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Published: {book.PublishedData? new Date(book.PublishedData).getFullYear() : 'Unknown year'}
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
