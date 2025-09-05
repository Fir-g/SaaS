import React from "react";
import { MapPin, Truck, Package, CheckCircle, XCircle } from "lucide-react";

interface DemandEntry {
  id: string;
  origin: string;
  destination: string;
  vehicle_type?: string;
  demand_src?: string;
  quantity: number;
  source?: "whatsapp" | "email" | "gmail" | "";
}

interface DemandCardProps {
  demand: DemandEntry;
  variant?: "success" | "failed";
}

const DemandCard: React.FC<DemandCardProps> = ({
  demand,
  variant = "success",
}) => {
  const isSuccess = variant === "success";

  const renderSourceIcon = () => {
    if (!demand.source) return null;

    switch (demand.source.toLowerCase()) {
      case "whatsapp":
        return (
          <button
            className="hover:opacity-80 transition-opacity duration-200"
            aria-label="Open WhatsApp"
          >
            <img
              src="/whatsapp.svg"
              alt="WhatsApp"
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
          </button>
        );
      case "gmail":
      case "email":
        return (
          <button
            className="hover:opacity-80 transition-opacity duration-200"
            aria-label="Open Gmail"
          >
            <img
              src="/gmail.svg"
              alt="Gmail"
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`
  relative border rounded-xl p-3 sm:p-4 my-1
        w-full                          /* fits the basis set by the wrapper */
        min-h-[140px] sm:min-h-[150px] lg:min-h-[160px]
        bg-white shadow-sm hover:shadow-md transition-all duration-200 
        border-gray-200 hover:border-gray-300
        overflow-hidden                 /* prevent inner overflow from stretching card */
        group
      `}
    >
      {/* Status + Qty */}
      <div className="flex items-center justify-between mb-2">
        <div
          className={`
            flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-s font-semibold
            ${
              isSuccess
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }
          `}
        >
          {isSuccess ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {isSuccess ? "Published" : "Unpublished"}
        </div>

        <div className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
          Qty: {demand.quantity}
        </div>
      </div>

      {/* Route */}
      <div className="mb-2">
        <div className="flex items-center gap-2 sm:gap-2 mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1 sm:p-1.5 bg-blue-50 rounded-lg flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-s font-medium text-gray-700 truncate">
              {demand.origin}
            </span>
          </div>

          <div className="flex-shrink-0 px-1.5 sm:px-2">
            <div className="w-8 h-0.5 bg-gray-300 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1 sm:p-1.5 bg-purple-50 rounded-lg flex-shrink-0">
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-s font-medium text-gray-700 truncate">
              {demand.destination}
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-orange-50 rounded flex-shrink-0">
            <Truck className="w-3 h-3 text-orange-600" />
          </div>
          <span className="text-sm text-gray-900">Vehicle:</span>
          <span className="text-xs font-medium text-gray-800 capitalize truncate">
            {demand.vehicle_type || "Not specified"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 sm:gap-2">
        <button
          className="
            flex items-center justify-center gap-2 px-3 sm:px-6 py-2 border border-gray-200 rounded-lg 
            text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 
            transition-all duration-200 flex-1
          "
        >
          <span className="truncate">View in CRM</span>
        </button>

        {renderSourceIcon() && (
          <div className="flex-shrink-0">{renderSourceIcon()}</div>
        )}
      </div>
    </div>
  );
};

export default DemandCard;
