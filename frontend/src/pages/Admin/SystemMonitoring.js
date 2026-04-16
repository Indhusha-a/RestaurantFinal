import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { Activity, TrendingUp, Cpu, Database } from "lucide-react";
import "../../styles/admin.css";

export default function SystemMonitoring() {
  const [activity, setActivity] = useState(null);
  const [growthTrends, setGrowthTrends] = useState([]);
  const [topsisMetrics, setTopsisMetrics] = useState(null);
  const [cfMetrics, setCfMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMetrics();
  }, []);

  const topsisAccuracyChart = useMemo(() => ([
    { label: "Rank #1", value: Number(topsisMetrics?.rank1SuccessRate || 0) },
    { label: "Top 3", value: Number(topsisMetrics?.top3ContainmentRate || 0) },
    { label: "Confirmed Visits", value: Number(topsisMetrics?.confirmedVisitRate || 0) }
  ]), [topsisMetrics]);

  const topsisOutcomeDistribution = useMemo(() => {
    const distribution = topsisMetrics?.outcomeDistribution || {};
    return Object.entries(distribution).map(([label, count]) => ({
      label,
      count: Number(count || 0)
    }));
  }, [topsisMetrics]);

  const cfPerformanceChart = useMemo(() => ([
    { label: "Engagement", value: Number(cfMetrics?.engagementRate || 0) },
    { label: "Coverage", value: Number(cfMetrics?.ratingPredictionAccuracy || 0) },
    { label: "Observed Rating", value: Number(cfMetrics?.averageObservedRating || 0) * 20 }
  ]), [cfMetrics]);

  const cfInteractionMix = useMemo(() => {
    const interactions = Number(cfMetrics?.interactionCount || 0);
    const ratingsEstimate = Math.round((Number(cfMetrics?.ratingPredictionAccuracy || 0) / 100) * interactions);
    const engagementEstimate = Math.round((Number(cfMetrics?.engagementRate || 0) / 100) * interactions);
    const residual = Math.max(0, interactions - ratingsEstimate - engagementEstimate);

    return [
      { name: "Rated Visits", value: ratingsEstimate, color: "#f97316" },
      { name: "Engaged Users", value: engagementEstimate, color: "#ec4899" },
      { name: "Other Interactions", value: residual, color: "#14b8a6" }
    ].filter((item) => item.value > 0);
  }, [cfMetrics]);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [actRes, growthRes, topsisRes, cfRes] = await Promise.all([
        axios.get("http://localhost:8080/api/admin/analytics/activity", config),
        axios.get("http://localhost:8080/api/admin/analytics/growth-trends", config),
        axios.get("http://localhost:8080/api/admin/analytics/topsis-metrics", config),
        axios.get("http://localhost:8080/api/admin/analytics/cf-metrics", config)
      ]);

      setActivity(actRes.data);
      setGrowthTrends(growthRes.data);
      setTopsisMetrics(topsisRes.data);
      setCfMetrics(cfRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="spinner"></div> {/* Use your existing spinner CSS */}
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px', color: 'red' }}>{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page-container">
        
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">System Monitoring</h1>
            <p className="admin-subtitle">Real-time health and usage analytics</p>
          </div>
          <button className="secondary-button" onClick={fetchMetrics}>
            <Activity size={16} /> Refresh
          </button>
        </div>

        {/* Real-time KPI Cards */}
        <div className="admin-grid" style={{ marginBottom: '32px' }}>
          <div className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Total App Users</span>
              <UsersIcon />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '12px' }}>
              {activity?.totalRegisteredUsers || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> +{(activity?.totalRegisteredUsers || 0) * 0.1} this month
            </div>
          </div>

          <div className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Active Users</span>
              <Cpu size={20} color="#ec4899" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '12px' }}>
              {activity?.currentlyActiveUsers || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
              Currently logged in / active accounts
            </div>
          </div>

          <div className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Registered Restaurants</span>
              <Database size={20} color="#14b8a6" />
            </div>
             <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '12px' }}>
              {activity?.totalRegisteredRestaurants || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
              Total venues in the system
            </div>
          </div>

          <div className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Group Sessions</span>
              <Activity size={20} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '12px' }}>
              {activity?.activeGroupSessions || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
              {activity?.completedGroupSessions || 0} completed sessions recorded
            </div>
          </div>
        </div>

        <div className="admin-grid group-layout">
          {/* Growth Trends Chart */}
          <div className="admin-card" style={{ gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px' }}>Restaurant Onboarding Trends</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend />
                  <Line type="monotone" name="Restaurants Added" dataKey="restaurants" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Algorithm Metrics */}
        <div style={{ marginTop: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>AI Algorithm Metrics</h2>
        </div>

        <div className="admin-grid mb-6">
          <div className="admin-card">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>Group Decision AI (TOPSIS)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>Rank #1 Selection Rate</span>
                <span style={{ fontWeight: 'bold' }}>{topsisMetrics?.rank1SuccessRate || 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>Top 3 Selection Rate</span>
                <span style={{ fontWeight: 'bold' }}>{topsisMetrics?.top3ContainmentRate || 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>Visit Confirmation Rate</span>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{topsisMetrics?.confirmedVisitRate || 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>Satisfaction Trend</span>
                <span style={{ fontWeight: 'bold', color: '#0ea5e9' }}>{topsisMetrics?.groupSatisfactionTrend || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="admin-card">
             <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>Explore Feed AI (CF)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>User Engagement Rate</span>
                <span style={{ fontWeight: 'bold' }}>{cfMetrics?.engagementRate || 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>Observed Rating Coverage</span>
                <span style={{ fontWeight: 'bold' }}>{cfMetrics?.ratingPredictionAccuracy || 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>Total Model Interactions</span>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{cfMetrics?.interactionCount || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>Model Improvement</span>
                <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>{cfMetrics?.improvementTrend || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>Metric Source</span>
                <span style={{ fontWeight: 'bold', color: '#f97316' }}>{cfMetrics?.metricMode || 'observed'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-grid mb-6">
          <div className="admin-card">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>TOPSIS Accuracy Overview</h3>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topsisAccuracyChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Rate']} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>TOPSIS Outcome Distribution</h3>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topsisOutcomeDistribution.length ? topsisOutcomeDistribution : [{ label: 'No Data', count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip formatter={(value) => [value, 'Sessions']} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="admin-grid mb-6">
          <div className="admin-card">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>CF Effectiveness Snapshot</h3>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cfPerformanceChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip formatter={(value, name, item) => {
                    if (item?.payload?.label === 'Observed Rating') {
                      return [`${(Number(value) / 20).toFixed(1)} / 5`, 'Average Rating'];
                    }
                    return [`${value}%`, 'Rate'];
                  }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>CF Interaction Mix</h3>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cfInteractionMix.length ? cfInteractionMix : [{ name: 'No Data', value: 1, color: '#CBD5E1' }]}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    innerRadius={55}
                    paddingAngle={4}
                  >
                    {(cfInteractionMix.length ? cfInteractionMix : [{ color: '#CBD5E1' }]).map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Interactions']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}
