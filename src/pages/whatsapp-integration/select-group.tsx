import LeftSectionWhatsapp from "@/components/whatsapp-integration/left-section-whatsapp";
import SelectGroup from "@/components/whatsapp-integration/select-group";

const SelectGrouptoRead = () => {
  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-background">
      <LeftSectionWhatsapp currentStep={"Configure conversations"} stepNo={3} />
      <div className="flex-1 lg:w-3/4">
        <SelectGroup />
      </div>
    </div>
  );
};

export default SelectGrouptoRead;
