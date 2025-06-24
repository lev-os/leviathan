// Quick Analytics Dashboard with Tremor
import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  Grid,
  Metric,
  AreaChart,
  DonutChart,
  BarList,
  BadgeDelta,
  Flex,
  ProgressBar,
  Col,
} from "@tremor/react";

const salesData = [
  { date: "Jan 23", Sales: 2890, Profit: 2338 },
  { date: "Feb 23", Sales: 2756, Profit: 2103 },
  { date: "Mar 23", Sales: 3322, Profit: 2194 },
  { date: "Apr 23", Sales: 3470, Profit: 2108 },
  { date: "May 23", Sales: 3475, Profit: 1812 },
  { date: "Jun 23", Sales: 3129, Profit: 1726 },
];

const cities = [
  { name: "New York", sales: 9800 },
  { name: "London", sales: 4567 },
  { name: "Hong Kong", sales: 3908 },
  { name: "San Francisco", sales: 2400 },
  { name: "Singapore", sales: 1908 },
];

const browsers = [
  { name: "Chrome", value: 72.1 },
  { name: "Safari", value: 16.3 },
  { name: "Firefox", value: 8.2 },
  { name: "Edge", value: 3.4 },
];

export default function Dashboard() {
  return (
    <main className="p-6 sm:p-10">
      <Title>Analytics Dashboard</Title>
      <Text>Your business metrics at a glance</Text>

      {/* KPI Cards */}
      <Grid numItemsSm={2} numItemsLg={4} className="gap-6 mt-6">
        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Sales</Text>
              <Metric>$ 23,456</Metric>
            </div>
            <BadgeDelta deltaType="moderateIncrease">12.3%</BadgeDelta>
          </Flex>
        </Card>
        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Profit</Text>
              <Metric>$ 13,123</Metric>
            </div>
            <BadgeDelta deltaType="moderateIncrease">16.1%</BadgeDelta>
          </Flex>
        </Card>
        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Customers</Text>
              <Metric>1,234</Metric>
            </div>
            <BadgeDelta deltaType="moderateDecrease">3.2%</BadgeDelta>
          </Flex>
        </Card>
        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Active Users</Text>
              <Metric>856</Metric>
            </div>
            <BadgeDelta deltaType="unchanged">0.0%</BadgeDelta>
          </Flex>
        </Card>
      </Grid>

      {/* Charts */}
      <div className="mt-6">
        <TabGroup>
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Detail</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
                <Col numColSpanMd={2}>
                  <Card>
                    <Title>Sales Performance</Title>
                    <AreaChart
                      className="h-72 mt-4"
                      data={salesData}
                      index="date"
                      categories={["Sales", "Profit"]}
                      colors={["indigo", "cyan"]}
                    />
                  </Card>
                </Col>
                <Card>
                  <Title>Browser Usage</Title>
                  <DonutChart
                    className="mt-6"
                    data={browsers}
                    category="value"
                    index="name"
                    colors={["slate", "violet", "indigo", "rose"]}
                  />
                </Card>
              </Grid>
              
              <div className="mt-6">
                <Card>
                  <Title>Sales by City</Title>
                  <Flex className="mt-6">
                    <Text>City</Text>
                    <Text>Sales</Text>
                  </Flex>
                  <BarList data={cities} className="mt-2" />
                </Card>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="mt-6">
                <Card>
                  <Title>Detailed Metrics</Title>
                  <Text>More detailed view coming soon...</Text>
                </Card>
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </main>
  );
}