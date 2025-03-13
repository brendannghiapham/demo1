import React from 'react';
import { Paper, Typography } from '@mui/material';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#ff5722', '#ff9800', '#ffc107'];

const DefectDensityChart = ({ data }) => {
  if (!data) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6">Defect Density</Typography>
        <Typography variant="body2" color="textSecondary">
          No data available for Display.
        </Typography>
      </Paper>
    );
  }
  const floor = Math.floor;
  const chartData = [
    { name: 'Defect Density', value: floor(parseFloat(data.defectDensity)) },
    { name: 'Bug Fixing Efficiency', value: floor(parseFloat(data.bugFixingEfficiency)) },
    { name: 'Escaped Defects', value: floor(parseFloat(data.escapedDefects)) },
  ];

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6">Defect Density</Typography>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={chartData} dataKey="value" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default DefectDensityChart;
