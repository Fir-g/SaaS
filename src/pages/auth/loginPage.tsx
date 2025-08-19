import LeftSectionOnboarding from "@/components/layout/auth/left-section-onboard"
import LoginSection from "@/components/layout/auth/login-section"

export default function LoadSyncPage() {
  return (
    <div className="flex flex-row min-h-screen min-w-screen bg-background">
      <LeftSectionOnboarding />
      <LoginSection />
    </div>
  )
};