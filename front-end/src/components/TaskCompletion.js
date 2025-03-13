import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
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
  'rgba(201, 203, 207, 0.7)', // Grey
];

const TaskCompletion = ({ kpiData }) => {
  if (!kpiData || kpiData.length === 0) {
    return (
      <Typography variant="h6" align="center">
        No data available to display
      </Typography>
    );
  }

  // Extract all unique months
  const allMonths = new Set();
  kpiData.forEach((user) => {
    Object.keys(user.monthlyData || {}).forEach((month) => allMonths.add(month));
  });

  const sortedMonths = [...allMonths].sort();

  // Sort users alphabetically to maintain color consistency
  const sortedUsers = [...kpiData].sort((a, b) => a.user.localeCompare(b.user));

  const datasets = sortedUsers.map((user, index) => ({
    label: user.user,
    data: sortedMonths.map((month) => user.monthlyData?.[month]?.totalTasks || 0),
    backgroundColor: predefinedColors[index % predefinedColors.length], // Cycle through predefined colors
    borderWidth: 1,
  }));

  const chartData = {
    labels: sortedMonths,
    datasets,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows flexible height
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Total Tasks Per Month (Stacked by User)' },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  return (
    <Paper sx={{ p: 2, boxShadow: 3 }}>
      <Typography variant="h6" align="center">
        Total workload of company by user
      </Typography>
      <Box sx={{ width: '100%', minHeight: '300px', height: 'auto' }}>
        <Bar data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

export default TaskCompletion;
