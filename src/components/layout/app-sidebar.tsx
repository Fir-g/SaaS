import { useState } from "react"
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Truck, 
  BarChart3,
  Package,
  MapPin,
  Workflow,
  FileText
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth, useOrganization } from "@clerk/clerk-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,

  useSidebar,
} from "@/components/ui/sidebar"
import { OrganizationSwitcher } from "@/components/ui/organization-switcher"

type NavItem = { title: string; url: string; icon: any; subtitle?: string }

const navigationItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Shipments", url: "/shipments", icon: Package },
  { title: "Tracking", url: "/tracking", icon: MapPin },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Demand Aggregator", url: "/demand-aggregator", icon: Truck },
  {title:"Integrations", url:"/integrations", icon:Workflow }
]

const fulfilmentItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Supply Sourcing", subtitle: "Inventory", url: "/inventory", icon: Package },
  { title: "Demand Aggregator", url: "/demand-aggregator", icon: Truck },
  {title:"Integrations", url:"/integrations", icon:Workflow },
]

const onboardingItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
]

const adminItems: NavItem[] = [
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state, open } = useSidebar()
  const location = useLocation()
  const { has } = useAuth()
  const { organization } = useOrganization()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath.startsWith(path)

  const isAdmin = has && has({ role: "org:admin" })
  const collapsed = !open
  
  // Check team type and company type from organization metadata
  const teamType = organization?.publicMetadata?.teamType as string
  const companyType = organization?.publicMetadata?.companyType as string
  
  
  // Check for both spellings since user mentioned "FULLFILMENT"
  const isFulfilmentTeam = teamType === "FULFILMENT" || teamType === "FULFILMENT"
  const isOnboardingTeam = teamType === "ONBOARDING"
  console.log("Is fulfilment team:", isFulfilmentTeam)
  console.log("Is onboarding team:", isOnboardingTeam)
  
  // Choose navigation items based on team type
  let mainNavItems = navigationItems
  if (isFulfilmentTeam) {
    mainNavItems = fulfilmentItems
  } else if (isOnboardingTeam) {
    mainNavItems = onboardingItems
  }
  console.log("Using navigation items:", mainNavItems.map(item => item.title))

  const getNavCls = (path: string) => {
    const active = isActive(path)
    return cn(
      "transition-smooth hover:bg-accent/50 rounded-md",
      active 
        ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/20" 
        : "text-muted-foreground hover:text-foreground"
    )
  }

  return (
    <Sidebar
      className={cn(
        "border-r bg-card/50 backdrop-blur-sm transition-smooth",
        collapsed ? "w-14" : "w-64 md:w-72"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-3 border-b" />

      <SidebarContent className="px-2 py-8">
        
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const active = isActive(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end={item.url === "/"} className={getNavCls(item.url)}>
                        <item.icon className="h-4 w-6 " />
                        {!collapsed && (
                          item.subtitle ? (
                            <span className="relative inline-block align-baseline">
                              <span className={cn("pr-3 pb-0.5", active ? "font-semibold text-primary-foreground" : "font-medium")}>{item.title}</span>
                              (<span
                                
                              >
                                {item.subtitle}
                              </span>)
                            </span>
                          ) : (
                            <span>{item.title}</span>
                          )
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-muted-foreground">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}