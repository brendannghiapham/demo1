const axios = require('axios');

const JIRA_API_BASE = process.env.JIRA_API_BASE;
const AUTH_HEADER = {
    headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
        Accept: 'application/json',
    },
};

/**
 * Fetch all Jira projects
 * @returns {Promise<Array>} List of projects
 */
async function getJiraProjects() {
    try {
        const response = await axios.get(`${JIRA_API_BASE}/project/search`, AUTH_HEADER);

        return response.data.values.map(project => ({
            id: project.id,
            key: project.key,
            name: project.name
        }));
    } catch (error) {
        console.error('Error fetching Jira projects:', error.response?.data || error.message);
        return [];
    }
}

module.exports = { getJiraProjects };
