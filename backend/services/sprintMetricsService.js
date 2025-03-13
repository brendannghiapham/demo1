const axios = require('axios');

const JIRA_API_BASE = process.env.JIRA_API_BASE;
const STORY_POINTS_FIELD = "customfield_10028";  // Update this if needed

const AUTH_HEADER = {
    headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
        Accept: 'application/json',
    },
};

/**
 * Fetch completed sprints from a Jira board.
 * @param {string} boardId - The Jira board ID.
 * @returns {Promise<Array>} List of completed sprints.
 */
async function getCompletedSprints(boardId) {
    try {
        const response = await axios.get(`${JIRA_API_BASE}/agile/1.0/board/${boardId}/sprint?state=closed`, AUTH_HEADER);
        return response.data.values;
    } catch (error) {
        console.error("Error fetching completed sprints:", error.response?.data || error.message);
        return [];
    }
}

/**
 * Fetch issues in a sprint and calculate story points.
 * @param {string} sprintId - The sprint ID.
 * @returns {Promise<{ planned: number, completed: number }>} Story points data.
 */
async function getSprintStoryPoints(sprintId) {
    try {
        const response = await axios.get(`${JIRA_API_BASE}/search?jql=sprint=${sprintId}&fields=status,${STORY_POINTS_FIELD}`, AUTH_HEADER);
        const issues = response.data.issues;

        let plannedStoryPoints = 0;
        let completedStoryPoints = 0;

        issues.forEach(issue => {
            const storyPoints = issue.fields[STORY_POINTS_FIELD] || 0;
            plannedStoryPoints += storyPoints;

            if (issue.fields.status.name === "Done") {
                completedStoryPoints += storyPoints;
            }
        });

        return { planned: plannedStoryPoints, completed: completedStoryPoints };
    } catch (error) {
        console.error(`Error fetching issues for sprint ${sprintId}:`, error.response?.data || error.message);
        return { planned: 0, completed: 0 };
    }
}

/**
 * Calculate Sprint Velocity and Planned vs Delivered.
 * @param {string} boardId - The Jira board ID.
 * @returns {Promise<{ velocity: number, plannedVsDelivered: number }>} Sprint metrics.
 */
async function getSprintMetrics(boardId) {
    try {
        const sprints = await getCompletedSprints(boardId);
        if (sprints.length === 0) {
            return { velocity: 0, plannedVsDelivered: 0 };
        }

        let totalCompletedStoryPoints = 0;
        let totalPlannedStoryPoints = 0;

        for (const sprint of sprints) {
            const { planned, completed } = await getSprintStoryPoints(sprint.id);
            totalPlannedStoryPoints += planned;
            totalCompletedStoryPoints += completed;
        }

        const velocity = totalCompletedStoryPoints / sprints.length;
        const plannedVsDelivered = totalPlannedStoryPoints === 0 ? 0 : (totalCompletedStoryPoints / totalPlannedStoryPoints) * 100;

        return { velocity, plannedVsDelivered };
    } catch (error) {
        console.error("Error calculating sprint metrics:", error.response?.data || error.message);
        return { velocity: 0, plannedVsDelivered: 0 };
    }
}

module.exports = { getSprintMetrics };
