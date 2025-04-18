import { format, startOfWeek } from 'date-fns';

const MAX_RESULTS = 100;
const STORY_POINTS_FIELD = 'customfield_10028'; // Story Points (custom field)
const SPRINT_FIELD = 'customfield_10020';
const BUG_TYPE_FIELD = 'customfield_10271'; // Bug Type
const ROOT_CAUSE_FIELD = 'customfield_10272'; // Bug Root Cause

export const fetchProjectKPIGroupByWeek = async (allIssues) => {
  try {
    const userMetrics = {};

    allIssues.forEach((issue) => {
      const user = issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned';
      const issueType = issue.fields.issuetype.name;
      const timeSpent = issue.fields.timespent || 0;
      const timeEstimated = issue.fields.timeoriginalestimate || 0;
      const storyPoints = issue.fields[STORY_POINTS_FIELD] || 0;
      const projectKey = issue.fields.project.key;
      const isCompleted = issue.fields.status.name.toLowerCase() === 'done';

      // Extract the week from the created date (YYYY-ww)
      const createdDate = issue.fields.created.split('T')[0]; // Get the date without the time part
      const week = toWeekDay(createdDate);

      // Initialize user metrics if not already initialized
      if (!userMetrics[user]) {
        userMetrics[user] = { user, weeklyData: {} };
      }

      if (!userMetrics[user].weeklyData[week]) {
        userMetrics[user].weeklyData[week] = {
          totalTasks: 0,
          totalBugs: 0,
          totalTimeSpent: 0,
          totalTimeEstimated: 0,
          totalEstimatedStoryPoint: 0,
          taskTypes: {}, // Track issue types (Bug, User Story, etc.),
          completedStoryPoints: 0,
        };
      }

      // Track weekly contributions (total tasks, total bugs, time spent, etc.)
      userMetrics[user].weeklyData[week].totalTasks++;
      userMetrics[user].weeklyData[week].totalTimeSpent += timeSpent / 3600; // Convert seconds to hours
      userMetrics[user].weeklyData[week].totalTimeEstimated += storyPoints; // Convert seconds to hours
      userMetrics[user].weeklyData[week].totalEstimatedStoryPoint += storyPoints;

      if (issueType === 'Bug') userMetrics[user].weeklyData[week].totalBugs++;
      if (isCompleted) {
        userMetrics[user].weeklyData[week].completedStoryPoints += storyPoints;
      }
      // Track the count of each issue type
      if (!userMetrics[user].weeklyData[week].taskTypes[issueType]) {
        userMetrics[user].weeklyData[week].taskTypes[issueType] = 0;
      }
      userMetrics[user].weeklyData[week].taskTypes[issueType]++;
    });

    return Object.values(userMetrics).map((user) => ({
      user: user.user,
      weeklyData: user.weeklyData,
    }));
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    return [];
  }
};

export const fetchProjectKPIGroupByMonth = async (allIssues) => {
  try {
    const userMetrics = {};
    allIssues.forEach((issue) => {
      const user = issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned';
      const issueType = issue.fields.issuetype.name;
      const timeSpent = issue.fields.timespent || 0;
      const timeEstimated = issue.fields.timeoriginalestimate || 0;
      const storyPoints = issue.fields[STORY_POINTS_FIELD] || 0;
      // const projectKey = issue.fields.project.key;
      const isCompleted = issue.fields.status.name.toLowerCase() === 'done';

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
          completedStoryPoints: 0,
          taskTypes: {},
        };
      }

      // Track monthly contributions (total tasks, total bugs, time spent, etc.)
      userMetrics[user].monthlyData[month].totalTasks++;
      userMetrics[user].monthlyData[month].totalTimeSpent += timeSpent / 3600;
      userMetrics[user].monthlyData[month].totalTimeEstimated += timeEstimated / 3600;
      userMetrics[user].monthlyData[month].totalEstimatedStoryPoint += storyPoints;

      if (issueType === 'Bug') userMetrics[user].monthlyData[month].totalBugs++;
      if (isCompleted) {
        userMetrics[user].monthlyData[month].completedStoryPoints += storyPoints;
      }
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
    return result;
  } catch (error) {
    console.error('Error fetching Sprint Velocity:', error);
    return [];
  }
};

/**
 * Fetch Bug Analytics data
 */
export const groupBugsByProject = async (allIssues) => {
  try {
    const bugData = {};
    allIssues.forEach((issue) => {
      const createdDate = issue.fields.created.split('T')[0]; // Extract YYYY-MM-DD
      // const month = createdDate.slice(0, 7); // Extract YYYY-MM for monthly grouping

      const date = new Date(createdDate); // Ensure the date is properly parsed
      const week = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-ww'); // Format to YYYY-ww

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

      if (!bugData[projectKey][week]) {
        bugData[projectKey][week] = { totalBugs: 0, bugTypes: {}, rootCauses: {} };
      }

      // Count total bugs
      bugData[projectKey][week].totalBugs += 1;

      // Count by bug type
      extractedBugTypes.forEach((bugType) => {
        if (!bugData[projectKey][week].bugTypes[bugType]) {
          bugData[projectKey][week].bugTypes[bugType] = 0;
        }
        bugData[projectKey][week].bugTypes[bugType] += 1;
      });

      // Count by root cause
      extractedRootCauses.forEach((rootCause) => {
        if (!bugData[projectKey][week].rootCauses[rootCause]) {
          bugData[projectKey][week].rootCauses[rootCause] = 0;
        }
        bugData[projectKey][week].rootCauses[rootCause] += 1;
      });
    });

    // const result = Object.values(sprintData).sort((a, b) => a.startDate.localeCompare(b.startDate));
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
import { toWeekDay } from '../utils/datetime.utils';
