import React, { useEffect, useState } from 'react';
import {
  fetchBugData,
  fetchProjectKPI,
  fetchSprintVelocity2,
  groupProjectMetrics,
} from './services/services';
import {
  Typography,
  CircularProgress,
  Box,
  Container,
  Paper,
  Grid,
  TextField,
} from '@mui/material';
import TaskCompletion from './components/TaskCompletion';
import BugFixing from './components/main-dashboard/BugFixing';
import TimeTracking from './components/TimeTracking';
import SprintVelocity from './components/main-dashboard/SprintVelocity';
import BugAnalyticsChart from './components/main-dashboard/BugAnalyticsChart';
import BugGroupByDateAndProject from './components/main-dashboard/BugGroupByDateAndProject';
import { fetchAllIssues } from './utils/api.utils';
import BurndownChart from './components/BurndownChart';
import TaskStatusTable from './components/TaskStatusTable';
import KPIChart from './components/KPIChart';

function Dashboard({ selectedProjects, startDate, endDate }) {
  // ✅ Use props from App.js
  const [kpiData, setKpiData] = useState([]);
  const [sprintVelocity, setSprintVelocity] = useState([]);
  const [bugData, setBugData] = useState({});
  const [loading, setLoading] = useState(false);
  const [allIssues, setAllIssues] = useState([]);

  const fetchData = async () => {
    if (!selectedProjects.length > 0) {
      setKpiData([]);
      setSprintVelocity([]);
      setBugData({});
      setAllIssues([]);
    }
    setLoading(true);
    const allIssues = await fetchAllIssues(selectedProjects, startDate, endDate);
    setAllIssues(allIssues);

    Promise.all([
      fetchProjectKPI(allIssues),
      fetchSprintVelocity2(allIssues),
      fetchBugData(allIssues),
      groupProjectMetrics(allIssues),
    ])
      .then(([kpiResult, sprintResult, bugResult, groupProjectMetrics]) => {
        setKpiData(kpiResult);
        setSprintVelocity(sprintResult);
        setBugData(bugResult);
      })
      .catch((error) => console.error('Error fetching data:', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handleSearch = () => fetchData();
    window.addEventListener('dashboardSearch', handleSearch);
    return () => window.removeEventListener('dashboardSearch', handleSearch);
  }, [selectedProjects, startDate, endDate]);

  return (
    <Container maxWidth={false} sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
      {/*<Container maxWidth="xl" sx={{ mt: 4 }}>*/}
      <Typography variant="h4" align="center" sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress size={60} />
        </Box>
      ) : kpiData.length > 0 ? (
        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          <Typography variant="h5">Burndown Chart</Typography>
          <BurndownChart issues={allIssues} />

          {<KPIChart issues={allIssues} />}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
              <TaskCompletion kpiData={kpiData} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <TaskStatusTable issues={allIssues} />
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
              <BugFixing kpiData={kpiData} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
              <TimeTracking kpiData={kpiData} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
              <SprintVelocity sprintData={sprintVelocity} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
              <BugGroupByDateAndProject bugData={bugData} />
            </Paper>
          </Grid>

          {Object.keys(bugData).map((project) => (
            <Grid key={project} item xs={12}>
              <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
                <BugAnalyticsChart bugData={bugData[project]} project={project} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="h6" align="center" color="textSecondary" sx={{ mt: 3 }}>
          No data available for the selected projects.
        </Typography>
      )}
    </Container>
  );
}

export default Dashboard;
