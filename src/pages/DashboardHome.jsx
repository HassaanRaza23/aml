import React from "react";
import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BellIcon, UserPlusIcon, FileBarChartIcon, ShieldAlertIcon } from "lucide-react";

const alertsData = [
  { date: "Jul 27", count: 4 },
  { date: "Jul 28", count: 6 },
  { date: "Jul 29", count: 5 },
  { date: "Jul 30", count: 9 },
  { date: "Jul 31", count: 7 },
  { date: "Aug 1", count: 11 },
  { date: "Aug 2", count: 8 },
];

const riskPieData = [
  { name: "Low", value: 40 },
  { name: "Medium", value: 35 },
  { name: "High", value: 25 },
];

const COLORS = ["#16a34a", "#eab308", "#dc2626"];

const DashboardHome = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xl font-bold">120</div>
            <div className="text-sm text-gray-500">Customers Onboarded</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xl font-bold">78</div>
            <div className="text-sm text-gray-500">Screenings Done</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xl font-bold">12</div>
            <div className="text-sm text-gray-500">Ongoing Cases</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xl font-bold">4</div>
            <div className="text-sm text-gray-500">SAR Reports Filed</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="font-semibold mb-2">Alerts Over Time</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={alertsData}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-semibold mb-2">Customer Risk Levels</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="font-semibold mb-2">Quick Actions</div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <UserPlusIcon size={16} /> Add New Customer
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <ShieldAlertIcon size={16} /> Start Screening
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileBarChartIcon size={16} /> Generate Report
          </Button>
        </div>
      </div>

      {/* Pending Tasks */}
      <div>
        <div className="font-semibold mb-2">Pending Tasks</div>
        <ul className="list-disc list-inside text-sm text-gray-700">
          <li>3 alerts need manual review</li>
          <li>2 customer KYC forms need verification</li>
          <li>1 case pending assignment</li>
        </ul>
      </div>

      {/* High Risk Profiles */}
      <div>
        <div className="font-semibold mb-2">Recent High-Risk Customers</div>
        <ul className="text-sm text-gray-700">
          <li>🔴 John Doe - High Risk (Screened 2 days ago)</li>
          <li>🔴 Ayesha Khan - High Risk (Screened yesterday)</li>
          <li>🔴 Omar Al Zayed - High Risk (Screened today)</li>
        </ul>
      </div>

      {/* Recent Activity Feed */}
      <div>
        <div className="font-semibold mb-2">Recent Activity</div>
        <ul className="text-sm text-gray-700">
          <li>✅ Screening completed for Jane Smith</li>
          <li>📝 KYC updated for Ahmed Al Farsi</li>
          <li>🚩 Alert flagged for suspicious transaction</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardHome;
