import React from 'react';
import { MapPin, Truck, Package, Mail, MessageSquare, Eye, CheckCircle, AlertCircle } from 'lucide-react';

interface DemandEntry {
  id: string;
  origin: string;
  destination: string;
  vehicle_type?: string;
  demand_src?: string;
  quantity: number;
  source?: "whatsapp" | "email" | "";
}

interface DemandCardProps {
  demand: DemandEntry;
  variant?: "success" | "failed";
}

const DemandCard: React.FC<DemandCardProps> = ({ demand, variant = "success" }) => {
  const isSuccess = variant === "success";
  
  // Function to render the appropriate source icon
  const renderSourceIcon = () => {
    if (!demand.source) return null;
    
    switch (demand.source.toLowerCase()) {
      case "whatsapp":
        return (
          <button className="hover:opacity-80 transition-opacity duration-200">
          <img 
            src="/whatsapp.svg" 
            alt="WhatsApp" 
            className="w-8 h-8 mr-4" 
          />
        </button>
                );
      case "email":
        return (
          <button className="hover:opacity-80 transition-opacity duration-200">
          <img 
            src="/gmail.svg" 
            alt="gmail" 
            className="w-8 h-8" 
          />
        </button>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className={`
      relative border rounded-xl p-4 my-4 flex-1 min-w-[280px] max-w-[320px] 
      bg-white shadow-sm hover:shadow-md transition-all duration-200 
      ${isSuccess ? 'border-green-200 hover:border-green-300' : 'border-red-200 hover:border-red-300'}
      group
    `}>
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={`
          flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
          ${isSuccess 
            ? "bg-green-100 text-green-800 border border-green-200" 
            : "bg-red-100 text-red-800 border border-red-200"
          }
        `}>
          {isSuccess ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          {isSuccess ? "Published" : "Unpublished"}
        </div>
        
        {/* Quantity Badge */}
        <div className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
          Qty: {demand.quantity}
        </div>
      </div>

      {/* Route Information */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 truncate">
              {demand.origin}
            </span>
          </div>
          
          <div className="flex-shrink-0">
            <div className="w-8 h-0.5 bg-gray-300 relative">
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-1">
            <div className="p-1.5 bg-purple-50 rounded-lg">
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 truncate">
              {demand.destination}
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle and Source Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-orange-50 rounded">
            <Truck className="w-3 h-3 text-orange-600" />
          </div>
          <span className="text-xs text-gray-600">Vehicle:</span>
          <span className="text-xs font-medium text-gray-800 capitalize">
            {demand.vehicle_type || "Not specified"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button className="
          flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-lg 
          text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 
          transition-all duration-200 flex-1 max-w-[150px]
        ">
          View in CRM
        </button>
        
        {/* Render source-specific icon or nothing if no source */}
        {renderSourceIcon()}
      </div>

      {/* Hover Effect Overlay */}
      {/* <div className={`
        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
        ${isSuccess ? 'bg-green-50' : 'bg-red-50'}
      `} style={{ mixBlendMode: 'multiply' }} /> */}
    </div>
  );
};

export default DemandCard;