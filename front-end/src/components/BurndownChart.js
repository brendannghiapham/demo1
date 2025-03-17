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

ChartJS.register(Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement, LineElement);

const BurndownChart = ({ issues }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!issues || issues.length === 0) {
      setChartData(null);
      return;
    }

    const burndown = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };

    issues.forEach((issue) => {
      const week = `Week ${Math.floor(Math.random() * 4) + 1}`; // Simulating week assignment
      if (burndown[week] !== undefined) {
        burndown[week] += issue.fields.customfield_10028 || 0;
      }
    });

    setChartData({
      labels: Object.keys(burndown),
      datasets: [
        {
          label: 'Remaining Story Points',
          data: Object.values(burndown),
          borderColor: 'red',
          fill: false,
        },
      ],
    });
  }, [issues]);

  return (
    <Box>
      <Typography variant="h6">Burndown Chart</Typography>
      {chartData ? <Line data={chartData} /> : <Typography>No Data Available</Typography>}
    </Box>
  );
};

export default BurndownChart;
