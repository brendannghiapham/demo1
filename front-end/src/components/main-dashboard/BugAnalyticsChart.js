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
const BugAnalyticsChart = ({ bugData, project }) => {
  if (!bugData || Object.keys(bugData).length === 0) {
    return <Typography variant="h6">No Bug Data Available</Typography>;
  }
  // Extract all unique months
  const allMonths = new Set();
  Object.keys(bugData).forEach((project) => {
    Object.keys(bugData[project] || {}).forEach((month) => allMonths.add(month));
  });

  const sortedMonths = [...allMonths].sort();

  // Convert bug data into chart format
  const chartData = Object.keys(bugData).map((month) => ({
    month,
    totalBugs: bugData[month].totalBugs,
    ...bugData[month].bugTypes,
    ...bugData[month].rootCauses,
  }));

  const allProjects = Object.keys(bugData);
  // Convert bug data into chart-friendly format
  const stackChartData = sortedMonths.map((month) => {
    const monthData = { month };
    allProjects.forEach((project) => {
      monthData[project] = bugData[project]?.[month]?.totalBugs || 0;
    });
    return monthData;
  });

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
      <Typography variant="h6">Bug Analysis - {project}</Typography>

      {/* First row: Bar Chart for Total Bugs and Bug Types, and Line Chart for Root Causes */}
      <Grid container spacing={3}>
        {/* Bar Chart for Total Bugs and Bug Types */}
        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalBugs" fill="#f44336" name="Total Bugs" />
              {Object.keys(bugData[Object.keys(bugData)[0]].bugTypes).map((bugType, index) => (
                <Bar key={index} dataKey={bugType} fill="#ff9800" name={bugType} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* Line Chart for Root Causes Over Time */}
        <Grid item xs={12} md={6}>
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
      </Grid>
      {/*/!* Stack bar Chart for Root Causes Over Time *!/*/}
      {/*<Grid container justifyContent="center" sx={{ mt: 3 }}>*/}
      {/*    <Grid item xs={12}>*/}
      {/*        <ResponsiveContainer width="100%" height={400}>*/}
      {/*            <BarChart data={stackChartData}>*/}
      {/*                <CartesianGrid strokeDasharray="3 3" />*/}
      {/*                <XAxis dataKey="month" />*/}
      {/*                <YAxis />*/}
      {/*                <Tooltip />*/}
      {/*                <Legend />*/}
      {/*                {allProjects.map((project, index) => (*/}
      {/*                    <Bar key={project} dataKey={project} stackId="a" fill={COLORS[index % COLORS.length]} name={project} />*/}
      {/*                ))}*/}
      {/*            </BarChart>*/}
      {/*        </ResponsiveContainer>*/}
      {/*    </Grid>*/}
      {/*</Grid>*/}
    </Paper>
  );
};

export default BugAnalyticsChart;
