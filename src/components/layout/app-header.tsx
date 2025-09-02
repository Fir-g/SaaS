import { SidebarTrigger } from '@/components/ui/sidebar'
import { useUser, useAuth } from '@clerk/clerk-react'
import { OrganizationSwitcher } from '@/components/ui/organization-switcher'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

function getUserInitials(name: string | null | undefined) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function AppHeader() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false)

  const handleLogout = () => {
    signOut()
    setProfilePopoverOpen(false)
  }

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3 md:gap-4 ml-6">
        <img
          src={import.meta.env.BASE_URL + 'ft_logo.png'}
          alt="Freight Tiger"
          className="hidden sm:block h-8 w-auto object-contain"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = import.meta.env.BASE_URL + 'favicon.ico' }}
        />
        <SidebarTrigger className="hover:bg-accent/50 ml-12" />
        <OrganizationSwitcher />
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Popover open={profilePopoverOpen} onOpenChange={setProfilePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-accent/50 h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'User'} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getUserInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end" sideOffset={8}>
            <Card className="border-0 shadow-lg">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'User'} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.primaryEmailAddress?.emailAddress || 'No email'}
                    </p>
                  </div>
                </div>

                <Separator className="my-3" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </Card>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}

// Main App Layout Component
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

export default AppHeader