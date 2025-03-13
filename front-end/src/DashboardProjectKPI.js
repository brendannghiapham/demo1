import React, { useEffect, useState } from 'react';
import { Grid, Typography, CircularProgress, Box } from '@mui/material';
import SprintVelocityChart from './components/SprintVelocityChart';
import TimeTrackingChart from './components/TimeTrackingChart';
import DefectDensityChart from './components/DefectDensityChart';
import ReleaseReadinessChart from './components/ReleaseReadinessChart';
import ProjectTrackingChart from './components/ProjectTrackingChart';

import {
  fetchSprintVelocity,
  fetchTimeTrackingData,
  fetchDefectDensityData,
  fetchReleaseReadinessData,
  fetchProjectTrackingData,
} from './services/kpiDataService'; // Import the service

const DashboardProjectKPI = ({ selectedProjects, startDate, endDate }) => {
  const [sprintVelocityData, setSprintVelocityData] = useState(null);
  const [timeTrackingData, setTimeTrackingData] = useState(null);
  const [defectDensityData, setDefectDensityData] = useState(null);
  const [releaseReadinessData, setReleaseReadinessData] = useState(null);
  const [projectTrackingData, setProjectTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    console.log('[DashboardProjectKPI] root fetch data: ', selectedProjects);
    if (!selectedProjects.length > 0) {
      setSprintVelocityData([]);
      setTimeTrackingData([]);
      setDefectDensityData([]);
      setReleaseReadinessData([]);
      setProjectTrackingData([]);
      return;
    }

    try {
      setLoading(true);
      const [sprintData, timeTracking, defectDensity, releaseReadiness, projectTracking] =
        await Promise.all([
          fetchSprintVelocity(selectedProjects),
          fetchTimeTrackingData(selectedProjects),
          fetchDefectDensityData(selectedProjects),
          fetchReleaseReadinessData(selectedProjects),
          fetchProjectTrackingData(selectedProjects),
        ]);

      setSprintVelocityData(sprintData);
      setTimeTrackingData(timeTracking);
      setDefectDensityData(defectDensity);
      setReleaseReadinessData(releaseReadiness);
      setProjectTrackingData(projectTracking);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleSearch = () => fetchData();
    window.addEventListener('dashboardSearch', handleSearch);
    return () => window.removeEventListener('dashboardSearch', handleSearch);
  }, [selectedProjects, startDate, endDate]);

  return (
    <div>
      <Typography variant="h4">Project KPI Dashboard</Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SprintVelocityChart data={sprintVelocityData} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TimeTrackingChart data={timeTrackingData} />
          </Grid>
          <Grid item xs={12} md={6}>
            <DefectDensityChart data={defectDensityData} />
          </Grid>
          <Grid item xs={12} md={6}>
            <ReleaseReadinessChart data={releaseReadinessData} />
          </Grid>
          <Grid item xs={12}>
            <ProjectTrackingChart data={projectTrackingData} />
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default DashboardProjectKPI;
