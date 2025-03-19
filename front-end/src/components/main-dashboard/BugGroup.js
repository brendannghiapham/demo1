// import React, { useEffect, useState } from 'react';
// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   Title,
//   Tooltip,
//   Legend,
//   LinearScale,
//   CategoryScale,
//   PointElement,
//   LineElement,
// } from 'chart.js';
// import { Box, Typography } from '@mui/material';
// import { format, startOfWeek, parseISO } from 'date-fns';
//
// ChartJS.register(Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement, LineElement);
//
// const BurndownChart = ({ bugGroupByProject }) => {
//   const [chartData, setChartData] = useState(null);
//
//   useEffect(() => {
//     console.log('BugAnalyticsChart bugGroupByProject', bugGroupByProject);
//     const listProjects = Object.keys(bugGroupByProject);
//
//     if (!bugGroupByProject || Object.keys(listProjects).length === 0) {
//       return <Typography variant="h6">No Bug Data Available</Typography>;
//     }
//
//     const allWeeks = new Set();
//     const chartData = {};
//
//     // Extract unique root causes for dynamic line chart
//     const bugData = bugGroupByProject[listProjects[0]];
//     let rootCauseKeys = Object.keys(bugData[Object.keys(bugData)[0]].rootCauses || {});
//
//     Object.keys(bugGroupByProject).forEach((project) => {
//       Object.keys(bugGroupByProject[project] || {}).forEach((weekName) => {
//         allWeeks.add(weekName);
//         if (!chartData[weekName]) {
//           chartData[weekName] = {};
//           chartData[weekName].totalBugs = 0;
//           chartData[weekName].bugTypes = {};
//           chartData[weekName].rootCauses = {};
//         }
//       });
//     });
//
//     // const bugData = bugGroupByProject[listProjects[0]];
//
//     Object.keys(bugGroupByProject).forEach((project) => {
//       const bugData = bugGroupByProject[project];
//       Object.keys(bugData || {}).forEach((weekName) => {
//         if (!chartData[weekName]) {
//           chartData[weekName] = {};
//           chartData[weekName].totalBugs = 0;
//           // chartData[weekName].bugTypes = {};
//           chartData[weekName].rootCauses = {};
//         } else {
//           // console.log('Bug hihi', bugData);
//           chartData[weekName].totalBugs += bugData[weekName].totalBugs;
//           // chartData[weekName].bugTypes = {};
//           // chartData[weekName].rootCauses = {};
//           Object.keys(bugData[weekName].rootCauses).forEach((rootCauseKeys) => {
//             if (!chartData[weekName].rootCauses[rootCauseKeys]) {
//               chartData[weekName].rootCauses[rootCauseKeys] = 0;
//             }
//             chartData[weekName].rootCauses[rootCauseKeys] +=
//               bugData[weekName].rootCauses[rootCauseKeys];
//           });
//           // console.log('Bug chartData hihi', chartData);
//         }
//       });
//     });
//
//     const projectBurndown = {}; // { project: { week: SP } }
//
//     // Prepare X-axis labels (yyyy-ww format)
//     const weeks = [
//       ...new Set(Object.values(projectBurndown).flatMap((weekData) => Object.keys(weekData))),
//     ].sort();
//
//     Object.keys(bugGroupByProject).forEach((project) => {
//       const bugData = bugGroupByProject[project];
//       Object.keys(bugData || {}).forEach((weekName) => {
//         Object.keys(bugData[weekName].rootCauses).forEach((rootCauseKeys) => {});
//       });
//     });
//
//     // Prepare dataset for Chart.js Stacked Line Chart
//     const datasets = Object.entries(projectBurndown).map(([project, weeklySP]) => ({
//       label: project,
//       data: weeks.map((week) => weeklySP[week] || 0),
//       borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 150, 1)`,
//       backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 150, 0.3)`,
//       fill: true,
//     }));
//     console.log('Brundown chart data projectBurndown: ', projectBurndown);
//     console.log('Brundown chart data : ', datasets);
//
//     setChartData({
//       labels: weeks,
//       datasets: datasets,
//     });
//   }, [issues]);
//
//   return (
//     <Box>
//       <Typography variant="h6">Project Burndown (SP Remaining Per Week)</Typography>
//       {chartData ? (
//         <Line
//           data={chartData}
//           options={{
//             plugins: {
//               tooltip: {
//                 callbacks: {
//                   title: (tooltipItems) => tooltipItems[0].label, // Show week label
//                 },
//               },
//               legend: {
//                 position: 'top',
//               },
//             },
//             responsive: true,
//             scales: {
//               x: {
//                 title: {
//                   display: true,
//                   text: 'Sprint Weeks (yyyy-ww)',
//                 },
//               },
//               y: {
//                 title: {
//                   display: true,
//                   text: 'Story Points Remaining',
//                 },
//                 stacked: true, // ✅ Makes it a stacked Line Chart
//                 beginAtZero: true,
//               },
//             },
//           }}
//         />
//       ) : (
//         <Typography>No Data Available</Typography>
//       )}
//     </Box>
//   );
// };
// export default BurndownChart;
