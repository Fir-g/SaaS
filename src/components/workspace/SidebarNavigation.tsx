import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Files, Database, MessageSquare } from "lucide-react";

type ActiveView = "files" | "data" | "chat";

interface SidebarNavigationProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  isCollapsed?: boolean;
}

const menuItems = [
  {
    id: "files" as ActiveView,
    label: "Files",
    icon: Files,
    description: "Upload and manage files",
  },
  {
    id: "data" as ActiveView,
    label: "Extracted Data",
    icon: Database,
    description: "View processed data",
  },
  {
    id: "chat" as ActiveView,
    label: "Chat",
    icon: MessageSquare,
    description: "AI assistant chat",
  },
];

export function SidebarNavigation({ activeView, onViewChange, isCollapsed = false }: SidebarNavigationProps) {
  return (
    <div className="flex-shrink-0 py-4 px-3">
      {!isCollapsed && (
        <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3 tracking-wide px-2">
          Navigation
        </h3>
      )}

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full transition-all duration-200",
                isCollapsed ? "h-12 px-3 justify-center" : "h-auto p-3 justify-start",
                isActive
                  ? "bg-[#3b1344] text-white shadow-md hover:bg-[#3b1344]/90"
                  : "hover:bg-gray-100 text-gray-700"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {isCollapsed ? (
                <Icon className="h-5 w-5" />
              ) : (
                <div className="flex items-center space-x-3 w-full">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className={cn(
                      "text-xs mt-0.5",
                      isActive ? "text-white/90" : "text-gray-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </div>
              )}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}