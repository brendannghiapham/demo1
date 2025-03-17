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
import axios from 'axios';
import config from '../config'; // API URL from .env
import { fetchAllIssues } from '../utils/api.utils';
import { format, startOfWeek, parseISO } from 'date-fns';

ChartJS.register(Title, Tooltip, Legend, LinearScale, CategoryScale, BarElement);

const KPIChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchAllIssues(['PMAX'])
      .then((issues) => {
        // const issues = response.data.issues || [];
        // const issues = response.data || [];
        const capacityPerWeek = 35; // Each user has 35h per week

        const projectKPI = {}; // { project: { week: SP } }

        issues.forEach((issue) => {
          if (issue.fields && issue.fields.project && issue.fields.customfield_10028) {
            const project = issue.fields.project.name;
            const storyPoints = issue.fields.customfield_10028 || 0;

            // Get Sprint Name
            const sprintField = issue.fields.customfield_10020; // Sprint data from API
            if (!sprintField || sprintField.length === 0) return; // Skip if no sprint assigned
            const sprint = sprintField[0].name; // Use first sprint name

            if (!projectKPI[project]) {
              projectKPI[project] = {};
            }
            if (!projectKPI[project][sprint]) {
              projectKPI[project][sprint] = 0;
            }

            projectKPI[project][sprint] += storyPoints;
          }
        });

        // Convert data to Chart.js format
        const sprints = [
          ...new Set(Object.values(projectKPI).flatMap((sprintData) => Object.keys(sprintData))),
        ];
        const datasets = Object.entries(projectKPI).map(([project, sprintSP]) => ({
          label: project,
          data: sprints.map((sprint) => sprintSP[sprint] || 0), // Normalize KPI
          backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 150, 0.6)`,
        }));

        setChartData({
          labels: sprints,
          datasets: datasets,
        });
        console.log('Project KPI data: ', projectKPI);
      })
      .catch((error) => {
        console.error('Error fetching KPI data:', error);
      });
  }, []);

  return (
    <div>
      <h3>Project KPI Velocity (SP Delivered / 35h) Per Week</h3>
      {chartData ? <Bar data={chartData} /> : <p>Loading...</p>}
    </div>
  );
};

export default KPIChart;
