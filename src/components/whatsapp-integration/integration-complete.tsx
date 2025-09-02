import NextButton from "@/components/ui/next-button";

const IntegrationComplete = () => {
  return (
    <div className="flex flex-col min-h-screen py-6 px-12 pt-20">
      {/* Main content area that grows to fill space */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-12">
        <div className="space-y-4 flex flex-col justify-center items-center text-center">
          <div className="mb-4">
            <img
              src="/success.svg"
              alt="whatsapp integration successful"
              className="h-32"
            />
          </div>
          <div className="text-gray-800 text-3xl font-semibold">
            WhatsApp integration verified
          </div>
          <p className="text-gray-500 text-lg max-w-md">
            Please click on complete setup to finish the integration of WhatsApp
          </p>
        </div>
      </div>

      {/* Button area that stays at bottom */}
      <div className="mt-8">
        <NextButton nextPageUrl="/integrations" text="Finish Setup" />
      </div>
    </div>
  );
};

export default IntegrationComplete;