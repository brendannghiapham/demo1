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
        const response = await axios.get(`${JIRA_API_BASE}/search?jql=${encodeURIComponent(jql)}&fields=issuetype,status,environment`, AUTH_HEADER);
        return response.data.issues || [];
    } catch (error) {
        console.error("Error fetching issues:", error.response?.data || error.message);
        return [];
    }
}

/**
 * Calculate Defect Density, Bug Fixing Efficiency, and Escaped Defects.
 * @param {string} projectKey - Jira Project Key.
 * @returns {Promise<{defectDensity: number, bugFixingEfficiency: number, escapedDefects: number}>}
 */
async function getDefectMetrics(projectList) {
    try {
        const projectJQL = `project IN (${projectList.map(p => `"${p}"`).join(',')})`;

        const totalBugs = await getIssues(`${projectJQL} AND issuetype=Bug`);
        const totalFeatures = await getIssues(`${projectJQL} AND issuetype IN (Story, Task) AND status=Done`);
        const fixedBugs = await getIssues(`${projectJQL} AND issuetype=Bug AND status IN (Done, Closed)`);
        const escapedBugs = await getIssues(`${projectJQL} AND issuetype=Bug AND environment=Production`);

        const defectDensity = totalFeatures.length > 0 ? totalBugs.length / totalFeatures.length : 0;
        const bugFixingEfficiency = totalBugs.length > 0 ? (fixedBugs.length / totalBugs.length) * 100 : 0;

        return {
            defectDensity: defectDensity.toFixed(2),
            bugFixingEfficiency: bugFixingEfficiency.toFixed(2),
            escapedDefects: escapedBugs.length
        };
    } catch (error) {
        console.error("Error calculating defect metrics:", error.response?.data || error.message);
        return { defectDensity: 0, bugFixingEfficiency: 0, escapedDefects: 0 };
    }
}

module.exports = { getDefectMetrics };
