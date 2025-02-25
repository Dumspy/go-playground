import { createFileRoute } from '@tanstack/react-router'
import AuthorCard from '@/components/author-card'
import { useApi } from '@/context/api'

export const Route = createFileRoute('/authors/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {api} = useApi()

  const apiAuthors = api.useQuery('get', '/authors')

  const authors = [
    { id: '1', name: 'Author 1' },
    { id: '2', name: 'Author 2' },
    { id: '3', name: 'Author 3' },
  ]

  return (
    <div className="p-2 flex flex-col items-center">
      <h2 className='text-2xl text-center'>Our authors</h2>
      <p className='text-center text-gray-600'>Meet the brilliant minds behind our content</p>
      <div className="mt-4 w-full max-w-4xl">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
          {authors.map((author) => (
            <li key={author.id} className="w-full max-w-xs">
              <AuthorCard author={author} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
