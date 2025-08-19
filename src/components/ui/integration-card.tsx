import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface IntegrationCardProps {
  icon: string;
  name: string;
  description: string;
  connectionStatus?: string;
  onConnect: () => void;
  className?: string;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  icon,
  name,
  description,
  connectionStatus,
  onConnect,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex justify-between items-start mb-3">
        {/* Icon on left */}
        <img src={icon} alt={name} className="w-8 h-8" />

        {/* Status badge on right */}
        {connectionStatus && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
            {connectionStatus}
          </span>
        )}
      </div>

      {/* Title & description */}
      <h3 className="text-sm font-medium text-gray-900 mb-1">{name}</h3>
      <p className="text-gray-600 text-xs mb-3">{description}</p>

      {/* Connect Button */}
      <Button
        variant="outline"
        onClick={onConnect}
        className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50 text-sm py-1.5"
      >
        Connect
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>
    </div>
  );
};

export default IntegrationCard;
