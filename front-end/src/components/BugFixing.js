import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Paper, Typography, Box } from '@mui/material';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Predefined colors for consistency
const predefinedColors = [
    'rgba(54, 162, 235, 0.7)', // Blue
    'rgba(255, 99, 132, 0.7)', // Red
    'rgba(75, 192, 192, 0.7)', // Green
    'rgba(255, 159, 64, 0.7)', // Orange
    'rgba(153, 102, 255, 0.7)', // Purple
    'rgba(201, 203, 207, 0.7)' // Grey
];

const BugFixing = ({ kpiData }) => {
    if (!kpiData || kpiData.length === 0) {
        return <Typography variant="h6" align="center">No data available to display</Typography>;
    }

    // Sort users alphabetically for color consistency
    const sortedUsers = [...kpiData].sort((a, b) => a.user.localeCompare(b.user));

    // Extract user names
    const userNames = sortedUsers.map(user => user.user);

    // Calculate Bug Fixing Efficiency per user
    const bugFixingEfficiency = sortedUsers.map(user => {
        const monthlyData = user.monthlyData || {};
        const totalBugs = Object.values(monthlyData).reduce((acc, monthData) => acc + (monthData.totalBugs || 0), 0);
        const totalTasks = Object.values(monthlyData).reduce((acc, monthData) => acc + (monthData.totalTasks || 0), 0);
        return totalTasks === 0 ? 0 : (totalBugs / totalTasks) * 100;
    });

    // Chart Data
    const chartData = {
        labels: userNames,
        datasets: [
            {
                label: 'Bug Fixing Efficiency (%)',
                data: bugFixingEfficiency,
                backgroundColor: userNames.map((_, index) => predefinedColors[index % predefinedColors.length]),
                borderWidth: 1,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Bug Fixing Efficiency Per User' },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { callback: value => `${value}%` }
            }
        }
    };

    return (
        <Paper sx={{ p: 2, boxShadow: 3 }}>
            <Typography variant="h6" align="center">Bug Fixing Efficiency</Typography>
            <Box sx={{ width: '100%', minHeight: '300px', height: 'auto' }}>
                <Bar data={chartData} options={chartOptions} />
            </Box>
        </Paper>
    );
};

export default BugFixing;
