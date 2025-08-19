import React from "react";
import DashboardHeader from "../dashboard/dashboard-header";

interface IntegrationsLayoutProps {
  children: React.ReactNode;
}

const IntegrationsLayout: React.FC<IntegrationsLayoutProps> = ({ children }) => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex flex-col h-full w-full py-6 px-12 mb-48">
        {children}
      </div>
    </div>
  );
};

export default IntegrationsLayout;
