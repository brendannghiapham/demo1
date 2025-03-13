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

const ReleaseReadinessChart = ({ data }) => {
  // if (!data || !data.burnDownRemaining || !data.confidenceScore || !data.goNoGo) {
  if (!data) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6">Release Readiness</Typography>
        <Typography variant="body2" color="textSecondary">
          No data available for Display.
        </Typography>
      </Paper>
    );
  }
  const floor = Math.floor;
  const chartData = [
    { name: 'Remaining Tasks', value: floor(parseFloat(data.burnDownRemaining)) },
    { name: 'Confidence Score', value: floor(parseFloat(data.confidenceScore)) },
    { name: 'Go/No-Go', value: floor(parseFloat(data.goNoGo ? 100 : 0)) },
  ];

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6">Release Readiness</Typography>
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

export default ReleaseReadinessChart;
