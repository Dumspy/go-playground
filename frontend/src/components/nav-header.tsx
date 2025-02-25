import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Menu, Book } from "lucide-react"

const items = {
  home: {
    title: 'Home',
    href: '/',
  },
  authors: {
    title: 'Authors',
    href: '/authors',
  },
  about: {
    title: 'About',
    href: '/about',
  },
}

export default function NavHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Book className="h-6 w-6" />
          <span className="sr-only">Company logo</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {Object.values(items).map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              {item.title}  
            </Link>
          ))}
        </nav>
        <div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="md:hidden">
              <div className="grid gap-4 p-4">
                {Object.values(items).map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  >
                    {item.title}
                  </Link> 
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
