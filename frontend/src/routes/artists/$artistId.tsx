import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useApi } from '@/context/api'
import React from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { fullName } from '@/lib/utils'

export const Route = createFileRoute('/artists/$artistId')({
  component: ArtistComponent,
})

function ArtistComponent() {
  const { artistId } = Route.useParams()
  const { api } = useApi()

  const { data: artist, isLoading, error } = api.useQuery('get', '/artists/{id}', {
    params: {
      path: { id: Number(artistId) },
    },
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

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load artist information. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle case where artist data is undefined or null
  if (!artist) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Artist Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The artist you are looking for could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <Link to="/artists" className={buttonVariants({ variant: "outline", className: "pl-0 mb-2" })}>&larr; Back to all artists</Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{fullName(artist.first_name, artist.last_name)}</CardTitle>
          <CardDescription>No description available</CardDescription>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artwork Collection</CardTitle>
          <CardDescription>Books this artist has worked on</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {artist.Covers && artist.Covers.length > 0 ? (
              <div className="space-y-4">
                {artist.Covers.map((cover) => (
                  <Card key={cover.ID || `artwork-${Math.random()}`} className="overflow-hidden">
                    <div className="sm:flex">
                      {/* Artwork image */}
                      <div className="sm:w-32 h-40 sm:h-auto flex-shrink-0">
                        <img
                          src={cover.image_url?.String || 'https://placehold.co/200x200?text=No+Image'}
                          alt={`${cover.book_id || 'Untitled Artwork'}`}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Artwork details */}
                      <div className="flex flex-col flex-1">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{cover.book?.title || 'Untitled'}</CardTitle>
                            </div>
                            {cover.book?.price !== undefined && (
                              <div className="font-bold">${cover.book.price.toFixed(2)}</div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-sm">
                            {cover.book?.published_date && (
                              <div>
                                <span className="text-muted-foreground">Created:</span>{' '}
                                <span className="font-medium">{cover.book.published_date}</span>
                              </div>
                            )}
                          </div>

                          {cover.book?.description && (
                            <>
                              <Separator className="my-2" />
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {cover.book.description}
                              </p>
                            </>
                          )}
                        </CardContent>

                        <CardFooter className="mt-auto pt-0">
                          {cover.book && cover.book.ID ? (
                          <Link
                            to="/books/$bookId"
                            params={{ bookId: cover.book.ID.toString() }}
                            className={buttonVariants({ variant: "outline" })}
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
              <p className="text-muted-foreground">No artworks found for this artist</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
