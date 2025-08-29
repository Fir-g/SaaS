import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SignedOut>
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Branding */}
          <div className="text-center space-y-4">
            <div className="mx-auto">
              <img 
                src={import.meta.env.BASE_URL + 'ft_logo.png'}
                alt="Freight Tiger Logo" 
                className="h-20 w-auto object-contain"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = import.meta.env.BASE_URL + 'favicon.ico' }}
              />
            </div>
            
          </div>

          {/* Auth Card */}
             <div className="flex justify-center">
                <SignIn
                  afterSignInUrl="/dashboard"
                  afterSignUpUrl="/dashboard"
                  appearance={{
                    elements: {
                      footerActionLink: "hidden",
                      footerAction: "hidden",
                      alternativeMethods: "hidden",
                      alternativeMethodsBlockButton: "hidden",
                      phoneInputBox: "hidden",
                      otherMethodsAction: "hidden",
                      identityPreviewEditButton: "hidden",
                    },
                    layout: {
                      socialButtonsPlacement: "top",
                    },
                  }}
                />
              </div>
            
          
          {/* Features removed per requirement */}
        </div>
      </SignedOut>

      <SignedIn>
        {/* This will be handled by the main app routing */}
        <div className="text-center text-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading your dashboard...</p>
        </div>
      </SignedIn>
    </div>
  )
}