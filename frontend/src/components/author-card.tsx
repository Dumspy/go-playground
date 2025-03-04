import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { components } from "@/types/shared-types";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fullName } from "@/lib/utils";

interface AuthorCardProps {
  author: components["schemas"]["go-playground_internal_server_types.ListAuthorResponse"]
}

export default function AuthorCard({ author }: AuthorCardProps) {
  return (
    <Card className="w-[350px]">
      <CardHeader className="flex items-center justify-between">
        <Skeleton className="rounded-full w-16 h-16 mb-4" />
        <div className="mr-4 flex-1">
          <CardTitle>{fullName(author.first_name, author.last_name)}</CardTitle>
          <CardDescription>Lorem ipsum dolor sit amet.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter>
        {author?.id ? (
          <Link
            to="/authors/$authorId"
            params={{ authorId: author.id.toString() }}
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
