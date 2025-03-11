import React from 'react';
import { Paper, Typography, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, compareAsc } from 'date-fns';


// Register Chart.js components
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Predefined colors for consistency
const predefinedColors = [
    'rgba(54, 162, 235, 0.7)', // Blue
    'rgba(255, 99, 132, 0.7)', // Red
    'rgba(75, 192, 192, 0.7)', // Green
    'rgba(255, 159, 64, 0.7)', // Orange
    'rgba(153, 102, 255, 0.7)', // Purple
    'rgba(201, 203, 207, 0.7)' // Grey
];

const BugGroupByDateAndProject = ({ bugData }) => {
    if (!bugData || Object.keys(bugData).length === 0) {
        return <Typography variant="h6">No Bug Data Available</Typography>;
    }

    // Extract all unique months
    const allMonths = new Set();
    Object.keys(bugData).forEach(project => {
        // Object.keys(bugData[project] || {}).forEach(month => allMonths.add(format(parseISO(month), "MMM-yyyy"))); // Extracts "Jan", "Feb", etc.));
        Object.keys(bugData[project] || {}).forEach(month => allMonths.add(month)); // Extracts "Jan", "Feb", etc.));
    });

    const sortedMonths = [...allMonths].sort();

    // Extract all unique projects
    const allProjects = Object.keys(bugData);

    // Convert bug data into chart-friendly format
    const chartData = sortedMonths.map(month => {
        const monthData = { month };
        allProjects.forEach(project => {
            monthData[project] = bugData[project]?.[month]?.totalBugs || 0;
        });
        return monthData;
    });

    // Generate colors dynamically for projects
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6384', '#36A2EB', '#FFCE56'];

    return (
        <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" align="center">Total Bugs Per Project (Stacked by Month)</Typography>

            <Grid container justifyContent="center" sx={{ mt: 3 }}>
                <Grid item xs={12}>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {allProjects.map((project, index) => (
                                <Bar key={project} dataKey={project} stackId="a" fill={COLORS[index % COLORS.length]} name={project} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default BugGroupByDateAndProject;
