const mockDashboardData = {
  "Channel split": {
    whatsapp: 120,
    email: 80,
  },
  "demand sourced": 150,
  "demand published": 130,
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



const DashboardService = async () => {
  const response = await new Promise((resolve) => {
    setInterval(() => {
      resolve(mockDashboardData);
    }, 3000);
  });
  return response;
};

export default DashboardService;
