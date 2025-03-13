import React from 'react';
import Select from 'react-select';
import { Button, Box } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const ProjectSelector = ({
  projects = [],
  selectedProjects,
  setSelectedProjects,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onSearch,
}) => {
  const handleProjectChange = (selectedOptions) => {
    setSelectedProjects(selectedOptions ? selectedOptions.map((opt) => opt.value) : []);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
        {/* Project Dropdown */}
        <Select
          options={projects.map((project) => ({ value: project.key, label: project.name }))}
          onChange={handleProjectChange}
          value={projects
            .filter((proj) => selectedProjects.includes(proj.key))
            .map((proj) => ({ value: proj.key, label: proj.name }))}
          isMulti
          isClearable
          placeholder="Select Projects..."
          styles={{ container: (base) => ({ ...base, minWidth: '250px' }) }}
        />

        {/* Start Date Picker */}
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(newDate) => setStartDate(newDate)}
          format="yyyy-MM-dd"
          renderInput={(params) => <input {...params} />}
        />

        {/* End Date Picker */}
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(newDate) => setEndDate(newDate)}
          format="yyyy-MM-dd"
          renderInput={(params) => <input {...params} />}
        />

        {/* Search Button */}
        <Button variant="contained" color="primary" onClick={onSearch}>
          Search
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default ProjectSelector;
