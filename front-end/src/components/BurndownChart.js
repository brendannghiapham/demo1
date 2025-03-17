import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { Box, Typography } from '@mui/material';
import { format, startOfWeek, parseISO } from 'date-fns';

ChartJS.register(Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement, LineElement);

const BurndownChart = ({ issues }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!issues || issues.length === 0) {
      setChartData(null);
      return;
    }

    const projectBurndown = {}; // { project: { week: SP } }

    issues.forEach((issue) => {
      if (issue.fields && issue.fields.project && issue.fields.customfield_10028) {
        const project = issue.fields.project.key;
        const storyPoints = issue.fields.customfield_10028 || 0;

        // Get Sprint Info
        const sprintField = issue.fields.customfield_10020;
        if (!sprintField || sprintField.length === 0) return;
        const sprintStartDate = parseISO(sprintField[0].startDate);
        const sprintWeek = format(startOfWeek(sprintStartDate, { weekStartsOn: 1 }), 'yyyy-ww');

        if (!projectBurndown[project]) {
          projectBurndown[project] = {};
        }
        if (!projectBurndown[project][sprintWeek]) {
          projectBurndown[project][sprintWeek] = 0;
        }

        projectBurndown[project][sprintWeek] += storyPoints;
      }
    });

    // Prepare X-axis labels (yyyy-ww format)
    const weeks = [
      ...new Set(Object.values(projectBurndown).flatMap((weekData) => Object.keys(weekData))),
    ].sort();

    // Prepare dataset for Chart.js Stacked Line Chart
    const datasets = Object.entries(projectBurndown).map(([project, weeklySP]) => ({
      label: project,
      data: weeks.map((week) => weeklySP[week] || 0),
      borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 150, 1)`,
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 150, 0.3)`,
      fill: true,
    }));

    setChartData({
      labels: weeks,
      datasets: datasets,
    });
  }, [issues]);

  return (
    <Box>
      <Typography variant="h6">Project Burndown (SP Remaining Per Week)</Typography>
      {chartData ? (
        <Line
          data={chartData}
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  title: (tooltipItems) => tooltipItems[0].label, // Show week label
                },
              },
              legend: {
                position: 'top',
              },
            },
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Sprint Weeks (yyyy-ww)',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Story Points Remaining',
                },
                stacked: true, // ✅ Makes it a stacked Line Chart
                beginAtZero: true,
              },
            },
          }}
        />
      ) : (
        <Typography>No Data Available</Typography>
      )}
    </Box>
  );
};

export default BurndownChart;
