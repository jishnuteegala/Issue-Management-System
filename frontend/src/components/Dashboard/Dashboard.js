import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './Dashboard.css';
import { getCSRFToken } from '../../utils/csrf';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const fetchMetrics = async () => {
    const response = await axios.get('http://localhost:8000/api/analytics/metrics/', {
        withCredentials: true,
        headers: {
            'X-CSRFToken': getCSRFToken()
        }
    });
    return response.data;
};

function Dashboard() {
    const { data: metrics, isLoading, error } = useQuery('dashboardMetrics', fetchMetrics);

    if (isLoading) return <div>Loading dashboard...</div>;
    if (error) return <div>Error loading dashboard: {error.message}</div>;
    if (!metrics) return <div>No data available</div>;

    const categoryData = {
        labels: metrics.issues_by_category?.map(item => item.category) || [],
        datasets: [{
            data: metrics.issues_by_category?.map(item => item.count) || [],
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40'
            ]
        }]
    };

    const statusData = {
        labels: metrics.issues_by_status?.map(item => item.status) || [],
        datasets: [{
            label: 'Issues by Status',
            data: metrics.issues_by_status?.map(item => item.count) || [],
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }]
    };

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>

            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>Total Issues</h3>
                    <p>{metrics.total_issues}</p>
                </div>
                <div className="metric-card">
                    <h3>Open Issues</h3>
                    <p>{metrics.open_issues}</p>
                </div>
                <div className="metric-card">
                    <h3>Closed Issues</h3>
                    <p>{metrics.closed_issues}</p>
                </div>
                <div className="metric-card">
                    <h3>Total Users</h3>
                    <p>{metrics.total_users}</p>
                </div>
                <div className="metric-card">
                    <h3>Recent Issues (7 days)</h3>
                    <p>{metrics.recent_issues}</p>
                </div>
                <div className="metric-card">
                    <h3>Avg. Resolution Time</h3>
                    <p>{Math.round(metrics.avg_resolution_time / 3600)} hours</p>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-container">
                    <h3>Issues by Category</h3>
                    <Pie data={categoryData} />
                </div>
                <div className="chart-container">
                    <h3>Issues by Status</h3>
                    <Bar data={statusData} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
