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

const ProjectTrackingChart = ({ data }) => {
  // if (!data || !data.epicCompletionRate || !data.onTimeDelivery || !data.riskRegister) {
  if (!data) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6">Project Tracking</Typography>
        <Typography variant="body2" color="textSecondary">
          No data available for Display.
        </Typography>
      </Paper>
    );
  }
  const floor = Math.floor;
  const chartData = [
    { name: 'Epic Completion Rate', value: floor(parseFloat(data.epicCompletionRate)) },
    { name: 'On-Time Delivery', value: floor(parseFloat(data.onTimeDelivery)) },
    { name: 'Risk Register', value: floor(parseFloat(data.riskRegister)) },
    { name: 'stakeholderEngagement', value: floor(parseFloat(data.stakeholderEngagement)) },
  ];
  console.log('[ProjectTrackingChart], data: ', data);

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6">Project Tracking</Typography>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#ff9800" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ProjectTrackingChart;
