import { SidebarNavigation, ChatSessionsList } from "./workspace";
import { useChatStore } from "../stores/chatStore";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ActiveView = "files" | "data" | "chat";

interface WorkspaceSidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function WorkspaceSidebar({
  activeView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
}: WorkspaceSidebarProps) {
  const { projectId } = useParams();
  const {
    sessions,
    activeSessionId,
    setActiveSession,
    loadSessions,
    loading,
  } = useChatStore();

  // Local state to track which session is being loaded
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId && activeView === "chat") {
      loadSessions(projectId);
    }
  }, [projectId, activeView, loadSessions]);

  const handleNewChat = async () => {
    if (!projectId) return;

    try {
      const newSessionId = (crypto.randomUUID?.() || uuidv4());
      setActiveSession(newSessionId, projectId, false);
      onViewChange("chat");
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    try {
      setLoadingSessionId(sessionId); // Set loading for this specific session
      await setActiveSession(sessionId, projectId, true);
      onViewChange("chat");
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setLoadingSessionId(null); // Clear loading state
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "";
    }
  };

  const getSessionTitle = (session: any) => {
    // Check if session has messages and get the first user message
    if (session.messages && session.messages.length > 0) {
      const firstUserMessage = session.messages.find(
        (msg: any) => msg.role === "user"
      );
      if (firstUserMessage && firstUserMessage.content) {
        const content = firstUserMessage.content;
        return content.length > 30
          ? `${content.substring(0, 30)}...`
          : content;
      }
    }
    // Fallback to session creation date
    return `Chat ${formatDate(session.created_at)}`;
  };

  return (
    <div 
      className={cn(
        "fixed left-0 top-12 bottom-0 bg-white/95 backdrop-blur border-r border-gray-200 z-30 flex flex-col transition-all duration-300 ease-in-out shadow-lg",
        isCollapsed ? "w-16" : "w-80"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">Workspace</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="ml-auto hover:bg-gray-100"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-hidden">
        <SidebarNavigation 
          activeView={activeView}
          onViewChange={onViewChange}
          isCollapsed={isCollapsed}
        />

        {/* Chat Sessions - Only show when not collapsed and chat is active */}
        {!isCollapsed && activeView === "chat" && (
          <div className="flex-1 overflow-auto">
            <ChatSessionsList
              sessions={sessions}
              activeSessionId={activeSessionId}
              loadingSessionId={loadingSessionId}
              loading={loading}
              onNewChat={handleNewChat}
              onSessionClick={handleSessionClick}
              getSessionTitle={getSessionTitle}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          </div>
        )}
      </div>
    </div>
  );
}