const axios = require('axios');

const JIRA_API_BASE = process.env.JIRA_API_BASE;
const AUTH_HEADER = {
    headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
        Accept: 'application/json',
    },
};

/**
 * Fetch issues from Jira for a given project or board.
 * @param {string} jql - JQL query to filter issues.
 * @returns {Promise<Array>} List of Jira issues.
 */
async function getIssues(jql) {
    try {
        const response = await axios.get(`${JIRA_API_BASE}/search?jql=${encodeURIComponent(jql)}&fields=created,resolutiondate,statuscategorychangedate`, AUTH_HEADER);
        return response.data.issues || [];
    } catch (error) {
        console.error("Error fetching issues:", error.response?.data || error.message);
        return [];
    }
}

/**
 * Calculate Lead Time & Cycle Time for a given JQL query.
 * @param {string} jql - JQL query to filter issues.
 * @returns {Promise<{leadTime: number, cycleTime: number}>} Lead and Cycle time metrics.
 */
async function getTimeMetrics(jql) {
    try {
        const issues = await getIssues(jql);
        if (issues.length === 0) {
            return { leadTime: 0, cycleTime: 0 };
        }

        let totalLeadTime = 0;
        let totalCycleTime = 0;
        let count = 0;

        issues.forEach(issue => {
            const created = new Date(issue.fields.created).getTime();
            const resolved = issue.fields.resolutiondate ? new Date(issue.fields.resolutiondate).getTime() : null;
            const workStarted = issue.fields.statuscategorychangedate ? new Date(issue.fields.statuscategorychangedate).getTime() : null;

            if (resolved) {
                totalLeadTime += (resolved - created) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
                if (workStarted) {
                    totalCycleTime += (resolved - workStarted) / (1000 * 60 * 60 * 24);
                }
                count++;
            }
        });

        return {
            leadTime: count ? (totalLeadTime / count) : 0,
            cycleTime: count ? (totalCycleTime / count) : 0,
        };
    } catch (error) {
        console.error("Error calculating time metrics:", error.response?.data || error.message);
        return { leadTime: 0, cycleTime: 0 };
    }
}

module.exports = { getTimeMetrics };
