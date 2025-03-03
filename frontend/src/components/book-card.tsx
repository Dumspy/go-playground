import { components } from '@/types/shared-types'
import { Link } from '@tanstack/react-router'
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { fullName } from '@/lib/utils'

interface BookCardProps {
  book: components["schemas"]["go-playground_internal_server_types.ListBookResponse"]
}

export default function BookCard({ book }: BookCardProps) {
  const defaultCoverUrl = 'https://placehold.co/200x300?text=No+Cover'

  return (
    <Link
      to="/books/$bookId"
      params={{ bookId: book.id?.toString() || '' }}
      className="block h-full"
    >
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="aspect-[2/3] w-full overflow-hidden relative">
            <img
              src={book.Cover?.image_url|| defaultCoverUrl}
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = defaultCoverUrl
              }}
            />
            {book.digital_only && (
              <Badge className="absolute top-2 right-2" variant="secondary">
                Digital Only
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-medium text-lg line-clamp-2">{book.title}</h3>
          {book.Author && (
            <p className="text-sm text-gray-600 mt-1">by {fullName(book.Author.first_name, book.Author.last_name)}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
