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

const BurndownChart = ({ burnDownByProject }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!burnDownByProject.datasets || burnDownByProject.datasets.length === 0) {
      setChartData(null);
      return;
    }

    setChartData({
      labels: burnDownByProject.weeks,
      datasets: burnDownByProject.datasets,
    });
  }, [burnDownByProject]);

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
