import { createFileRoute } from '@tanstack/react-router'
import AuthorCard from '@/components/author-card'
import { useApi } from '@/context/api'

export const Route = createFileRoute('/authors/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {api} = useApi()

  const {data, isLoading, error} = api.useQuery('get', '/authors')
  
  // Ensure data is an array even if the response is undefined
  const authors = Array.isArray(data) ? data : [];

  return (
    <div className="p-2 flex flex-col items-center">
      <h2 className='text-2xl text-center'>Our authors</h2>
      <p className='text-center text-gray-600'>Meet the brilliant minds behind our content</p>
      <div className="mt-4 w-full max-w-4xl">
        {isLoading ? (
          <p className="text-center">Loading authors...</p>
        ) : error ? (
          <p className="text-center text-red-500">Failed to load authors. Please try again later.</p>
        ) : authors.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
            {authors.map((author) => (
              <li key={author?.id || Math.random().toString()} className="w-full max-w-xs">
                <AuthorCard author={author} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center">No authors found.</p>
        )}
      </div>
    </div>
  )
}
