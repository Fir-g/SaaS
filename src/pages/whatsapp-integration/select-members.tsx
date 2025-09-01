import LeftSectionWhatsapp from "@/components/whatsapp-integration/left-section-whatsapp";
import SelectTeamMembers from "@/components/whatsapp-integration/select-members";

const SelectTeamMembersPage = () => {
  return (
    <div className="flex flex-row max-h-screen w-screen bg-background">
      <LeftSectionWhatsapp currentStep={"Configure team members"} stepNo={2} />
      <SelectTeamMembers />
    </div>
  );
};

export default SelectTeamMembersPage;
