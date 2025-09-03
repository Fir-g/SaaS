import { useState } from "react"
import { useOrganization, useAuth } from "@clerk/clerk-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Shield, 
  User, 
  Trash2,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Team() {
  const { organization, memberships, invitations } = useOrganization({
    memberships: { 
      infinite: true,
      pageSize: 100 // Increase page size to get more members
    },
    invitations: { 
      infinite: true,
      pageSize: 100 // Increase page size to get more invitations
    }
  })
  const { has } = useAuth()
  const { toast } = useToast()
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)

  const isAdmin = has && has({ role: "org:admin" })

  const handleInvite = async () => {
    if (!inviteEmail || !organization) return

    setIsInviting(true)
    try {
      await organization.inviteMember({
        emailAddress: inviteEmail,
        role: "org:member"
      })
      
      toast({
        title: "Invitation sent!",
        description: `Invited ${inviteEmail} to join ${organization.name}`,
      })
      
      setInviteEmail("")
    } catch (error) {
      toast({
        title: "Failed to send invitation",
        description: "Please check the email address and try again.",
        variant: "destructive"
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!organization) return

    try {
      await organization.removeMember(userId)
      toast({
        title: "Member removed",
        description: "Team member has been removed from the organization.",
      })
    } catch (error) {
      toast({
        title: "Failed to remove member",
        description: "Please try again later.",
        variant: "destructive"
      })
    }
  }

  const handleRevokeInvitation = async (invitationId: string, invitation: any) => {
    if (!organization) return

    try {
      await invitation.revoke()
      toast({
        title: "Invitation revoked",
        description: "The invitation has been cancelled.",
      })
    } catch (error) {
      toast({
        title: "Failed to revoke invitation",
        description: "Please try again later.",
        variant: "destructive"
      })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "org:admin": return "bg-secondary text-secondary-foreground"
      case "org:member": return "bg-muted text-muted-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const formatRole = (role: string) => {
    switch (role) {
      case "org:admin": return "Admin"
      case "org:member": return "Member"
      default: return "Member"
    }
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Organization Selected</h3>
          <p className="mt-2 text-muted-foreground">
            Please select an organization to manage team members.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage members and invitations for {organization.name}
          </p>
        </div>
        
        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-popover border-border">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join {organization.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleInvite} 
                  disabled={!inviteEmail || isInviting}
                  className="w-full"
                >
                  {isInviting ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="members">Active Members</TabsTrigger>
          <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Team Members ({memberships?.data?.length || 0})
              </CardTitle>
              <CardDescription>
                Active members of {organization.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberships?.data?.map((membership) => (
                  <div key={membership.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={membership.publicUserData?.imageUrl} />
                        <AvatarFallback className="bg-gradient-freight text-primary-foreground">
                          {membership.publicUserData?.firstName?.[0]}{membership.publicUserData?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {membership.publicUserData?.firstName} {membership.publicUserData?.lastName}
                        </p>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {membership.publicUserData?.identifier}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleColor(membership.role)}>
                        <Shield className="mr-1 h-3 w-3" />
                        {formatRole(membership.role)}
                      </Badge>
                      
                      {isAdmin && membership.role !== "org:admin" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-popover border-border">
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(membership.publicUserData?.userId || "")}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!memberships?.data || memberships.data.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="mx-auto h-8 w-8 mb-2" />
                    <p>No team members found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Invitations ({invitations?.data?.length || 0})
              </CardTitle>
              <CardDescription>
                Outstanding invitations to join {organization.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations?.data?.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.emailAddress}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Invited {new Date(invitation.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                      
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-popover border-border">
                            <DropdownMenuItem
                              onClick={() => handleRevokeInvitation(invitation.id, invitation)}
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Revoke Invitation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!invitations?.data || invitations.data.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="mx-auto h-8 w-8 mb-2" />
                    <p>No pending invitations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}