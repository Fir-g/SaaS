import LeftSectionCRM from "@/components/crm-integration/left-section-crm";
import UploadMasterData from "@/components/crm-integration/upload-master-data";

const UploadMasterDataPage = () => {
  return (
    <div className="flex flex-row min-h-screen min-w-screen bg-background">
      <LeftSectionCRM stepNo={2} currentStep={"Upload Master data"} />
      <UploadMasterData />
    </div>
  );
};

export default UploadMasterDataPage;
