import type React from "react"
import { Home, PawPrint, FileText, Settings, Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">Pet Protect</div>
            <div className="text-xs text-primary font-medium">& Connect</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          <Button
            variant="default"
            className="w-full justify-start gap-3 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <PawPrint className="w-4 h-4" />
            My Pets
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <FileText className="w-4 h-4" />
            Applications
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <Settings className="w-4 h-4" />
            Setting
          </Button>
        </nav>

        {/* Bottom Profile */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/golden-retriever.png" />
            <AvatarFallback>PC</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">Paws & Claws</div>
            <div className="text-xs text-muted-foreground truncate">Rescue Center</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground text-balance">
                Welcome back, Paws & Claws Rescue! 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your pets and review adoption applications</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-64 bg-background" />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
