import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box, Grid } from '@mui/material';
import { format, parseISO, compareAsc } from 'date-fns';

/**
 * Renders separate line charts for each project, showing sprint velocity trends.
 * @param {Array} sprintData - Sprint velocity data grouped by project.
 */
const SprintVelocity = ({ sprintData }) => {
    if (!sprintData || sprintData.length === 0) {
        return <Typography variant="h6" align="center">No sprint velocity data available</Typography>;
    }

    // Group sprints by project
    const projectGroups = {};
    sprintData.forEach(sprint => {
        if (!projectGroups[sprint.project]) {
            projectGroups[sprint.project] = [];
        }
        projectGroups[sprint.project].push({
            sprint: `${sprint.name} (${sprint.startDate})`,
            totalEstimatedStoryPoints: sprint.totalEstimatedStoryPoints,
            completedStoryPoints: sprint.completedStoryPoints
        });
    });

    // Generate colors dynamically
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6384'];

    // Extract months from sprint start dates and group completedStoryPoints by project
    const groupedData = {};
    const allProjects = new Set();

    sprintData.forEach(sprint => {
        const month = format(parseISO(sprint.startDate), "yyyy-MM"); // Extracts "Jan", "Feb", etc.
        if (!groupedData[month]) {
            groupedData[month] = {};
        }
        if (!groupedData[month][sprint.project]) {
            groupedData[month][sprint.project] = 0;
        }

        groupedData[month][sprint.project] += sprint.completedStoryPoints;
        allProjects.add(sprint.project);
    });

    // Convert grouped data to chart-friendly format
    const chartData = Object.keys(groupedData)
        .sort((a, b) => compareAsc(parseISO(`${a}-01`), parseISO(`${b}-01`))) // Fix chronological sorting
        .map(month => {
            const entry = {month};
            allProjects.forEach(project => {
                entry[project] = groupedData[month][project] || 0; // Default to 0 if no data
            });
            return entry;
        });

    // Generate unique colors for each project
    const COLORS2 = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6384', '#36A2EB'];


    return (
        <Grid container spacing={3}>
            {Object.entries(projectGroups).map(([project, sprints], index) => (
                <Grid item xs={12} md={6} key={project}> {/* 2 charts per row */}
                    <Paper sx={{ p: 2, boxShadow: 3, height: 450 }}>
                        <Typography variant="h6" align="center">{project} - Sprint Velocity</Typography>
                        <Box sx={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sprints}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="sprint" angle={-15} interval={0} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="totalEstimatedStoryPoints"
                                        stroke={COLORS[index % COLORS.length]}
                                        name="Estimated Story Points"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="completedStoryPoints"
                                        stroke={COLORS[(index + 2) % COLORS.length]}
                                        strokeDasharray="5 5"
                                        name="Completed Story Points"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            ))}
            <Grid item xs={12}>
                <Paper sx={{ p: 2, boxShadow: 3 }}>
                    <Typography variant="h6" align="center">Total Completed Story Points by Month (Grouped by Project)</Typography>
                    <Box sx={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {Array.from(allProjects).map((project, index) => (
                                    <Bar key={project} dataKey={project} stackId="a" fill={COLORS[index % COLORS.length]} name={project} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default SprintVelocity;
