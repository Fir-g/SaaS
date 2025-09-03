import React from "react";

interface IntegrationsLayoutProps {
  children: React.ReactNode;
}

const IntegrationsLayout: React.FC<IntegrationsLayoutProps> = ({ children }) => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="p-0 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsLayout;