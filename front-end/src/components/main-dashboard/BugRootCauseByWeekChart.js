import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement, LineElement);

const BugRootCauseByWeekChart = ({ bugDataGroupByWeek }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!bugDataGroupByWeek.datasets || bugDataGroupByWeek.datasets === 0) {
      setChartData([]);
      return;
    }

    setChartData({
      labels: bugDataGroupByWeek.weeks,
      datasets: bugDataGroupByWeek.datasets,
    });
  }, [bugDataGroupByWeek]);

  return (
    <Box>
      <Typography variant="h6">Bug Root Causes Over Time</Typography>
      {chartData && chartData.datasets?.length ? (
        <Line
          data={chartData}
          options={{
            interaction: {
              intersect: false,
              mode: 'index',
            },
            plugins: {
              tooltip: {
                intersect: false,
                mode: 'nearest',
                callbacks: {
                  title: (tooltipItems) => {
                    return `Week: ${tooltipItems[0]?.label || ''}`;
                  },
                  label: (tooltipItem) => {
                    const datasetLabel = tooltipItem.dataset.label || 'Unknown';
                    const value = tooltipItem.formattedValue;
                    return `${datasetLabel}: ${value}`;
                  },
                },
              },
              legend: { position: 'bottom' },
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
                  text: 'Number of Issues',
                },
                beginAtZero: true,
              },
            },
          }}
        />
      ) : (
        <Typography>No Data Available</Typography>
      )}
      <Box mt={2} p={2} sx={{ backgroundColor: '#f9f9f9', borderRadius: 2 }}>
        <Typography variant="body1">
          <strong>Key Insights by AI: Disabled</strong>
        </Typography>
      </Box>
    </Box>
  );
};
export default BugRootCauseByWeekChart;
