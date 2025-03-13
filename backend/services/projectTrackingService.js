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
        const response = await axios.get(`${JIRA_API_BASE}/search?jql=${encodeURIComponent(jql)}&fields=status,duedate,resolutiondate,priority`, AUTH_HEADER);
        return response.data.issues || [];
    } catch (error) {
        console.error("Error fetching issues:", error.response?.data || error.message);
        return [];
    }
}

/**
 * Calculate Project Tracking Metrics.
 * @param {string} projectKey - Jira Project Key.
 * @returns {Promise<{epicCompletionRate: number, onTimeDelivery: number, riskRegister: number, stakeholderEngagement: number}>}
 */
async function getProjectTrackingMetrics(projects) {
    try {
        const epics = await getIssues(`project IN (${projects.map(p => `"${p}"`).join(',')}) AND issuetype=Epic`);
        const completedEpics = epics.filter(epic => epic.fields.status.name === "Done");

        const totalTasks = await getIssues(`project IN (${projects.map(p => `"${p}"`).join(',')}) AND status!=Done`);
        const onTimeTasks = totalTasks.filter(task => {
            const dueDate = task.fields.duedate ? new Date(task.fields.duedate).getTime() : null;
            const resolutionDate = task.fields.resolutiondate ? new Date(task.fields.resolutiondate).getTime() : null;
            return dueDate && resolutionDate && resolutionDate <= dueDate;
        });

        const highRiskIssues = await getIssues(`project IN (${projects.map(p => `"${p}"`).join(',')}) AND priority=High AND status!=Done`);

        // Placeholder: Stakeholder Engagement could be stored in Jira issues or Confluence
        const stakeholderEngagement = 5; // Placeholder value, should be fetched from an external source

        const epicCompletionRate = epics.length > 0 ? (completedEpics.length / epics.length) * 100 : 0;
        const onTimeDelivery = totalTasks.length > 0 ? (onTimeTasks.length / totalTasks.length) * 100 : 0;
        const riskRegister = highRiskIssues.length;

        return {
            epicCompletionRate: epicCompletionRate.toFixed(2),
            onTimeDelivery: onTimeDelivery.toFixed(2),
            riskRegister,
            stakeholderEngagement
        };
    } catch (error) {
        console.error("Error calculating project tracking metrics:", error.response?.data || error.message);
        return { epicCompletionRate: 0, onTimeDelivery: 0, riskRegister: 0, stakeholderEngagement: 0 };
    }
}

module.exports = { getProjectTrackingMetrics };
