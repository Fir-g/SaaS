import { useUser } from "@clerk/clerk-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  const { user } = useUser()
  return (
    <div className="p-6 md:p-8">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">Name: {user?.fullName || user?.username || 'User'}</p>
          <p className="text-sm">Email: {user?.primaryEmailAddress?.emailAddress || 'N/A'}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function DefaultDashboard() {
  const { user } = useUser()

  const stats: any[] = []

  const recentShipments = [
    {
      id: "FT-2024-001",
      origin: "Los Angeles, CA",
      destination: "Houston, TX",
      status: "In Transit",
      eta: "Dec 28, 2024",
      carrier: "Swift Transport"
    },
    {
      id: "FT-2024-002",
      origin: "Chicago, IL",
      destination: "Miami, FL",
      status: "Delivered",
      eta: "Dec 26, 2024",
      carrier: "Rapid Freight"
    },
    {
      id: "FT-2024-003",
      origin: "Seattle, WA",
      destination: "Denver, CO",
      status: "Pickup Scheduled",
      eta: "Dec 30, 2024",
      carrier: "Mountain Logistics"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Transit": return "bg-secondary text-secondary-foreground"
      case "Delivered": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Pickup Scheduled": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const performanceMetrics = [
    { label: "On-time Delivery", value: "94%", trend: "+2%", isUp: true },
    { label: "Fleet Utilization", value: "87%", trend: "+5%", isUp: true },
    { label: "Customer Satisfaction", value: "4.8/5", trend: "+0.2", isUp: true },
    { label: "Fuel Efficiency", value: "8.2 MPG", trend: "-0.3", isUp: false }
  ]

  const upcomingTasks = [
    { task: "Vehicle Maintenance - MH12AB1234", priority: "high", due: "Today" },
    { task: "Driver License Renewal - 3 drivers", priority: "medium", due: "This Week" },
    { task: "Insurance Policy Review", priority: "low", due: "Next Week" },
    { task: "Route Optimization Analysis", priority: "medium", due: "Tomorrow" }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-smooth border-border hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">{stat.change} from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Shipments */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-secondary" />
                  Recent Shipments
                </CardTitle>
                <CardDescription>
                  Your latest freight movements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentShipments.map((shipment) => (
                  <div key={shipment.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-accent/50 transition-smooth cursor-pointer">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{shipment.id}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {shipment.origin} → {shipment.destination}
                      </div>
                      <p className="text-xs text-muted-foreground">{shipment.carrier}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {shipment.eta}
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  View All Shipments
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for your logistics operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3">
                  <Button variant="outline" className="flex items-center gap-3 p-4 h-auto justify-start">
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Create New Shipment</p>
                      <p className="text-sm text-muted-foreground">Book a new freight shipment</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="flex items-center gap-3 p-4 h-auto justify-start">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Track Shipment</p>
                      <p className="text-sm text-muted-foreground">Monitor existing shipments</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="flex items-center gap-3 p-4 h-auto justify-start">
                    <div className="h-10 w-10 rounded-lg bg-freight-orange/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-freight-orange" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Invite Team Member</p>
                      <p className="text-sm text-muted-foreground">Add users to your organization</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{metric.value}</span>
                        <div className={`flex items-center gap-1 text-xs ${metric.isUp ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {metric.trend}
                        </div>
                      </div>
                    </div>
                    <Progress value={metric.label === "On-time Delivery" ? 94 : metric.label === "Fleet Utilization" ? 87 : 80} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{task.task}</p>
                      <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                    </div>
                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$127,500</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
                <div className="mt-4">
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">75% of monthly target</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Fleet Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Active</span>
                    <span className="font-medium">6/8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Maintenance</span>
                    <span className="font-medium">1/8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Available</span>
                    <span className="font-medium">1/8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Completed Deliveries</p>
                  <div className="text-lg font-semibold text-secondary">8</div>
                  <p className="text-xs text-muted-foreground">Scheduled Pickups</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>
                Download detailed reports for your logistics operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="flex items-center gap-2 h-auto p-4 justify-start">
                  <BarChart3 className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Performance Report</p>
                    <p className="text-sm text-muted-foreground">Fleet and delivery analytics</p>
                  </div>
                </Button>
                <Button variant="outline" className="flex items-center gap-2 h-auto p-4 justify-start">
                  <DollarSign className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Financial Report</p>
                    <p className="text-sm text-muted-foreground">Revenue and expense breakdown</p>
                  </div>
                </Button>
                <Button variant="outline" className="flex items-center gap-2 h-auto p-4 justify-start">
                  <Truck className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Fleet Report</p>
                    <p className="text-sm text-muted-foreground">Vehicle utilization and maintenance</p>
                  </div>
                </Button>
                <Button variant="outline" className="flex items-center gap-2 h-auto p-4 justify-start">
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Team Report</p>
                    <p className="text-sm text-muted-foreground">Driver performance and schedules</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Team-specific dashboard components
function FulfillmentDashboard() {
  const { organization } = useOrganization()
  const { user } = useUser()

  return (
    <div className="space-y-8 p-6 md:p-8 lg:p-10 animate-fade-in">
      <div className="flex flex-col gap-3 px-2">
        <h1 className="text-3xl font-bold text-foreground">
          Fulfillment Dashboard - {user?.firstName}
        </h1>
        <p className="text-muted-foreground text-lg">
          Managing fulfillment operations for {organization?.name}
        </p>
      </div>
      <Card className="mx-2">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-center">Fulfillment-specific dashboard coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

function OnboardingDashboard() {
  const { organization } = useOrganization()
  const { user } = useUser()

  const mockOnboardingStats = {
    totalApplications: 156,
    pendingVerification: 23,
    completedKYC: 89,
    todaySubmissions: 8,
    avgProcessingTime: "2.5 days"
  };

  const mockRecentApplications = [
    { id: "KB001", name: "ABC Transport Ltd", step: "Bank Verification", status: "pending", submittedAt: "2024-01-15" },
    { id: "KB002", name: "XYZ Logistics", step: "RC Verification", status: "verified", submittedAt: "2024-01-15" },
    { id: "KB003", name: "Quick Move Services", step: "Address Verification", status: "pending", submittedAt: "2024-01-14" }
  ];

  return (
    <div className="space-y-8 p-6 md:p-8 lg:p-10 animate-fade-in">
      <div className="flex flex-col gap-3 px-2">
        <h1 className="text-3xl font-bold text-foreground">
          Onboarding Dashboard - {user?.firstName}
        </h1>
        <p className="text-muted-foreground text-lg">
          Monitor KYC verification and customer onboarding progress
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOnboardingStats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">+{mockOnboardingStats.todaySubmissions} today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOnboardingStats.pendingVerification}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed KYC</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOnboardingStats.completedKYC}</div>
            <p className="text-xs text-muted-foreground">Fully verified</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOnboardingStats.avgProcessingTime}</div>
            <p className="text-xs text-muted-foreground">Per application</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{app.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {app.id} • Current: {app.step}</p>
                </div>
                <div className="text-right">
                  <Badge variant={app.status === 'approved' ? 'default' : app.status === 'verified' ? 'secondary' : 'outline'}>
                    {app.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{app.submittedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BizOpsDashboard() {
  const { organization } = useOrganization()
  const { user } = useUser()

  return (
    <div className="space-y-8 p-6 md:p-8 lg:p-10 animate-fade-in">
      <div className="flex flex-col gap-3 px-2">
        <h1 className="text-3xl font-bold text-foreground">
          Business Operations Dashboard - {user?.firstName}
        </h1>
        <p className="text-muted-foreground text-lg">
          Managing business operations for {organization?.name}
        </p>
      </div>
      <Card className="mx-2">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-center">BizOps-specific dashboard coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

function PaymentsDashboard() {
  const { organization } = useOrganization()
  const { user } = useUser()

  return (
    <div className="space-y-8 p-6 md:p-8 lg:p-10 animate-fade-in">
      <div className="flex flex-col gap-3 px-2">
        <h1 className="text-3xl font-bold text-foreground">
          Payments Dashboard - {user?.firstName}
        </h1>
        <p className="text-muted-foreground text-lg">
          Managing payment operations for {organization?.name}
        </p>
      </div>
      <Card className="mx-2">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-center">Payments-specific dashboard coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}