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

const MAX_RESULTS = 100;
const STORY_POINTS_FIELD = 'customfield_10028'; // Story Points (custom field)
const SPRINT_FIELD = 'customfield_10020';
const BUG_TYPE_FIELD = 'customfield_10271'; // Bug Type
const ROOT_CAUSE_FIELD = 'customfield_10272'; // Bug Root Cause

const BugRootCauseByWeekChart = ({ issues }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!issues || issues.length === 0) {
      setChartData([]);
      return;
    }
    const floor = Math.floor;
    const rootCauseData = {}; // { rootCause: { week: totalIssues } }
    const weeks = [];
    const allRootCauseKeys = new Set();
    // Process issuesData to group by rootCause and week
    issues.forEach((issue) => {
      // const rootCause = issue.rootCause || 'Unknown'; // Use 'Unknown' if rootCause is missing
      const rootCause = issue.fields[ROOT_CAUSE_FIELD]
        ? issue.fields[ROOT_CAUSE_FIELD].map((item) =>
            item.value.substring(0, 7).trim().toUpperCase().replace(/ /g, '_')
          )
        : ['Unknown'];
      const createdDate = issue.fields.created.split('T')[0]; // Extract YYYY-MM-DD
      if (!rootCause) {
        return;
      }
      if (!createdDate) {
        console.warn(`Issue missing created date, skipping issue: ${issue.id}`);
        return; // Skip the issue if there's no created date
      }

      // const rootCauseArr = rootCause ? rootCause.split(',') : [];
      const rootCauseArr = rootCause;
      let sprintStartDate;
      try {
        sprintStartDate = parseISO(createdDate); // Attempt to parse the date
      } catch (error) {
        console.warn(`Invalid created date for issue: ${issue.id}, skipping issue.`);
        return; // Skip the issue if date parsing fails
      }

      const formattedWeek = format(startOfWeek(sprintStartDate, { weekStartsOn: 1 }), 'yyyy-ww'); // Format to yyyy-ww
      if (!weeks.includes(formattedWeek)) {
        weeks.push(formattedWeek); // Add the week if not already in the list
      }

      // Group data by rootCause for each week
      rootCauseArr.forEach((rootCauseElement) => {
        allRootCauseKeys.add(rootCauseElement);
        if (!rootCauseData[rootCauseElement]) {
          rootCauseData[rootCauseElement] = {};
        }
        if (!rootCauseData[rootCauseElement][formattedWeek]) {
          rootCauseData[rootCauseElement][formattedWeek] = 0;
        }
        rootCauseData[rootCauseElement][formattedWeek] += 1; // Increment the issue count for the rootCause in the week
      });
    });

    console.log('bugrootcause chart before: ', JSON.stringify(rootCauseData));
    // Prepare the chart dataset for root causes
    const datasets = Object.entries(rootCauseData).map(([rootCause, weeklyData], index) => ({
      label: rootCause,
      data: weeks.map((week) => floor(parseFloat(weeklyData[week] || 0))), // Set data for each week
      borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 150, 1)`,
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 150, 0.3)`,
      fill: true,
    }));

    setChartData({
      labels: weeks,
      datasets,
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

export default BugRootCauseByWeekChart;
