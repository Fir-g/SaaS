import { ChannelType } from "@/types/chart";

// const data = {
//   labels: ["Red", "Blue", "Yellow"],
//   datasets: [
//     {
//       label: "My First Dataset",
//       data: [300, 50, 100],
//       backgroundColor: [
//         "rgb(255, 99, 132)",
//         "rgb(54, 162, 235)",
//         "rgb(255, 205, 86)",
//       ],
//       hoverOffset: 4,
//     },
//   ],
// };

type ChartDataType = {
  labels: string[];
  datasets: [
    {
      label: string;
      data: number[];
      backgroundColor: string[];
      hoverOffset: number;
    }
  ];
};

// type FormatDataPropType = {
//   data: ChannelType[] | DemandTrendType
// };

export const formatData = (data: ChannelType[]) => {
  let chartData: ChartDataType = {
    labels: [],
    datasets: [
      {
        label: "",
        data: [],
        backgroundColor: [
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 205, 86)",
        ],
        hoverOffset: 4,
      },
    ],
  };
  data.map(({ channelName, count }) => {
    chartData["labels"].push(channelName);
    chartData["datasets"][0].data.push(count);
  });
  return chartData;
};
