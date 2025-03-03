import { Link, useRouter } from "@tanstack/react-router"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { Menu, Book, LogIn, LayoutDashboard, LogOut } from "lucide-react"
import { useAuth } from "@/context/auth"

const items = {
  home: {
    title: 'Home',
    href: '/',
  },
  authors: {
    title: 'Authors',
    href: '/authors',
  },
  artists: {
    title: 'Artists',
    href: '/artists',
  },
  books: {
    title: 'Books',
    href: '/books',
  },
}

export default function NavHeader() {
  const { logout, isAuthenticated } = useAuth()
  const { navigate } = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto flex h-16 max-w-6xl items-center px-4 md:px-6">
        {/* Left section - Logo */}
        <div className="flex-shrink-0 mr-4">
          <Link to="/" className="flex items-center gap-2">
            <Book className="h-6 w-6" />
            <span className="sr-only">Company logo</span>
          </Link>
        </div>

        {/* Middle section - Navigation */}
        <div className="flex-grow">
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
        </div>

        {/* Right section - Login button and mobile menu */}
        <div className="flex items-center gap-2">
          {/* Login Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/admin/dashboard"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              <Button
                onClick={() => {
                  logout()
                  navigate({ to: '/' })
                }}
                variant={"outline"}
                size={"sm"}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          ) : (

            <Link
              to="/auth/login"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <LogIn className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Login</span>
            </Link>
          )}

          {/* Mobile Navigation */}
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
