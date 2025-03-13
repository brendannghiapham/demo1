const axios = require('axios');

const JIRA_API_BASE = process.env.JIRA_API_BASE;
const TIME_OFF_SERVICE_URL = process.env.TIME_OFF_SERVICE_URL;

const AUTH_HEADER = {
    headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
        Accept: 'application/json',
    },
};

/**
 * Fetch JIRA users
 * @returns {Promise<Array>} List of users with emails
 */
async function getJiraUsers() {
    try {
        const response = await axios.get(`${JIRA_API_BASE}/users`, AUTH_HEADER);
        return response.data;
    } catch (error) {
        console.error("Error fetching JIRA users:", error);
        return [];
    }
}

/**
 * Fetch Time-Off Data
 * @returns {Promise<Array>} List of users on leave
 */
async function getTimeOffData() {
    try {
        const response = await axios.get(TIME_OFF_SERVICE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching Time-Off data:", error);
        return [];
    }
}

module.exports = { getJiraUsers, getTimeOffData };
