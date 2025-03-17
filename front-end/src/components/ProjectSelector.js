import React from 'react';
import { Box, Button, MenuItem, Select, Typography, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const ProjectSelector = ({
  projects,
  selectedProjects,
  setSelectedProjects,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onSearch,
}) => {
  const handleProjectChange = (event) => {
    setSelectedProjects(event.target.value);
  };

  // Sort projects: Move selected projects to the top
  const sortedProjects = [...projects].sort((a, b) => {
    const isSelectedA = selectedProjects.includes(a.key);
    const isSelectedB = selectedProjects.includes(b.key);
    return isSelectedB - isSelectedA; // Move selected projects to the top
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'auto',
        p: 2,
        width: '100%',
        maxHeight: '80vh',
      }}
    >
      <Typography variant="h6">Filter Criteria</Typography>

      {/* Project Dropdown */}
      <Select
        multiple
        value={selectedProjects}
        onChange={handleProjectChange}
        fullWidth
        size="small"
        sx={{ backgroundColor: 'white' }}
      >
        {sortedProjects.map((project) => (
          <MenuItem
            key={project.key}
            value={project.key}
            sx={{
              fontWeight: selectedProjects.includes(project.key) ? 'bold' : 'normal', // Highlight selected projects
            }}
          >
            {project.name}
          </MenuItem>
        ))}
      </Select>

      {/* Start Date Picker */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          renderInput={(params) => <TextField {...params} fullWidth size="small" />}
        />
      </LocalizationProvider>

      {/* End Date Picker */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          renderInput={(params) => <TextField {...params} fullWidth size="small" />}
        />
      </LocalizationProvider>

      {/* Search Button */}
      <Button variant="contained" color="primary" fullWidth onClick={onSearch}>
        Search
      </Button>
    </Box>
  );
};

export default ProjectSelector;
