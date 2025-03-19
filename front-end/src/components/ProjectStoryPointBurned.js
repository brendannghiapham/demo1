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
import { parseProjectKpi } from '../services/main-dashboard/projectKpi.service';

ChartJS.register(Title, Tooltip, Legend, LinearScale, CategoryScale, BarElement);

const ProjectStoryPointBurned = ({ projectKpiData }) => {
  const [chartData, setChartData] = useState(null);
  const [sprintMapping, setSprintMapping] = useState({});

  useEffect(() => {
    if (!projectKpiData.datasets || projectKpiData.datasets.length === 0) {
      setChartData(null);
      return;
    }
    // const projectKPI = parseProjectKpi(issues);
    setSprintMapping(projectKpiData.sprintMap);
    setChartData({
      labels: projectKpiData.labels,
      datasets: projectKpiData.datasets,
    });
  }, [projectKpiData]);

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
