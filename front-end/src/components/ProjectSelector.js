import React from 'react';
import Select from 'react-select';

const ProjectSelector = ({ projects, selectedProjects, setSelectedProjects }) => (
    <div style={{ marginBottom: "20px" }}>
        <label>Select Projects: </label>
        <Select
            options={projects.map(project => ({ value: project.key, label: project.name }))}
            onChange={setSelectedProjects}
            value={selectedProjects}
            isMulti
            isClearable
        />
    </div>
);

export default ProjectSelector;
