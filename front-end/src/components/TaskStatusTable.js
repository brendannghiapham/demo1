import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Typography,
  Box,
  Popover,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TaskStatusTable = ({ issues }) => {
  const [tableData, setTableData] = useState({});
  const [allIssueTypes, setAllIssueTypes] = useState([]);
  const [selectedProject, setSelectedProject] = useState('All');
  const [availableProjects, setAvailableProjects] = useState([]);

  // Popover states
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoverData, setHoverData] = useState(null);

  useEffect(() => {
    if (!issues || issues.length === 0) {
      setTableData({});
      setAllIssueTypes([]);
      setAvailableProjects([]);
      return;
    }

    const data = {};
    const uniqueIssueTypes = new Set();
    const projects = new Set();

    issues.forEach((issue) => {
      const project = issue.fields.project.name;
      const assignee = issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned';
      const issueType = issue.fields.issuetype.name;
      const status = issue.fields.status.name;

      projects.add(project);
      uniqueIssueTypes.add(issueType);

      if (!data[project]) {
        data[project] = {};
      }
      if (!data[project][assignee]) {
        data[project][assignee] = {};
      }
      if (!data[project][assignee][issueType]) {
        data[project][assignee][issueType] = {};
      }
      if (!data[project][assignee][issueType][status]) {
        data[project][assignee][issueType][status] = 0;
      }

      data[project][assignee][issueType][status] += 1;
    });

    setTableData(data);
    setAllIssueTypes([...uniqueIssueTypes]);
    setAvailableProjects(['All', ...Array.from(projects)]);
  }, [issues]);

  const handlePopoverOpen = (event, assignee, issueType, statuses) => {
    event.stopPropagation(); // ✅ Prevents event bubbling issues
    setAnchorEl(event.currentTarget);
    setHoverData({ assignee, issueType, statuses });
  };

  // Handle Popover Close
  const handlePopoverClose = () => {
    setAnchorEl(null);
    setHoverData(null);
  };

  // Light color shades for alternating project sections

  const rowColors = ['#ffffff', '#d6e7ef']; // Light blue shades

  return (
    <Box>
      <Typography variant="h6">Task Status Table</Typography>

      {/* Project Selection Dropdown */}
      <Select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        fullWidth
        size="small"
        sx={{ my: 2 }}
      >
        {availableProjects.map((project) => (
          <MenuItem key={project} value={project}>
            {project}
          </MenuItem>
        ))}
      </Select>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ p: 0 }}>Assignee</TableCell>
              {allIssueTypes.map((issueType) => (
                <TableCell key={issueType}>{issueType}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(tableData)
              .filter(([project]) => selectedProject === 'All' || project === selectedProject)
              .map(([project, assignees], index) => (
                <React.Fragment key={project}>
                  {/* Project Header Row */}
                  <TableRow sx={{ backgroundColor: rowColors[index % 2] }}>
                    <TableCell colSpan={allIssueTypes.length + 1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {project}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  {/* Assignee Rows */}
                  {Object.entries(assignees).map(([assignee, issueTypes]) => (
                    <TableRow
                      key={`${project}-${assignee}`}
                      sx={{
                        backgroundColor: rowColors[index % 2],
                        '&:hover': { backgroundColor: '#9BEEEB' },
                      }}
                    >
                      <TableCell sx={{ p: 0 }}>{assignee}</TableCell>
                      {allIssueTypes.map((issueType) => {
                        const statuses = issueTypes[issueType] || {};
                        const totalTasks = Object.values(statuses).reduce(
                          (acc, count) => acc + count,
                          0
                        );

                        return (
                          <TableCell
                            key={issueType}
                            onMouseEnter={(e) =>
                              handlePopoverOpen(e, assignee, issueType, statuses)
                            }
                            onMouseLeave={handlePopoverClose}
                            sx={{
                              cursor: 'pointer',
                              fontWeight: totalTasks > 0 ? 'bold' : 'normal',
                              p: 0,
                            }}
                          >
                            {totalTasks || 0}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Popover for Bar Chart */}
      {/*<Popover*/}
      {/*  open={Boolean(anchorEl)}*/}
      {/*  anchorEl={anchorEl}*/}
      {/*  onClose={handlePopoverClose}*/}
      {/*  disableEnforceFocus // ✅ Allows focus inside Popover*/}
      {/*  disableAutoFocus // ✅ Prevents Popover from closing immediately*/}
      {/*  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}*/}
      {/*  transformOrigin={{ vertical: 'top', horizontal: 'center' }}*/}
      {/*>*/}
      {/*  <Box sx={{ p: 2, width: 400 }}>*/}
      {/*    {hoverData && (*/}
      {/*      <>*/}
      {/*        <Typography variant="h6">*/}
      {/*          {hoverData.assignee} - {hoverData.issueType}*/}
      {/*        </Typography>*/}
      {/*        <Bar*/}
      {/*          data={{*/}
      {/*            labels: Object.keys(hoverData.statuses),*/}
      {/*            datasets: [*/}
      {/*              {*/}
      {/*                label: hoverData.issueType,*/}
      {/*                data: Object.values(hoverData.statuses),*/}
      {/*                backgroundColor: 'rgba(75, 192, 192, 0.7)',*/}
      {/*              },*/}
      {/*            ],*/}
      {/*          }}*/}
      {/*          options={{*/}
      {/*            responsive: true,*/}
      {/*            plugins: {*/}
      {/*              legend: { display: false },*/}
      {/*              title: { display: true, text: 'Tasks by Status' },*/}
      {/*            },*/}
      {/*            scales: {*/}
      {/*              x: { title: { display: true, text: 'Status' } },*/}
      {/*              y: { title: { display: true, text: 'Count' }, beginAtZero: true },*/}
      {/*            },*/}
      {/*          }}*/}
      {/*        />*/}
      {/*      </>*/}
      {/*    )}*/}
      {/*  </Box>*/}
      {/*</Popover>*/}
    </Box>
  );
};

export default TaskStatusTable;
