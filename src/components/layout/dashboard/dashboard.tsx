import {
  faArrowRight,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Doughnut, Line } from "react-chartjs-2";
import DemandCard from "./demand-card";
import { data, mockDashboardData } from "@/constants/dashboard-data";
import { formatData } from "@/utils/chart/formatData";
import NewDashboard from "./new-dashboard";

const Dashboard = () => {
  // const [isDashboardData, setIsDashboardData] = useState(false);
  const isDashboardData = true
  return (
    <div className="flex flex-col h-full w-full py-6 px-12 mb-48">
      <h3 className="text-xl font-semibold py-6">Demand aggregator hub</h3>
      {!isDashboardData ? (
        <NewDashboard />
      ) : (
        <div>
          <div className="flex flex-row justify-between">
            <h3 className="text-md font-semibold">Latest published demands</h3>
            <button>
              View all
              <FontAwesomeIcon
                size="sm"
                icon={faChevronRight}
                className="px-2 text-gray-400"
              />
            </button>
          </div>
          <div className="flex flex-row gap-4">
            {new Array(5).fill(0).map((_, ind) => (
              <DemandCard key={ind} />
            ))}
          </div>
          <div className="">
            <h3 className="text-md font-semibold my-4">Unpublished load</h3>
            <div className="w-full h-48 bg-gray-100 rounded-md mb-4"></div>
          </div>
          <div className="pt-4">
            <div className="flex flex-row justify-between mb-4">
              <h3 className="text-md font-semibold">Aggregator analytics</h3>
              <button className="border px-4 py-2 rounded-md">
                Last 30 days
              </button>
            </div>
            <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className=" border p-2 rounded-md">
                <h3 className="text-sm font-semibold pb-4">
                  Channel wise aggregation split
                </h3>
                <div className="flex flex-row justify-around">
                  <div className="h-48 w-48 p-4">
                    <Doughnut
                      //   height={100}
                      //   width={100}
                      options={{
                        cutout: 60,
                        // maintainAspectRatio: false,
                        layout: {
                          //   padding: 30,
                        },
                        plugins: {
                          legend: {
                            display: false,
                            // position: "right",
                            // reverse: false,
                            // labels: {
                            //   boxWidth: 10,
                            //   usePointStyle: true,
                            //   pointStyle: "circle",
                            // },
                          },
                        },
                      }}
                      data={formatData(mockDashboardData["Channel split"])}
                    />
                  </div>
                  <div className="w-1/2 pt-4 text-sm flex flex-col">
                    {mockDashboardData["Channel split"].map(
                      ({ channelName, count }) => (
                        <div
                          key={channelName}
                          className="flex justify-between w-full font-semibold pb-2"
                        >
                          <p>{channelName}</p>
                          <p>{count}</p>
                        </div>
                      )
                    )}
                    <div className="font-semibold mt-auto flex w-full justify-between border-t-2 py-4">
                      <p>Total: </p>
                      <p>
                        {mockDashboardData["Channel split"].reduce(
                          (acc, cur) => {
                            return (acc += cur.count);
                          },
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between h-full  rounded-md gap-4 box-border">
                <div className="h-full w-full border rounded-md p-6">
                  <h3 className="text-sm font-semibold pb-2">Demand sourced</h3>
                  <p className="text-3xl font-semibold py-6">
                    {mockDashboardData["demand sourced"].toLocaleString()}
                  </p>
                </div>
                <div className="w-full h-full border p-6 rounded-md">
                  <h3 className="text-sm font-semibold pb-2">
                    Demand published
                  </h3>
                  <p className="text-3xl font-semibold py-6">
                    {mockDashboardData["demand published"].toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="h-full border p-6 rounded-md">
                <h3 className="text-sm font-semibold pb-4">
                  Top routes with incoming demands
                </h3>
                <div>
                  <div className="flex justify-between font-semibold border-b-2 pb-2 mb-2">
                    <p>Route</p>
                    <p>Total Demand placed</p>
                  </div>

                  <div>
                    {mockDashboardData["top routes"].map(
                      ({ route, demand }, index) => (
                        <div key={index} className="flex justify-between pb-2">
                          <span>
                            {route[0]}{" "}
                            <FontAwesomeIcon icon={faArrowRight} size="sm" />{" "}
                            {route[1]}
                          </span>
                          <p>{demand}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="h-full border p-6 rounded-md">
                <h3 className="text-sm font-semibold pb-2">Demand trend</h3>
                <div className="flex justify-end gap-2">
                  <button className="border p-2 rounded-md">All Routes</button>
                  <button className="border p-2 rounded-md">
                    All Customer
                  </button>
                </div>
                <Line
                  data={data}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                        position: "top" as const,
                      },
                      title: {
                        display: true,
                        text: "Chart.js Line Chart",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
