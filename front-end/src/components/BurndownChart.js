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
import axios from 'axios';
import config from '../config'; // API URL from .env
import { fetchAllIssues } from '../utils/api.utils';

ChartJS.register(Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement, LineElement);

const BurndownChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchAllIssues(['PMAX']).then((issues) => {
      // const issues = response.data.issues || [];
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
    });
  }, []);

  return chartData ? <Line data={chartData} /> : <p>Loading...</p>;
};

export default BurndownChart;
