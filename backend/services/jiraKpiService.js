const axios = require('axios');
const {fetchAllJiraIssues} = require("../utils/jiraFetchUtils");


const STORY_POINTS_FIELD = "customfield_10028";  // Story Points (custom field)


/**
 * Fetch KPI Metrics from Jira for multiple projects, grouped by month and user.
 * @param {Array} projects - List of project keys
 * @returns {Promise<Array>} KPI data grouped by user and month
 */
async function getKpiMetrics(projects, startDate, endDate) {
    try {

        if (!projects || projects.length === 0) return [];

        // Jira JQL query to fetch issues including project, sprint, and story points
        const jql = `project IN (${projects.map(p => `"${p}"`).join(',')})`;

        const allIssues = await fetchAllJiraIssues(jql,`kpi-category_${projects.map(p => `"${p}"`).join(',')}`, startDate, endDate);
        const userMetrics = {};

        allIssues.forEach(issue => {
            const user = issue.fields.assignee ? issue.fields.assignee.displayName : "Unassigned";
            const issueType = issue.fields.issuetype.name;
            const timeSpent = issue.fields.timespent || 0;
            const timeEstimated = issue.fields.timeoriginalestimate || 0;
            const storyPoints = issue.fields[STORY_POINTS_FIELD] || 0;
            const projectKey = issue.fields.project.key;

            // Extract the month from the created date (YYYY-MM)
            const createdDate = issue.fields.created.split("T")[0];  // Get the date without the time part
            const month = createdDate.slice(0, 7);  // Format to YYYY-MM

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
                    taskTypes: {}  // Track issue types (Bug, User Story, etc.)
                };
            }

            // Track monthly contributions (total tasks, total bugs, time spent, etc.)
            userMetrics[user].monthlyData[month].totalTasks++;
            userMetrics[user].monthlyData[month].totalTimeSpent += timeSpent / 3600;
            userMetrics[user].monthlyData[month].totalTimeEstimated += timeEstimated / 3600;
            userMetrics[user].monthlyData[month].totalEstimatedStoryPoint += storyPoints;

            if (issueType === "Bug") userMetrics[user].monthlyData[month].totalBugs++;

            // Track the count of each issue type
            if (!userMetrics[user].monthlyData[month].taskTypes[issueType]) {
                userMetrics[user].monthlyData[month].taskTypes[issueType] = 0;
            }
            userMetrics[user].monthlyData[month].taskTypes[issueType]++;

        });

        const result = Object.values(userMetrics);
        return result;
    } catch (error) {
        console.error('Error fetching KPI metrics:', error.response?.data || error.message);
        return [];
    }
}

module.exports = { getKpiMetrics };
