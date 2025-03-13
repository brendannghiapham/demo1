import React from 'react';
import { Paper, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const TimeTrackingChart = ({ data }) => {
  if (!data || !data.leadTime || !data.cycleTime) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6">Lead & Cycle Time</Typography>
        <Typography variant="body2" color="textSecondary">
          No data available for Display.
        </Typography>
      </Paper>
    );
  }

  const chartData = [
    { name: 'Lead Time', value: data.leadTime },
    { name: 'Cycle Time', value: data.cycleTime },
  ];

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6">Lead & Cycle Time</Typography>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#4caf50" />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default TimeTrackingChart;
