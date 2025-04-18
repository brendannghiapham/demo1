import React, { useEffect, useState } from 'react';
import {
  groupBugsByProject,
  fetchProjectKPIGroupByMonth,
  fetchSprintVelocity2,
  fetchProjectKPIGroupByWeek,
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
import ProjectStoryPointBurned from './components/ProjectStoryPointBurned';
import ProjectKPI from './components/ProjectKPI';
import BugGroupByDateAndProjectLine from './components/main-dashboard/BugGroup';
import BugRootCauseByWeekChart from './components/main-dashboard/BugRootCauseByWeekChart';
import { parseBugRootCauseByWeek } from './services/main-dashboard/BugRootCauseByWeek.service';
import { parseBurndownDataGroupByProject } from './services/main-dashboard/burndown.service';
import { parseProjectKpi } from './services/main-dashboard/projectKpi.service';

function Dashboard({ selectedProjects, startDate, endDate }) {
  // ✅ Use props from App.js
  const [kpiDataByMonth, setKpiDataByMonth] = useState([]);
  const [kpiDataByWeek, setKpiDataByWeek] = useState([]);
  const [sprintVelocity, setSprintVelocity] = useState([]);
  const [bugDataGroupByProject, setBugDataGroupByProject] = useState({});
  const [bugDataGroupByWeek, setBugDataGroupByWeek] = useState({});
  const [burnDownByProject, setBurnDownByProject] = useState({});
  const [projectKpiData, setProjectKpiData] = useState({});

  const [loading, setLoading] = useState(false);
  const [allIssues, setAllIssues] = useState([]);

  const fetchData = async () => {
    if (!selectedProjects.length > 0) {
      setKpiDataByMonth([]);
      setKpiDataByWeek([]);
      setSprintVelocity([]);
      setBugDataGroupByProject({});
      setAllIssues([]);
      setBugDataGroupByWeek([]);
      setBurnDownByProject([]);
      setProjectKpiData([]);
    }
    setLoading(true);
    const allIssues = await fetchAllIssues(selectedProjects, startDate, endDate);
    setAllIssues(allIssues);

    Promise.all([
      fetchProjectKPIGroupByMonth(allIssues),
      fetchSprintVelocity2(allIssues),
      groupBugsByProject(allIssues),
      fetchProjectKPIGroupByWeek(allIssues),
      parseBugRootCauseByWeek(allIssues),
      parseBurndownDataGroupByProject(allIssues),
      parseProjectKpi(allIssues),
    ])
      .then(
        ([
          kpiResultByMonth,
          sprintResult,
          bugResult,
          kpiResultByWeek,
          bugByWeek,
          burnDownByProject,
          projectKpiData,
        ]) => {
          setKpiDataByMonth(kpiResultByMonth);
          setSprintVelocity(sprintResult);
          setBugDataGroupByProject(bugResult);
          setKpiDataByWeek(kpiResultByWeek);
          setBugDataGroupByWeek(bugByWeek);
          setBurnDownByProject(burnDownByProject);
          setProjectKpiData(projectKpiData);
        }
      )
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
      ) : kpiDataByMonth.length > 0 ? (
        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {/*<Typography variant="h5">Burndown Chart</Typography>*/}
          <BurndownChart burnDownByProject={burnDownByProject} />

          {<ProjectStoryPointBurned projectKpiData={projectKpiData} />}

          {/*{<ProjectKPI issues={allIssues} />}*/}
          <Grid item xs={12} md={12}>
            <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
              <BugRootCauseByWeekChart bugDataGroupByWeek={bugDataGroupByWeek} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
              <TaskCompletion kpiData={kpiDataByWeek} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
              <BugFixing kpiData={kpiDataByMonth} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
              <TimeTracking kpiData={kpiDataByMonth} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
              <SprintVelocity sprintData={sprintVelocity} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
              <BugGroupByDateAndProject bugData={bugDataGroupByProject} />
            </Paper>
          </Grid>
          {/*<Grid item xs={12}>*/}
          {/*  <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>*/}
          {/*</Paper>*/}
          {/*</Grid>*/}

          {Object.keys(bugDataGroupByProject).map((project) => (
            <Grid key={project} item xs={12}>
              <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
                <BugAnalyticsChart bugData={bugDataGroupByProject[project]} project={project} />
              </Paper>
            </Grid>
          ))}
          <Grid item xs={12}>
            <TaskStatusTable issues={allIssues} />
          </Grid>
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
