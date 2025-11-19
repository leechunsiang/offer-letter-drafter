import { Link, Outlet, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/store/useStore"
import { LoadingPage } from "./LoadingSpinner"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Candidates",
    href: "/candidates",
    icon: Users,
  },
  {
    title: "Templates",
    href: "/templates",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Layout() {
  const location = useLocation()
  const { isLoading, initialized, error } = useStore()

  if (!initialized && isLoading) {
    return <LoadingPage />
  }

  if (error && !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold text-destructive">Error Loading Application</h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <FileText className="h-6 w-6" />
          <span className="text-lg font-bold">Offer Drafter</span>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                location.pathname === item.href &&
                  "bg-muted text-primary font-medium"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex flex-1 flex-col sm:pl-64">
        <div className="p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
