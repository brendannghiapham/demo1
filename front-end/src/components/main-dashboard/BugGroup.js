import React from 'react';
import { Paper, Typography, Grid } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
/**
 * Renders bug analytics for a project.
 * @param {Object} bugData - Bug statistics categorized by type and root cause.
 * @param {string} project - Project name.
 */
const BugGroupByDateAndProjectLine = ({ bugData }) => {
  if (!bugData || Object.keys(bugData).length === 0) {
    return <Typography variant="h6">No Bug Data Available</Typography>;
  }
  console.log('BugGroupByDateAndProjectLine data', bugData);
  const allMonths = new Set();
  Object.keys(bugData).forEach((project) => {
    Object.keys(bugData[project] || {}).forEach((month) => allMonths.add(month));
  });

  // const sortedMonths = [...allMonths].sort();

  // Convert bug data into chart format
  const chartData = Object.keys(bugData).map((month) => ({
    month,
    totalBugs: bugData[month].totalBugs,
    ...bugData[month].bugTypes,
    ...bugData[month].rootCauses,
  }));

  // const allProjects = Object.keys(bugData);
  // Convert bug data into chart-friendly format
  // const stackChartData = sortedMonths.map((month) => {
  //   const monthData = { month };
  //   allProjects.forEach((project) => {
  //     monthData[project] = bugData[project]?.[month]?.totalBugs || 0;
  //   });
  //   return monthData;
  // });

  // Generate colors dynamically for projects
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#AF19FF',
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
  ];

  // Extract unique root causes for dynamic line chart
  const rootCauseKeys = Object.keys(bugData[Object.keys(bugData)[0]].rootCauses || {});

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6">Bug Analysis</Typography>
      {/* Line Chart for Root Causes Over Time */}
      <Grid item xs={12} md={3}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {rootCauseKeys.map((rootCause, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={rootCause}
                stroke={`hsl(${index * 50}, 70%, 50%)`}
                name={rootCause}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Grid>
    </Paper>
  );
};

export default BugGroupByDateAndProjectLine;
