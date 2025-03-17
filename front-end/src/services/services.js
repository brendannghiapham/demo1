const MAX_RESULTS = 100;
const STORY_POINTS_FIELD = 'customfield_10028'; // Story Points (custom field)
const SPRINT_FIELD = 'customfield_10020';
const BUG_TYPE_FIELD = 'customfield_10271'; // Bug Type
const ROOT_CAUSE_FIELD = 'customfield_10272'; // Bug Root Cause

export const fetchProjectKPI = async (allIssues) => {
  try {
    const userMetrics = {};
    allIssues.forEach((issue) => {
      const user = issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned';
      const issueType = issue.fields.issuetype.name;
      const timeSpent = issue.fields.timespent || 0;
      const timeEstimated = issue.fields.timeoriginalestimate || 0;
      const storyPoints = issue.fields[STORY_POINTS_FIELD] || 0;
      const projectKey = issue.fields.project.key;

      // Extract the month from the created date (YYYY-MM)
      const createdDate = issue.fields.created.split('T')[0]; // Get the date without the time part
      const month = createdDate.slice(0, 7); // Format to YYYY-MM

      // Initialize user metrics if not already initialized
      if (!userMetrics[user]) {
        userMetrics[user] = { user, monthlyData: {} };
      }

      if (!userMetrics[user].monthlyData[month]) {
        userMetrics[user].monthlyData[month] = {
          totalTasks: 0,
          totalBugs: 0,
          totalTimeSpent: 0,
          totalTimeEstimated: 0,
          totalEstimatedStoryPoint: 0,
          taskTypes: {}, // Track issue types (Bug, User Story, etc.)
        };
      }

      // Track monthly contributions (total tasks, total bugs, time spent, etc.)
      userMetrics[user].monthlyData[month].totalTasks++;
      userMetrics[user].monthlyData[month].totalTimeSpent += timeSpent / 3600;
      userMetrics[user].monthlyData[month].totalTimeEstimated += timeEstimated / 3600;
      userMetrics[user].monthlyData[month].totalEstimatedStoryPoint += storyPoints;

      if (issueType === 'Bug') userMetrics[user].monthlyData[month].totalBugs++;

      // Track the count of each issue type
      if (!userMetrics[user].monthlyData[month].taskTypes[issueType]) {
        userMetrics[user].monthlyData[month].taskTypes[issueType] = 0;
      }
      userMetrics[user].monthlyData[month].taskTypes[issueType]++;
    });
    return Object.values(userMetrics).map((user) => ({
      user: user.user,
      monthlyData: user.monthlyData,
    }));
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    return [];
  }
};

export const fetchSprintVelocity2 = async (allIssues) => {
  try {
    const sprintData = {};
    allIssues.forEach((issue) => {
      const projectName = issue.fields.project.name; // Project Name
      const sprints = issue.fields[SPRINT_FIELD] || []; // Sprints (can be an array)
      const storyPoints = issue.fields[STORY_POINTS_FIELD] || 0;
      const isCompleted = issue.fields.status.name.toLowerCase() === 'done';

      // Handle single sprint or array of sprints
      (Array.isArray(sprints) ? sprints : [sprints]).forEach((sprint) => {
        if (!sprint || !sprint.id) return; // Ignore if sprint data is missing

        const sprintKey = `${projectName} - ${sprint.name}`;

        // Initialize sprint entry if not exists
        if (!sprintData[sprintKey]) {
          sprintData[sprintKey] = {
            id: sprint.id,
            name: sprint.name,
            startDate: sprint.startDate ? sprint.startDate.split('T')[0] : 'N/A',
            endDate: sprint.endDate ? sprint.endDate.split('T')[0] : 'N/A',
            project: projectName,
            totalEstimatedStoryPoints: 0,
            completedStoryPoints: 0,
          };
        }

        // Add story points to sprint
        sprintData[sprintKey].totalEstimatedStoryPoints += storyPoints;
        if (isCompleted) {
          sprintData[sprintKey].completedStoryPoints += storyPoints;
        }
      });
    });
    const result = Object.values(sprintData).sort((a, b) => a.startDate.localeCompare(b.startDate));
    console.log('[service] Sprint velocity data: ', result);
    return result;
  } catch (error) {
    console.error('Error fetching Sprint Velocity:', error);
    return [];
  }
};

/**
 * Fetch Bug Analytics data
 */
export const fetchBugData = async (allIssues) => {
  try {
    const bugData = {};
    allIssues.forEach((issue) => {
      const createdDate = issue.fields.created.split('T')[0]; // Extract YYYY-MM-DD
      const month = createdDate.slice(0, 7); // Extract YYYY-MM for monthly grouping
      const projectKey = issue.fields.project ? issue.fields.project.key : 'Unknown';

      // Extract values from array of objects
      const extractedBugTypes = issue.fields[BUG_TYPE_FIELD]
        ? issue.fields[BUG_TYPE_FIELD].map((item) => item.value)
        : ['Unknown'];
      const extractedRootCauses = issue.fields[ROOT_CAUSE_FIELD]
        ? issue.fields[ROOT_CAUSE_FIELD].map((item) => item.value)
        : ['Unknown'];

      if (!bugData[projectKey]) {
        bugData[projectKey] = {};
      }

      if (!bugData[projectKey][month]) {
        bugData[projectKey][month] = { totalBugs: 0, bugTypes: {}, rootCauses: {} };
      }

      // Count total bugs
      bugData[projectKey][month].totalBugs += 1;

      // Count by bug type
      extractedBugTypes.forEach((bugType) => {
        if (!bugData[projectKey][month].bugTypes[bugType]) {
          bugData[projectKey][month].bugTypes[bugType] = 0;
        }
        bugData[projectKey][month].bugTypes[bugType] += 1;
      });

      // Count by root cause
      extractedRootCauses.forEach((rootCause) => {
        if (!bugData[projectKey][month].rootCauses[rootCause]) {
          bugData[projectKey][month].rootCauses[rootCause] = 0;
        }
        bugData[projectKey][month].rootCauses[rootCause] += 1;
      });
    });

    // const result = Object.values(sprintData).sort((a, b) => a.startDate.localeCompare(b.startDate));
    console.log('[service] bugData: ', bugData);
    return bugData;
  } catch (error) {
    return [];
  }
};

/**
 * Fetch all projects
 */
export const fetchProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const groupProjectMetrics = async (allIssues) => {
  const groupedMetrics = {};
  allIssues.forEach((issue) => {
    const projectName = issue.fields.project.key; // Using project KEY instead of name
    const status = issue.fields.status.name;
    const storyPoints = issue.fields.customfield_10028 || 0;

    if (!groupedMetrics[projectName]) {
      groupedMetrics[projectName] = { totalSP: 0, statusSP: {} };
    }
    // Track total SP
    groupedMetrics[projectName].totalSP += storyPoints;

    // Track SP per status
    if (!groupedMetrics[projectName].statusSP[status]) {
      groupedMetrics[projectName].statusSP[status] = 0;
    }

    groupedMetrics[projectName].statusSP[status] += storyPoints;
  });

  return groupedMetrics;
};
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

import axios from 'axios';
