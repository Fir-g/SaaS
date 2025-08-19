export const mockDashboardData = {
  "Channel split": [
    {
      channelName: "Whatsapp",
      count: 120,
    },
    {
      channelName: "Email",
      count: 80,
    },
  ],

  "demand sourced": 1500,
  "demand published": 1490,
  "top routes": [
    {
      route: ["Mumbai", "Delhi"],
      demand: 40,
    },
    {
      route: ["Bangalore", "Hyderabad"],
      demand: 35,
    },
    {
      route: ["Chennai", "Kolkata"],
      demand: 30,
    },
    {
      route: ["Pune", "Ahmedabad"],
      demand: 25,
    },
    {
      route: ["Jaipur", "Surat"],
      demand: 20,
    },
  ],
  "demand trend": {
    "week 1": 20,
    "week 2": 40,
    "week 3": 50,
    "week 4": 40,
  },
};
export const data = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      // label: "First dataset",
      data: [33, 53, 85, 41, 44, 65],
      fill: true,
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)",
    },
  ],
};
