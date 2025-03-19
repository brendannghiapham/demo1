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
const BugGroupByDateAndProjectLine = ({ bugGroupByProject }) => {
  console.log('BugAnalyticsChart bugGroupByProject', bugGroupByProject);
  const listProjects = Object.keys(bugGroupByProject);

  if (!bugGroupByProject || Object.keys(listProjects).length === 0) {
    return <Typography variant="h6">No Bug Data Available</Typography>;
  }

  const allWeeks = new Set();
  const chartData = {};

  // Extract unique root causes for dynamic line chart
  const bugData = bugGroupByProject[listProjects[0]];
  let rootCauseKeys = Object.keys(bugData[Object.keys(bugData)[0]].rootCauses || {});

  Object.keys(bugGroupByProject).forEach((project) => {
    Object.keys(bugGroupByProject[project] || {}).forEach((weekName) => {
      allWeeks.add(weekName);
      if (!chartData[weekName]) {
        chartData[weekName] = {};
        chartData[weekName].totalBugs = 0;
        chartData[weekName].bugTypes = {};
        chartData[weekName].rootCauses = {};
      }
    });
  });

  // const bugData = bugGroupByProject[listProjects[0]];

  Object.keys(bugGroupByProject).forEach((project) => {
    const bugData = bugGroupByProject[project];
    Object.keys(bugData || {}).forEach((weekName) => {
      if (!chartData[weekName]) {
        chartData[weekName] = {};
        chartData[weekName].totalBugs = 0;
        // chartData[weekName].bugTypes = {};
        chartData[weekName].rootCauses = {};
      } else {
        // console.log('Bug hihi', bugData);
        chartData[weekName].totalBugs += bugData[weekName].totalBugs;
        // chartData[weekName].bugTypes = {};
        // chartData[weekName].rootCauses = {};
        Object.keys(bugData[weekName].rootCauses).forEach((rootCauseKeys) => {
          if (!chartData[weekName].rootCauses[rootCauseKeys]) {
            chartData[weekName].rootCauses[rootCauseKeys] = 0;
          }
          chartData[weekName].rootCauses[rootCauseKeys] +=
            bugData[weekName].rootCauses[rootCauseKeys];
        });
        // console.log('Bug chartData hihi', chartData);
      }
    });
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

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6">Bug Analysis</Typography>

      {/* First row: Bar Chart for Total Bugs and Bug Types, and Line Chart for Root Causes */}
      <Grid container spacing={3}>
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
      </Grid>
    </Paper>
  );
};

export default BugGroupByDateAndProjectLine;
