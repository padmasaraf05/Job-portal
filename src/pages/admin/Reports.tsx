import { motion } from "framer-motion";
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  Briefcase,
  Eye,
  MousePointer,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const monthlyData = [
  { month: "Jan", users: 1200, jobs: 340, applications: 2800, revenue: 12400 },
  { month: "Feb", users: 1450, jobs: 420, applications: 3200, revenue: 15600 },
  { month: "Mar", users: 1680, jobs: 380, applications: 4100, revenue: 18200 },
  { month: "Apr", users: 2100, jobs: 520, applications: 4800, revenue: 22100 },
  { month: "May", users: 2450, jobs: 610, applications: 5600, revenue: 26800 },
  { month: "Jun", users: 2890, jobs: 680, applications: 6400, revenue: 31200 },
  { month: "Jul", users: 3200, jobs: 750, applications: 7200, revenue: 35600 },
  { month: "Aug", users: 3680, jobs: 820, applications: 8100, revenue: 41200 },
  { month: "Sep", users: 4100, jobs: 890, applications: 9200, revenue: 48600 },
  { month: "Oct", users: 4580, jobs: 960, applications: 10400, revenue: 52400 },
  { month: "Nov", users: 5200, jobs: 1050, applications: 11800, revenue: 58900 },
  { month: "Dec", users: 5890, jobs: 1180, applications: 13500, revenue: 65200 },
];

const trafficSources = [
  { name: "Organic Search", value: 42, color: "hsl(217, 91%, 50%)" },
  { name: "Direct", value: 28, color: "hsl(174, 72%, 40%)" },
  { name: "Social Media", value: 18, color: "hsl(142, 76%, 36%)" },
  { name: "Referral", value: 12, color: "hsl(38, 92%, 50%)" },
];

const deviceData = [
  { name: "Desktop", users: 58 },
  { name: "Mobile", users: 35 },
  { name: "Tablet", users: 7 },
];

const topCompanies = [
  { name: "Tech Solutions Inc", jobs: 45, applications: 892 },
  { name: "Global Innovations", jobs: 38, applications: 756 },
  { name: "StartupHub Co", jobs: 32, applications: 624 },
  { name: "Cloud Systems LLC", jobs: 28, applications: 542 },
  { name: "Analytics Pro", jobs: 24, applications: 468 },
];

const kpis = [
  {
    title: "Avg. Session Duration",
    value: "4m 32s",
    change: "+12%",
    icon: Eye,
  },
  {
    title: "Bounce Rate",
    value: "34.2%",
    change: "-8%",
    icon: MousePointer,
  },
  {
    title: "Conversion Rate",
    value: "5.8%",
    change: "+23%",
    icon: TrendingUp,
  },
  {
    title: "User Retention",
    value: "68.4%",
    change: "+4%",
    icon: Users,
  },
];

const Reports = () => {
  return (
    <AdminLayout title="Reports" subtitle="Analytics and insights">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Select defaultValue="year">
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="stat-card">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold font-display">{kpi.value}</p>
                    <p
                      className={`text-sm font-medium ${
                        kpi.change.startsWith("+")
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {kpi.change} vs last period
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <kpi.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue & Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Revenue & Growth Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) =>
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(value)
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(217, 91%, 50%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Platform Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    name="New Users"
                    stroke="hsl(217, 91%, 50%)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="jobs"
                    name="Jobs Posted"
                    stroke="hsl(174, 72%, 40%)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    name="Applications"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-display">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {trafficSources.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Device Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Device Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deviceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `${value}%`}
                  />
                  <Bar
                    dataKey="users"
                    fill="hsl(217, 91%, 50%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Top Employers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCompanies.map((company, index) => (
                  <div key={company.name} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-display font-bold text-sm text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {company.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {company.jobs} jobs • {company.applications} applications
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(company.applications / 892) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
