import SideBarHeader from "@/components/ui/side-bar-header";

export default function LeftSectionOnboarding() {
  return (
    <div className="flex flex-col h-screen overflow-hidden w-3/5 bg-[#EEEFFA] py-6 px-12">
      <SideBarHeader />
      <div className="mb-8">
        <div className="text-black text-5xl font-semibold mb-4">
          FT Loadsync
        </div>
        <p className="text-gray-700 text-muted-foreground text-base">
          Connect multiple channels like WhatsApp and email to gather demand and
          supply data effortlessly and publish in the CRM tools.
        </p>
      </div>
      <img src="/wireframe.svg" alt="Wireframe logo" className="h-4/6" />
    </div>
  );
}
