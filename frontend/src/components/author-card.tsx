import * as React from "react"
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AuthorCard({ author }: { author: { id: string; name: string } }) {
  return (
    <Card className="w-[350px]">
      <CardHeader className="flex items-center justify-between">
        <Skeleton className="rounded-full w-16 h-16 mb-4" />
        <div className="mr-4 flex-1">
          <CardTitle>{author.name}</CardTitle>
          <CardDescription>Lorem ipsum dolor sit amet.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter>
        <Link to='/authors/$authorId' params={{authorId: author.id}} className={buttonVariants({ variant: "outline" })}>View</Link>
      </CardFooter>
    </Card>
  )
}
