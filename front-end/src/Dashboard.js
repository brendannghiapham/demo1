import React, { useState, useEffect } from 'react';
import { fetchProjects, fetchKpiData, fetchSprintVelocity, fetchBugData } from './services/services';
import { Typography, CircularProgress, Box, Container, Paper, Grid, TextField } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { format, parse } from 'date-fns';


import ProjectSelector from './components/ProjectSelector';
import TaskCompletion from './components/TaskCompletion';
import BugFixing from './components/BugFixing';
import TimeTracking from './components/TimeTracking';
import SprintVelocity from './components/SprintVelocity';
import BugAnalyticsChart from './components/BugAnalyticsChart';
import BugGroupByDateAndProject from "./components/BugGroupByDateAndProject";

function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [kpiData, setKpiData] = useState([]);
    const [sprintVelocity, setSprintVelocity] = useState([]);
    const [bugData, setBugData] = useState({});
    const [loading, setLoading] = useState(false);

    // Date filters
    const defaultStartDate = parse("2025-01-01", "yyyy-MM-dd", new Date());
    const defaultEndDate = new Date();

    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);

    useEffect(() => {
        fetchProjects().then(setProjects);
    }, []);

    useEffect(() => {
        if (selectedProjects.length > 0) {
            setLoading(true);
            Promise.all([
                fetchKpiData(selectedProjects, startDate, endDate),
                fetchSprintVelocity(selectedProjects, startDate, endDate),
                fetchBugData(selectedProjects, startDate, endDate),
            ])
                .then(([kpiResult, sprintResult, bugResult]) => {
                    setKpiData(kpiResult);
                    setSprintVelocity(sprintResult);
                    setBugData(bugResult);
                })
                .catch(error => console.error("Error fetching data:", error))
                .finally(() => setLoading(false));
        } else {
            setKpiData([]);
            setSprintVelocity([]);
            setBugData({});
        }
    }, [selectedProjects, startDate, endDate]);

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Typography variant="h4" align="center" sx={{ mb: 3 }}>Dashboard</Typography>
            {/* Align Project Selector & Date Pickers in the Same Row */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} md={5}>
                    <ProjectSelector projects={projects} selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} />
                </Grid>
                <Grid item xs={12} md={1}></Grid>
                <Grid item xs={12} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={setEndDate}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </LocalizationProvider>
                </Grid>
            </Grid>
            {/*<ProjectSelector projects={projects} selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} />*/}

            {/*/!* Date Picker Section *!/*/}
            {/*<LocalizationProvider dateAdapter={AdapterDateFns}>*/}
            {/*    <Grid container spacing={2} sx={{ my: 2 }} justifyContent="center">*/}
            {/*        <Grid item>*/}
            {/*            <DatePicker*/}
            {/*                label="Start Date"*/}
            {/*                value={startDate}*/}
            {/*                onChange={setStartDate}*/}
            {/*                renderInput={(params) => <TextField {...params} />}*/}
            {/*            />*/}
            {/*        </Grid>*/}
            {/*        <Grid item>*/}
            {/*            <DatePicker*/}
            {/*                label="End Date"*/}
            {/*                value={endDate}*/}
            {/*                onChange={setEndDate}*/}
            {/*                renderInput={(params) => <TextField {...params} />}*/}
            {/*            />*/}
            {/*        </Grid>*/}
            {/*    </Grid>*/}
            {/*</LocalizationProvider>*/}

            {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                    <CircularProgress size={60} />
                </Box>
            )}

            {!loading && kpiData.length > 0 && (
                <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
                            <TaskCompletion kpiData={kpiData} />
                        </Paper>
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

                    {Object.keys(bugData).map(project => (
                        <Grid key={project} item xs={12}>
                            <Paper sx={{ p: 2, width: '100%', boxShadow: 3 }}>
                                <BugAnalyticsChart bugData={bugData[project]} project={project} />
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {!loading && kpiData.length === 0 && selectedProjects.length > 0 && (
                <Typography variant="h6" align="center" color="textSecondary" sx={{ mt: 3 }}>
                    No data available for the selected projects.
                </Typography>
            )}
        </Container>
    );
}

export default Dashboard;
