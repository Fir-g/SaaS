import {
  LayoutDashboard,
  Users,
  Settings,
  Truck,
  BarChart3,
  Package,
  MapPin,
  Workflow,
  FileText,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth, useOrganization } from "@clerk/clerk-react";

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
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: any;
  subtitle?: string;
};

// Generate Demand Aggregator item based on the active tab
function getDemandAggregatorItemByTab(
  activeTab: "hub" | "odvlsp" | "rca" | "spreadsheet"
): NavItem {
  const subtitles: Record<string, string> = {
    hub: "Hub",
    odvlsp: "ODV LSP",
    rca: "RCA",
    spreadsheet: "Spreadsheet",
  };

  return {
    title: "Demand Aggregator",
    url: `/demand-aggregator/${activeTab}`,
    icon: Truck,
    subtitle: subtitles[activeTab],
  };
}

// Generate Integrations item subtitle based on the current route
function getIntegrationsItemByRoute(currentPath: string): NavItem {
  let subtitle: string | undefined = undefined;
  if (
    currentPath === "/integrations/whatsapp-integration" ||
    currentPath.startsWith("/integrations/whatsapp")
  ) {
    subtitle = "WhatsApp";
  } else if (currentPath === "/integrations/google-sheets-integration") {
    subtitle = "Google Sheets";
  } else if (
    currentPath.startsWith("/integrations/crm") ||
    currentPath === "/integrations/upload-data" ||
    currentPath === "/integrations/crm-success"
  ) {
    subtitle = "CRM";
  }

  return {
    title: "Integrations",
    url: "/integrations",
    icon: Workflow,
    subtitle,
  };
}

// Static navs
const staticNavigationItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Shipments", url: "/shipments", icon: Package },
  { title: "Tracking", url: "/tracking", icon: MapPin },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Demand Aggregator", url: "/demand-aggregator/hub", icon: Truck },
  { title: "Integrations", url: "/integrations", icon: Workflow },
];

const fulfilmentItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  {
    title: "Supply Sourcing",
    subtitle: "Inventory",
    url: "/inventory",
    icon: Package,
  },
  { title: "Integrations", url: "/integrations", icon: Workflow },
];

const onboardingItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
];

const adminItems: NavItem[] = [
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { has } = useAuth();
  const { organization } = useOrganization();
  const currentPath = location.pathname;

  const isAdmin = has && has({ role: "org:admin" });
  const collapsed = !open;

  const teamType = organization?.publicMetadata?.teamType as string;
  const isFulfilmentTeam = teamType === "FULFILMENT" || teamType === "FULFILLMENT";
  const isOnboardingTeam = teamType === "ONBOARDING";

  const rawVariant = organization?.publicMetadata?.demandAggregatorVariant as string;
  const defaultVariant = ["hub", "odvlsp", "rca", "spreadsheet"].includes(rawVariant)
    ? (rawVariant as "hub" | "odvlsp" | "rca" | "spreadsheet")
    : "hub";

  // Determine active tab from URL; fallback to org default
  const activeAggregatorTab: "hub" | "odvlsp" | "rca" | "spreadsheet" =
    currentPath.startsWith("/demand-aggregator/rca")
      ? "rca"
      : currentPath.startsWith("/demand-aggregator/odvlsp")
      ? "odvlsp"
      : currentPath.startsWith("/demand-aggregator/hub")
      ? "hub"
      : currentPath.startsWith("/demand-aggregator/spreadsheet")
      ? "spreadsheet"
      : defaultVariant;

  const demandAggregatorItem = getDemandAggregatorItemByTab(activeAggregatorTab);
  const integrationsItem = getIntegrationsItemByRoute(currentPath);

  let mainNavItems: NavItem[] = [];

  if (isFulfilmentTeam) {
    mainNavItems = [
      fulfilmentItems[0],
      fulfilmentItems[1],
      demandAggregatorItem,
      integrationsItem,
    ];
  } else if (isOnboardingTeam) {
    mainNavItems = onboardingItems;
  } else {
    mainNavItems = staticNavigationItems.map((item) =>
      item.title === "Demand Aggregator"
        ? demandAggregatorItem
        : item.title === "Integrations"
        ? integrationsItem
        : item
    );
  }

  // Active if exact or within nested routes (overridden below for Integrations)

  const getNavCls = (path: string) => {
    const active = isActive(path);
    return cn(
      "transition-smooth hover:bg-accent/50 rounded-md",
      active
        ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/20"
        : "text-muted-foreground hover:text-foreground"
    );
  };

  // Treat any /integrations or nested path as part of Integrations for active state
  const isIntegrationsRoute =
    currentPath === "/integrations" ||
    currentPath.startsWith("/integrations/");

  // Active if exact or within nested routes, with special-case for Integrations
  function isActive(path: string) {
    if (path === "/integrations") {
      return isIntegrationsRoute;
    }
    return currentPath === path || currentPath.startsWith(path + "/");
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

      <SidebarContent className={cn(collapsed ? "px-0 py-8" : "px-2 py-8")}>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={getNavCls(item.url)}
                      >
                        <item.icon className="h-4 w-6" />
                        {!collapsed &&
                          (item.subtitle ? (
                            <span className="relative inline-block align-baseline">
                              <span
                                className={cn(
                                  "pr-3 pb-0.5",
                                  active
                                    ? "font-semibold text-primary-foreground"
                                    : "font-medium"
                                )}
                              >
                                {item.title}
                              </span>
                              (<span>{item.subtitle}</span>)
                            </span>
                          ) : (
                            <span>{item.title}</span>
                          ))}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
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
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
