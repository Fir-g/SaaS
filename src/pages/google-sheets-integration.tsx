import React from "react";
import PageWrapper from "@/components/ui/page-wrapper";

const GoogleSheetsIntegrationPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-screen py-4 px-12 pt-20">
      <PageWrapper
        header="Google Sheets Integration"
        description="Connect your Google Sheets to receive and process data demands"
      >
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Google Sheets Integration Coming Soon
          </h3>
          <p className="text-gray-600">
            This integration is currently under development. Please check back later.
          </p>
        </div>
      </PageWrapper>
    </div>
  );
};

export default GoogleSheetsIntegrationPage;
