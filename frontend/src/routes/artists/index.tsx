import { createFileRoute } from '@tanstack/react-router'
import ArtistCard from '@/components/artist-card'
import { useApi } from '@/context/api'

export const Route = createFileRoute('/artists/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { api } = useApi()

  const { data, isLoading, error } = api.useQuery('get', '/artists')

  // Ensure data is an array even if the response is undefined
  const artists = Array.isArray(data) ? data : [];

  return (
    <div className="p-2 flex flex-col items-center">
      <h2 className='text-2xl text-center'>Our Artists</h2>
      <p className='text-center text-gray-600'>Discover the talented artists behind our creations</p>
      <div className="mt-4 w-full max-w-4xl">
        {isLoading ? (
          <p className="text-center">Loading artists...</p>
        ) : error ? (
          <p className="text-center text-red-500">Failed to load artists. Please try again later.</p>
        ) : artists.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
            {artists.map((artist) => (
              <li key={artist?.id || Math.random().toString()} className="w-full max-w-xs">
                <ArtistCard artist={artist} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center">No artists found.</p>
        )}
      </div>
    </div>
  )
}
