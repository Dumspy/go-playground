import { fullName } from '@/lib/utils'
import { components } from '@/types/shared-types'
import { Link } from '@tanstack/react-router'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ArtistCardProps {
    artist: components["schemas"]["go-playground_internal_server_types.ListArtistResponse"]
  }

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Card className="w-[350px]">
      <CardHeader className="flex items-center justify-between">
        <Skeleton className="rounded-full w-16 h-16 mb-4" />
        <div className="mr-4 flex-1">
          <CardTitle>{fullName(artist.first_name, artist.last_name)}</CardTitle>
          <CardDescription>Lorem ipsum dolor sit amet.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter>
        {artist?.id ? (
          <Link
            to="/artists/$artistId"
            params={{ artistId: artist.id.toString() }}
            className={buttonVariants({ variant: "outline" })}
          >
            View
          </Link>
        ) : (
          <span className={buttonVariants({ variant: "outline" })}>No Details</span>
        )}
      </CardFooter>
    </Card>
  )
}
