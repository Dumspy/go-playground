import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useApi } from '@/context/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { fullName } from '@/lib/utils'

export const Route = createFileRoute('/books/$bookId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { history } = useRouter()
  const { bookId } = Route.useParams()
  const { api } = useApi()

  const { data: book, isLoading, error } = api.useQuery('get', "/books/{id}", {
    params: {
      path: { id: Number(bookId) },
    },
  })

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingBookDetail />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6 flex flex-col items-center">
          <p className="text-destructive">Error loading book details</p>
          <Button onClick={() => history.back} variant="link" className="mt-4">
            Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!book) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6 flex flex-col items-center">
          <p className="text-muted-foreground">Book not found</p>
          <Button onClick={() => history.back} variant="link" className="mt-4">
            Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Button variant="link" className="pl-0 mb-6" onClick={() => history.back()}>
        &larr; Back
      </Button>

      <Card className="overflow-hidden">
        <div className="md:flex">
          {/* Book cover image */}
          <div className="md:w-48 h-64 md:h-auto flex-shrink-0">
            <img
              src={book.Cover?.image_url?.String || 'https://placehold.co/300x450?text=No+Cover'}
              alt={`Cover of ${book.title}`}
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
                  <CardTitle className="text-3xl">{book.title}</CardTitle>
                </div>
                {book.price !== undefined && (
                  <div className="text-2xl font-bold">${book.price.toFixed(2)}</div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="text-muted-foreground">Author:</span>{' '}
                  <span className="font-medium">{fullName(book.author?.first_name, book.author?.last_name)}</span>
                </div>

                <div>
                  <span className="text-muted-foreground">Artist{book.Cover?.Artists?.length !== 1 ? 's' : ''}:</span>{' '}
                  <span className="font-medium">
                    {book.Cover?.Artists && book.Cover.Artists.length > 0
                      ? book.Cover.Artists.map(artist => fullName(artist.first_name, artist.last_name)).join(', ')
                      : 'No artists listed'}
                  </span>
                </div>

                {book.published_date && (
                  <div>
                    <span className="text-muted-foreground">Published:</span>{' '}
                    <span className="font-medium">
                      {new Date(book.published_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {book.isbn && (
                  <div>
                    <span className="text-muted-foreground">ISBN:</span>{' '}
                    <span className="font-medium">{book.isbn}</span>
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
                  <Separator className="my-4" />
                  <h2 className="font-semibold text-lg mb-2">Description</h2>
                  <p className="text-muted-foreground">{book.description}</p>
                </>
              )}
            </CardContent>

            {/* <CardFooter className="mt-auto">
              <Button>Add to Cart</Button>
            </CardFooter> */}
          </div>
        </div>
      </Card>
    </div>
  )
}

function LoadingBookDetail() {
  return (
    <Card className="w-full max-w-4xl">
      <div className="md:flex">
        <div className="md:w-48 h-64 md:h-auto flex-shrink-0">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex flex-col flex-1">
          <CardHeader>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            <Separator className="my-4" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
          <CardFooter className="mt-auto">
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}
