const axios = require('axios');

const JIRA_API_BASE = process.env.JIRA_API_BASE;
const AUTH_HEADER = {
    headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
        Accept: 'application/json',
    },
};

/**
 * Fetch Jira issues based on JQL.
 * @param {string} jql - JQL query to filter issues.
 * @returns {Promise<Array>} List of issues.
 */
async function getIssues(jql) {
    try {
        const response = await axios.get(`${JIRA_API_BASE}/search?jql=${encodeURIComponent(jql)}&fields=status,priority`, AUTH_HEADER);
        return response.data.issues || [];
    } catch (error) {
        console.error("Error fetching issues:", error.response?.data || error.message);
        return [];
    }
}

/**
 * Calculate Release Burn-Down, Confidence Score, and Go/No-Go Criteria.
 * @param {string} projectKey - Jira Project Key.
 * @returns {Promise<{burnDownRemaining: number, confidenceScore: number, goNoGo: boolean}>}
 */
async function getReleaseMetrics(projectList) {
    try {
        const projectJQL = `project IN (${projectList.map(p => `"${p}"`).join(',')})`;
        const remainingTasks = await getIssues(`${projectJQL} AND fixVersion=Latest AND status!=Done`);
        const highPriorityUnresolved = await getIssues(`${projectJQL} AND fixVersion=Latest AND priority=High AND status!=Done`);

        // Confidence Score requires integration with a test management tool (e.g., Zephyr, Xray)
        const confidenceScore = 80; // Placeholder: should be fetched from test management API

        const burnDownRemaining = remainingTasks.length;
        const goNoGo = highPriorityUnresolved.length === 0; // If there are unresolved high-priority issues, Go/No-Go is false

        return {
            burnDownRemaining,
            confidenceScore,
            goNoGo
        };
    } catch (error) {
        console.error("Error calculating release metrics:", error.response?.data || error.message);
        return { burnDownRemaining: 0, confidenceScore: 0, goNoGo: false };
    }
}

module.exports = { getReleaseMetrics };
