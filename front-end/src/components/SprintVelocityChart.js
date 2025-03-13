import React from 'react';
import { Paper, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const SprintVelocityChart = ({ data }) => {
  // Check if data is available and has the necessary properties
  if (!data || !data.velocity || !data.plannedVsDelivered) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6">Sprint Velocity</Typography>
        <Typography variant="body2" color="textSecondary">
          No data available for Sprint Velocity.
        </Typography>
      </Paper>
    );
  }

  const chartData = [
    { name: 'Velocity', value: data.velocity },
    { name: 'Planned vs Delivered', value: data.plannedVsDelivered },
  ];

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6">Sprint Velocity</Typography>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#2196f3" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default SprintVelocityChart;
