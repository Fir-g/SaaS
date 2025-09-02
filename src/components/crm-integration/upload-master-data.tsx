import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/ui/page-wrapper";
import NextButton from "@/components/ui/next-button";
import { MasterDataTypes } from "@/constants/UploadFiles";
import CSVFileUpload from "./file-upload";

const UploadMasterData = () => {
  const handleFileUpload = (file: File): void => {
    console.log("File uploaded:", file.name);
  };

  const handleFileRemove = () => {
    console.log("File removed");
  };
  return (
    <div className="flex flex-col w-full h-screen py-6 px-12 pt-20">
      <PageWrapper header="Upload your master data (optional)" description="">
        <div className="space-y-4">
          {MasterDataTypes.map(({ title, description }) => (
            <div
              key={title}
              className="flex justify-between space-y-2 w-full p-4 border rounded-lg transition-colors text-left items-start"
            >
              <div className="flex flex-col gap-4 ">
                <div className="font-medium mb-1">{title}</div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <div className="flex flex-col">
                <CSVFileUpload
                  onFileUpload={handleFileUpload}
                  onFileRemove={handleFileRemove}
                />
                <Button variant="link" className="text-blue-600 p-0">
                  Download Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </PageWrapper>
      <NextButton nextPageUrl="/crm-success" text="Next" />
    </div>
  );
};

export default UploadMasterData;
