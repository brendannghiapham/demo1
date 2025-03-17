import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config'; // API URL from .env
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { fetchAllIssues } from '../utils/api.utils';

const TaskStatusTable = () => {
  const [tableData, setTableData] = useState({});
  const [allIssueTypes, setAllIssueTypes] = useState([]);

  useEffect(() => {
    fetchAllIssues(['PMAX'], new Date('2024-04-01')).then((issues) => {
      // const issues = response.data.issues || [];
      const data = {};
      const uniqueIssueTypes = new Set();

      issues.forEach((issue) => {
        const assignee = issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned';
        const issueType = issue.fields.issuetype.name; // Group by Issue Type

        uniqueIssueTypes.add(issueType);

        if (!data[assignee]) {
          data[assignee] = {};
        }

        if (!data[assignee][issueType]) {
          data[assignee][issueType] = 0;
        }

        data[assignee][issueType] += 1;
      });

      setTableData(data);
      setAllIssueTypes([...uniqueIssueTypes]); // Convert Set to Array for ordered headers
    });
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Assignee</TableCell>
            {/* Ensure there is at least one entry before mapping */}
            {allIssueTypes.length > 0 &&
              allIssueTypes.map((issueType) => <TableCell key={issueType}>{issueType}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Ensure there is at least one entry before mapping */}
          {Object.keys(tableData).length > 0 &&
            Object.entries(tableData).map(([assignee, issueTypes]) => (
              <TableRow key={assignee}>
                <TableCell>{assignee}</TableCell>
                {allIssueTypes.map((issueType) => (
                  <TableCell key={issueType}>{issueTypes[issueType] || 0}</TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskStatusTable;
