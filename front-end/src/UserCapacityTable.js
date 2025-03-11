// UserCapacityTable.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Typography, Avatar, LinearProgress } from '@mui/material';

const UserCapacityTable = () => {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dynamic widths for each column (customizable)
    const columnWidths = {
        assignee: "200px",
        issuesCount: "150px",
        remainingDays: "150px",
        projects: "250px",
        bug: "150px",
        story: "150px",
        task: "150px"
    };

    // Adjustable height for the Linear Progress bar
    const progressBarHeight = 12; // Default height, you can change it dynamically

    // Fetch user data from API on component mount
    useEffect(() => {
        axios
            .get(process.env.REACT_APP_API_URL)  // URL from .env
            .then((response) => {
                setUserData(response.data.users);  // Assume response follows the format: { users: [...] }
                setLoading(false);
            })
            .catch((err) => {
                setError('Error fetching data');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    // Function to calculate the remaining time percentage (for the progress bar in Column 3)
    const calculateRemainingPercentage = (remainingDays, estimatedTime) => {
        const totalEstimatedDays = estimatedTime / 3600 / 8;  // Convert seconds to days (assuming 8-hour workday)
        return Math.min((remainingDays / totalEstimatedDays) * 100, 100); // Ensure percentage doesn't exceed 100%
    };

    // Function to set the color based on the remaining time percentage
    const getProgressBarColor = (percentage) => {
        if (percentage <= 50) return 'error';  // Red
        if (percentage <= 75) return 'warning';  // Yellow
        return 'success';  // Green
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: columnWidths.assignee }}>Assignee</TableCell>
                        <TableCell sx={{ width: columnWidths.issuesCount }}>Issues Count</TableCell>
                        <TableCell sx={{ width: columnWidths.remainingDays }}>Remaining Days</TableCell>
                        <TableCell sx={{ width: columnWidths.projects }}>Projects</TableCell>
                        <TableCell sx={{ width: columnWidths.bug }}>Bug</TableCell>
                        <TableCell sx={{ width: columnWidths.story }}>Story</TableCell>
                        <TableCell sx={{ width: columnWidths.task }}>Task</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {userData.map((user) => (
                        <TableRow key={user.assignee}>
                            <TableCell sx={{ width: columnWidths.assignee }}>
                                <Box display="flex" alignItems="center">
                                    <Avatar src={user.assigneeAvatar} alt={user.assignee} />
                                    <Typography variant="body2" sx={{ marginLeft: 1 }}>{user.assignee}</Typography>
                                </Box>
                            </TableCell>
                            <TableCell sx={{ width: columnWidths.issuesCount }}>
                                <Box display="flex" flexDirection="column" alignItems="center">
                                    <Typography variant="body2">{user.issues_count}</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={user.done_issues_percentage}
                                        color={getProgressBarColor(user.done_issues_percentage)}
                                        sx={{ width: '100%', height: progressBarHeight, marginTop: 1 }}
                                    />
                                    <Typography variant="body2">{user.done_issues_percentage.toFixed(2)}% Done</Typography>
                                </Box>
                            </TableCell>

                            {/* Column 3: Remaining Days with Linear Progress Bar */}
                            <TableCell sx={{ width: columnWidths.remainingDays }}>
                                <Box display="flex" flexDirection="column" alignItems="center">
                                    <LinearProgress
                                        variant="determinate"
                                        value={calculateRemainingPercentage(user.remaining_days, user.total_estimated_time)}
                                        color={getProgressBarColor(calculateRemainingPercentage(user.remaining_days, user.total_estimated_time))}
                                        sx={{ width: '100%', height: progressBarHeight, marginTop: 1 }}
                                    />
                                    <Typography variant="body2">{user.remaining_days.toFixed(2)} days</Typography>
                                </Box>
                            </TableCell>

                            <TableCell sx={{ width: columnWidths.projects }}>{user.projects.join(', ')}</TableCell>

                            {/* Bug Issue Type */}
                            <TableCell sx={{ width: columnWidths.bug }}>
                                {user.issue_types.some(type => type.issue_type === 'Bug') && (
                                    <>
                                        {user.issue_types
                                            .filter(type => type.issue_type === 'Bug')
                                            .map((type) => (
                                                <Box key={type.issue_type} display="flex" flexDirection="column" alignItems="center">
                                                    <Avatar src={type.avatar} alt={type.issue_type} />
                                                    <Typography variant="body2">{type.issue_count} issues</Typography>
                                                    <Typography variant="body2">{type.total_remaining_time.toFixed(2)} days</Typography>
                                                </Box>
                                            ))}
                                    </>
                                )}
                            </TableCell>

                            {/* Story Issue Type */}
                            <TableCell sx={{ width: columnWidths.story }}>
                                {user.issue_types.some(type => type.issue_type === 'Story') && (
                                    <>
                                        {user.issue_types
                                            .filter(type => type.issue_type === 'Story')
                                            .map((type) => (
                                                <Box key={type.issue_type} display="flex" flexDirection="column" alignItems="center">
                                                    <Avatar src={type.avatar} alt={type.issue_type} />
                                                    <Typography variant="body2">{type.issue_count} issues</Typography>
                                                    <Typography variant="body2">{type.total_remaining_time.toFixed(2)} days</Typography>
                                                </Box>
                                            ))}
                                    </>
                                )}
                            </TableCell>

                            {/* Task Issue Type */}
                            <TableCell sx={{ width: columnWidths.task }}>
                                {user.issue_types.some(type => type.issue_type === 'Task') && (
                                    <>
                                        {user.issue_types
                                            .filter(type => type.issue_type === 'Task')
                                            .map((type) => (
                                                <Box key={type.issue_type} display="flex" flexDirection="column" alignItems="center">
                                                    <Avatar src={type.avatar} alt={type.issue_type} />
                                                    <Typography variant="body2">{type.issue_count} issues</Typography>
                                                    <Typography variant="body2">{type.total_remaining_time.toFixed(2)} days</Typography>
                                                </Box>
                                            ))}
                                    </>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UserCapacityTable;
