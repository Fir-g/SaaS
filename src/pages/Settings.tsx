import { useState, useMemo } from "react"
import { useUser, useOrganization, useAuth } from "@clerk/clerk-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, Building2, Save } from "lucide-react"

export default function Settings() {
  const { user } = useUser()
  const { organization, membership } = useOrganization()
  const { has } = useAuth()
  const { toast } = useToast()

  const [userForm, setUserForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: user?.primaryPhoneNumber?.phoneNumber || "",
  })

  const orgName = organization?.name || "—"
  const orgRole = useMemo(() => {
    // Prefer explicit Clerk membership role when available
    const clerkRole = membership?.role?.toString()
    if (clerkRole) return clerkRole
    // Fallback to role check helper
    if (has && has({ role: "org:admin" })) return "admin"
    return "member"
  }, [membership?.role, has])

  const handleUserSave = async () => {
    try {
      await user?.update({
        firstName: userForm.firstName,
        lastName: userForm.lastName,
      })
      toast({ title: "Profile updated", description: "Your information has been saved." })
    } catch (error) {
      toast({ title: "Failed to update profile", description: "Please try again later.", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your personal settings</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-gradient-freight text-primary-foreground text-lg">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Signed in to</p>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{orgName}</span>
                <span className="text-muted-foreground">•</span>
                <span className="uppercase tracking-wide text-xs bg-muted px-2 py-0.5 rounded">{orgRole}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={userForm.firstName} onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={userForm.lastName} onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" value={userForm.email} disabled className="pl-10 bg-muted cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="phone" type="tel" value={userForm.phone} disabled className="pl-10 bg-muted cursor-not-allowed" placeholder="Add phone number in Clerk profile" />
            </div>
          </div>

          <Button onClick={handleUserSave} className="bg-secondary hover:bg-secondary/90">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}