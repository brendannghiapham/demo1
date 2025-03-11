const axios = require('axios');
const {fetchAllJiraIssues} = require("../utils/jiraFetchUtils");
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 }); // Cache expires in 5 min

const JIRA_API_BASE = process.env.JIRA_API_BASE;
const AUTH_HEADER = {
    headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
        Accept: 'application/json',
    },
};

// Jira custom fields (Ensure they match your Jira setup)
const STORY_POINTS_FIELD = "customfield_10028";
const SPRINT_FIELD = "customfield_10020";

/**
 * Fetch sprint velocity data using Jira API v3 /search
 * @param {Array} projects - List of project keys
 * @returns {Promise<Array>} - Sprint velocity data grouped by project
 */
async function getSprintVelocity(projects) {
    try {
        if (!projects || projects.length === 0) return [];
        const cacheKey = `sprintVelocity_${projects.join('_')}`;

        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        // Jira JQL query to fetch issues including project, sprint, and story points
        const jql = `project IN (${projects.map(p => `"${p}"`).join(',')})`;
        console.log('JQL to search in Jira', jql);

        const allIssues = await fetchAllJiraIssues(jql, `jiraSprint-category_${projects.map(p => `"${p}"`).join(',')}`);
        const sprintData = {};

        allIssues.forEach(issue => {
            const projectName = issue.fields.project.name; // Project Name
            const sprints = issue.fields[SPRINT_FIELD] || []; // Sprints (can be an array)
            const storyPoints = issue.fields[STORY_POINTS_FIELD] || 0;
            const isCompleted = issue.fields.status.name.toLowerCase() === "done";

            // Handle single sprint or array of sprints
            (Array.isArray(sprints) ? sprints : [sprints]).forEach(sprint => {
                if (!sprint || !sprint.id) return; // Ignore if sprint data is missing

                const sprintKey = `${projectName} - ${sprint.name}`;

                // Initialize sprint entry if not exists
                if (!sprintData[sprintKey]) {
                    sprintData[sprintKey] = {
                        id: sprint.id,
                        name: sprint.name,
                        startDate: sprint.startDate ? sprint.startDate.split("T")[0] : "N/A",
                        endDate: sprint.endDate ? sprint.endDate.split("T")[0] : "N/A",
                        project: projectName,
                        totalEstimatedStoryPoints: 0,
                        completedStoryPoints: 0
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
        cache.set(cacheKey, result, 300); // Cache final sprint velocity result for 5 min
        return result
    } catch (error) {
        console.error('Error fetching Sprint Velocity:', error.response?.data || error.message);
        return [];
    }
}

module.exports = { getSprintVelocity };
