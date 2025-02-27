import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetDescription 
} from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
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
  books: {
    title: 'Books',
    href: '/books',
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
        
        {/* Desktop Navigation using shadcn NavigationMenu */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {Object.values(items).map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <Link to={item.href} className={navigationMenuTriggerStyle()}>
                    {item.title}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        
        {/* Mobile Navigation - Sheet */}
        <div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="md:hidden">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Browse the available pages of our application.
                </SheetDescription>
              </SheetHeader>
              <nav className="grid gap-6 py-6">
                {Object.values(items).map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-base font-medium transition-colors hover:text-primary"
                  >
                    {item.title}
                  </Link> 
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
