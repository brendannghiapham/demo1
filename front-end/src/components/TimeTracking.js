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

const TimeTracking = ({ kpiData }) => {
    if (!kpiData || kpiData.length === 0) {
        return <Typography variant="h6" align="center">No data available to display</Typography>;
    }

    // Sort users to maintain color consistency
    const sortedUsers = [...kpiData].sort((a, b) => a.user.localeCompare(b.user));

    const userNames = sortedUsers.map(user => user.user);

    const estimatedTime = sortedUsers.map(user => {
        const monthlyData = user.monthlyData || {};
        return Object.values(monthlyData).reduce((acc, monthData) => acc + (monthData.totalTimeEstimated || 0), 0);
    });

    const actualTime = sortedUsers.map(user => {
        const monthlyData = user.monthlyData || {};
        return Object.values(monthlyData).reduce((acc, monthData) => acc + (monthData.totalTimeSpent || 0), 0);
    });

    const chartData = {
        labels: userNames,
        datasets: [
            {
                label: 'Total Estimated Time (Hours)',
                data: estimatedTime,
                backgroundColor: predefinedColors[0], // Consistent Blue
                borderWidth: 1,
            },
            {
                label: 'Actual Burned Time (Hours)',
                data: actualTime,
                backgroundColor: predefinedColors[1], // Consistent Red
                borderWidth: 1,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Estimated vs Actual Burned Time Per User' },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Time (Hours)' }
            }
        }
    };

    return (
        <Paper sx={{ p: 2, boxShadow: 3 }}>
            <Typography variant="h6" align="center">Time Tracking Per User</Typography>
            <Box sx={{ width: '100%', minHeight: '300px', height: 'auto' }}>
                <Bar data={chartData} options={chartOptions} />
            </Box>
        </Paper>
    );
};

export default TimeTracking;
