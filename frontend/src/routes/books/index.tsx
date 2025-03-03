import { createFileRoute } from '@tanstack/react-router'
import BookCard from '@/components/book-card'
import { useApi } from '@/context/api'

export const Route = createFileRoute('/books/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { api } = useApi()

  const { data, isLoading, error } = api.useQuery('get', '/books')

  // Ensure data is an array even if the response is undefined
  const books = Array.isArray(data) ? data : [];

  return (
    <div className="p-2 flex flex-col items-center">
      <h2 className='text-2xl text-center'>Our Books</h2>
      <p className='text-center text-gray-600'>Explore our collection of outstanding titles</p>
      <div className="mt-4 w-full max-w-4xl">
        {isLoading ? (
          <p className="text-center">Loading books...</p>
        ) : error ? (
          <p className="text-center text-red-500">Failed to load books. Please try again later.</p>
        ) : books.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
            {books.map((book) => (
              <li key={book?.id || Math.random().toString()} className="w-full max-w-xs">
                <BookCard book={book} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center">No books found.</p>
        )}
      </div>
    </div>
  )
}
