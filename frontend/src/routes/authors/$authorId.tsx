import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useApi } from '@/context/api'
import React from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/authors/$authorId')({
  component: AuthorComponent,
})

function AuthorComponent() {
  const { authorId } = Route.useParams()
  const { api } = useApi()

  const { data: author, isLoading, error } = api.useQuery('get', '/authors/{id}', {
    params: {
      path: { id: Number(authorId) },
    },
  })

  // Move useMemo here, before any conditional returns
  const fullName = React.useMemo(() => {
    // Handle case where author might be undefined
    if (!author) return "Unknown Author";

    return [author.first_name, author.last_name]
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
      <Link to="/authors" className={buttonVariants({ variant: "outline", className: "pl-0 mb-2"})}>&larr; Back to all authors</Link>
      
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
          <CardDescription>Books written by this author</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {author.Books && author.Books.length > 0 ? (
              <div className="space-y-4">
                {author.Books.map((book) => (
                  <Card key={book.ID || `book-${Math.random()}`} className="overflow-hidden">
                    <div className="sm:flex">
                      {/* Book cover image */}
                      <div className="sm:w-32 h-40 sm:h-auto flex-shrink-0">
                        <img
                          src={book.Cover?.image_url?.String || 'https://placehold.co/200x300?text=No+Cover'}
                          alt={`Cover of ${book.title || 'Untitled Book'}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      {/* Book details */}
                      <div className="flex flex-col flex-1">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              {book.genres && book.genres.length > 0 && (
                                book.genres.map((genre) => (
                                  <Badge key={genre.ID} variant="outline" className="mb-2">
                                    {genre.name}
                                  </Badge>
                                ))
                              )}
                              <CardTitle>{book.title || 'Untitled'}</CardTitle>
                            </div>
                            {book.price !== undefined && (
                              <div className="font-bold">${book.price.toFixed(2)}</div>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-sm">
                            {book.published_date && (
                              <div>
                                <span className="text-muted-foreground">Published:</span>{' '}
                                <span className="font-medium">
                                  {new Date(book.published_date).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            
                            {book.pages !== undefined && (
                              <div>
                                <span className="text-muted-foreground">Pages:</span>{' '}
                                <span className="font-medium">{book.pages}</span>
                              </div>
                            )}
                          </div>
                          
                          {book.description && (
                            <>
                              <Separator className="my-2" />
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {book.description}
                              </p>
                            </>
                          )}
                        </CardContent>
                        
                        <CardFooter className="mt-auto pt-0">
                          {book.ID ? (
                            <Link 
                              to="/books/$bookId" 
                              params={{ bookId: book.ID.toString() }}
                              className={buttonVariants({ variant: "outline", size: "sm" })}
                            >
                              View Details
                            </Link>
                          ) : (
                            <Button variant="outline" disabled size="sm">
                              No Details
                            </Button>
                          )}
                        </CardFooter>
                      </div>
                    </div>
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
