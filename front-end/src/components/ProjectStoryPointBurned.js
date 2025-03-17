import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LinearScale,
  CategoryScale,
  BarElement,
} from 'chart.js';
import { format, startOfWeek, parseISO } from 'date-fns';
import { Box, Typography } from '@mui/material';

ChartJS.register(Title, Tooltip, Legend, LinearScale, CategoryScale, BarElement);

const ProjectStoryPointBurned = ({ issues }) => {
  const [chartData, setChartData] = useState(null);
  const [sprintMapping, setSprintMapping] = useState({});

  useEffect(() => {
    if (!issues || issues.length === 0) {
      setChartData(null);
      return;
    }

    const projectKPI = {}; // { project: { week: SP } }
    const sprintMap = {}; // { yyyy-ww: Sprint Name }

    issues.forEach((issue) => {
      if (issue.fields && issue.fields.project && issue.fields.customfield_10028) {
        const project = issue.fields.project.key;
        const storyPoints = issue.fields.customfield_10028 || 0;

        // Get Sprint Info
        const sprintField = issue.fields.customfield_10020;
        if (!sprintField || sprintField.length === 0) return;
        const sprintName = sprintField[0].name;
        const sprintStartDate = parseISO(sprintField[0].startDate);
        const sprintWeek = format(startOfWeek(sprintStartDate, { weekStartsOn: 1 }), 'yyyy-ww');

        // Map yyyy-ww to Sprint Name
        sprintMap[sprintWeek] = sprintName;

        if (!projectKPI[project]) {
          projectKPI[project] = {};
        }
        if (!projectKPI[project][sprintWeek]) {
          projectKPI[project][sprintWeek] = 0;
        }

        projectKPI[project][sprintWeek] += storyPoints;
      }
    });

    setSprintMapping(sprintMap);

    // Prepare X-axis labels (yyyy-ww format)
    const weeks = [
      ...new Set(Object.values(projectKPI).flatMap((weekData) => Object.keys(weekData))),
    ].sort();

    // Prepare dataset for Chart.js
    const datasets = Object.entries(projectKPI).map(([project, weeklySP]) => ({
      label: project,
      data: weeks.map((week) => weeklySP[week] || 0), // Use yyyy-ww format for X-axis
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 150, 0.6)`,
    }));

    setChartData({
      labels: weeks,
      datasets: datasets,
    });
  }, [issues]);

  return (
    <Box>
      <Typography variant="h6">Project KPI Velocity (SP Delivered / 35h) Per Week</Typography>
      {chartData ? (
        <Bar
          data={chartData}
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  title: (tooltipItems) => {
                    const weekKey = tooltipItems[0].label;
                    return sprintMapping[weekKey] || weekKey; // Show Sprint Name on hover
                  },
                },
              },
              legend: {
                position: 'top',
              },
            },
            responsive: true,
            scales: {
              x: {
                stacked: true,
                title: {
                  display: true,
                  text: 'Sprint Weeks (yyyy-ww)',
                },
              },
              y: {
                stacked: true,
                title: {
                  display: true,
                  text: 'Story Points Delivered',
                },
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

export default ProjectStoryPointBurned;
