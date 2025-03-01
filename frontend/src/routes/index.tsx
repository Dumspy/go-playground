import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="text-center">
          <Badge className="mb-4" variant="secondary">Established 1995</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">Horizon Publishing</h1>
          <p className="text-xl md:text-2xl text-slate-700 max-w-2xl mx-auto mb-8">
            Bringing exceptional stories to life for readers around the world
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Explore Our Books</Button>
            <Button variant="outline" size="lg">About Us</Button>
          </div>
        </div>
      </section>
      
      <Separator className="my-8" />
      
      {/* Featured Books Carousel */}
      <section className="py-12">
        <h2 className="text-3xl font-semibold text-center mb-8">Featured Titles</h2>
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {[1, 2, 3, 4, 5].map((book) => (
              <CarouselItem key={book} className="md:basis-1/3 lg:basis-1/3">
                <Card>
                  <CardHeader className="p-0">
                    <div className="aspect-[2/3] bg-slate-200 rounded-t-md"></div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <CardTitle className="text-lg">Book Title {book}</CardTitle>
                    <CardDescription>Author Name</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>
      
      {/* Book Categories */}
      <section className="py-12 my-8">
        <h2 className="text-3xl font-semibold text-center mb-8">Browse by Genre</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Fiction', 'Non-Fiction', 'Poetry', 'Children\'s'].map((genre) => (
            <Card key={genre} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-center">{genre}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="ghost">Explore</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      <Separator className="my-8" />
      
      {/* About Publisher */}
      <section className="py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-semibold mb-4">About Horizon Publishing</h2>
          <p className="text-slate-600 mb-4">
            Founded in 1995, Horizon Publishing has been dedicated to discovering 
            and promoting exceptional literary voices from around the world.
          </p>
          <p className="text-slate-600 mb-4">
            Our commitment to quality storytelling and beautiful book design has 
            established us as a leading independent publisher in the industry.
          </p>
          <Button variant="link" className="p-0">Learn more about our story →</Button>
        </div>
        <Card className="overflow-hidden">
          <div className="aspect-video bg-slate-200"></div>
        </Card>
      </section>
      
      {/* Testimonials */}
      <section className="py-12 my-8 bg-slate-50 rounded-xl">
        <h2 className="text-3xl font-semibold text-center mb-8">What Authors Say</h2>
        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {[1, 2, 3].map((testimonial) => (
              <CarouselItem key={testimonial}>
                <Card className="mx-4">
                  <CardContent className="pt-6">
                    <p className="text-slate-600 italic mb-4">
                      "Working with Horizon Publishing was the best decision of my writing career. 
                      Their dedication to quality and author support is unmatched in the industry."
                    </p>
                    <p className="font-semibold">— Author Name {testimonial}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>
      
      {/* Newsletter */}
      <section className="py-12 bg-slate-900 text-white text-center rounded-xl my-8">
        <Card className="bg-transparent border-none shadow-none text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">Join Our Reader's Club</CardTitle>
            <CardDescription className="text-slate-300">
              Get exclusive access to new releases, author interviews, and special discounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full max-w-md mx-auto space-x-2">
              <Input 
                type="email" 
                placeholder="Email" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button variant="secondary">Subscribe</Button>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-600">
        <Separator className="mb-8" />
        <p>© {new Date().getFullYear()} Horizon Publishing. All rights reserved.</p>
      </footer>
    </div>
  )
}