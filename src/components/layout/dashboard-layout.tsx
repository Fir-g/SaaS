import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { useUser, useAuth } from "@clerk/clerk-react"
import { Bell, Check, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { OrganizationSwitcher } from "@/components/ui/organization-switcher";
import AppHeader from "./app-header"

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  read: boolean
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser()
  const { signOut } = useAuth()
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Trip Assignment',
      message: 'You have been assigned a new trip from Mumbai to Delhi',
      type: 'info',
      timestamp: '2 minutes ago',
      read: false
    },
    {
      id: '2',
      title: 'Fleet Owner Verified',
      message: 'ABC Transport has completed verification successfully',
      type: 'success',
      timestamp: '15 minutes ago',
      read: false
    },
    {
      id: '3',
      title: 'Payment Due',
      message: 'Payment for trip T001 is due in 2 days',
      type: 'warning',
      timestamp: '1 hour ago',
      read: false
    },
    {
      id: '4',
      title: 'Document Uploaded',
      message: 'New RC document uploaded for vehicle MH12AB1234',
      type: 'info',
      timestamp: '2 hours ago',
      read: true
    },
    {
      id: '5',
      title: 'Trip Completed',
      message: 'Trip T002 has been completed successfully',
      type: 'success',
      timestamp: '4 hours ago',
      read: true
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  const handleLogout = () => {
    signOut()
    setProfilePopoverOpen(false)
  }

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen min-w-screen flex flex-col bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 pl-6 md:pl-8 bg-background">
            <div className="flex w-full h-full mx-auto pt-16">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}