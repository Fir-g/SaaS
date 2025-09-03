import * as React from "react"
import { useOrganization, useOrganizationList, useUser } from "@clerk/clerk-react"
import { useNavigate } from "react-router-dom"
import { Check, ChevronsUpDown, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function OrganizationSwitcher() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const { user } = useUser()
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
      pageSize: 100, // Increase page size to get more members
    },
  })

  // Prefer INTERNAL orgs; if none found, fall back to all org memberships
  const allOrganizations = userMemberships?.data || []
  const internalOrganizations = allOrganizations.filter(
    (membership) => membership.organization.publicMetadata?.companyType === "INTERNAL"
  )
  const displayOrganizations = internalOrganizations.length > 0 ? internalOrganizations : allOrganizations

  // Auto-select first organization if none is selected
  React.useEffect(() => {
    if (displayOrganizations.length > 0 && !organization) {
      const firstOrg = displayOrganizations[0]
      setActive({ organization: firstOrg.organization.id })
    }
  }, [displayOrganizations, organization, setActive])

  // If no internal organizations, show admin contact message
  if (displayOrganizations.length === 0) {
    return (
      <div className="w-full p-3 text-center bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          Please contact your Administrator
        </p>
      </div>
    )
  }

  const currentOrgName = organization?.name || "Select Organization"
  const currentOrgImage = organization?.imageUrl

  const handleSelect = (orgId: string | null) => {
    setActive({ organization: orgId })
    setOpen(false)
    // Navigate to dashboard after organization switch
    navigate("/")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-card hover:bg-accent/50 border-border transition-smooth min-w-0"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={currentOrgImage} />
              <AvatarFallback className="bg-gradient-freight text-primary-foreground text-xs">
                {organization ? <Building2 className="h-3 w-3" /> : user?.firstName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="truncate font-medium text-sm">{currentOrgName}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 bg-popover border-border shadow-freight" align="start" sideOffset={8}>
        <Command className="bg-transparent">
          <CommandInput placeholder="Search organizations..." className="border-0" />
          <CommandList>
            <CommandEmpty>No internal organizations found.</CommandEmpty>
            
            <CommandGroup heading="Organizations">
              {displayOrganizations.map(({ organization: org }) => (
                <CommandItem
                  key={org.id}
                  onSelect={() => handleSelect(org.id)}
                  className="cursor-pointer hover:bg-accent/50 p-3"
                >
                  <Avatar className="mr-3 h-8 w-8 shrink-0">
                    <AvatarImage src={org.imageUrl} />
                    <AvatarFallback className="bg-gradient-freight text-primary-foreground text-xs">
                      <Building2 className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{org.name}</span>
                    {org.publicMetadata?.teamType && (
                      <p className="text-xs text-muted-foreground capitalize">
                        {String(org.publicMetadata.teamType).toLowerCase()}
                      </p>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      organization?.id === org.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}