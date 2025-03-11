const axios = require('axios');
const NodeCache = require('node-cache');

const JIRA_API_BASE = process.env.JIRA_API_BASE;
const AUTH_HEADER = {
    headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
        Accept: 'application/json',
    },
};

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

/**
 * Fetch all users from Jira with caching
 * @returns {Promise<Array>}
 */
async function getJiraUsers() {
    const cacheKey = 'jira_users';
    if (cache.has(cacheKey)) {
        console.log('Fetching users from cache...');
        return cache.get(cacheKey);
    }

    try {
        console.log('Fetching users from Jira API...');
        const response = await axios.get(`${JIRA_API_BASE}/users/search?maxResults=100`, AUTH_HEADER);

        const users = response.data.map(user => ({
            accountId: user.accountId,
            displayName: user.displayName,
        }));

        cache.set(cacheKey, users);
        return users;
    } catch (error) {
        console.error('Error fetching Jira users:', error.response?.data || error.message);
        return [];
    }
}

/**
 * Fetch users assigned to issues within given projects with caching
 * @param {Array} projects
 * @returns {Promise<Array>}
 */
async function getUsersByProjects(projects) {
    if (!projects || projects.length === 0) {
        return getJiraUsers(); // Return all users if no project filter is applied
    }

    const cacheKey = `users_by_projects_${projects.join('_')}`;
    if (cache.has(cacheKey)) {
        console.log('Fetching users from cache...');
        return cache.get(cacheKey);
    }

    try {
        console.log('Fetching users by project from Jira API...');
        const jql = `project in (${projects.map(p => `"${p}"`).join(', ')})`;
        const response = await axios.get(`${JIRA_API_BASE}/search?jql=${encodeURIComponent(jql)}&maxResults=1000`, AUTH_HEADER);

        const usersSet = new Set();
        response.data.issues.forEach(issue => {
            if (issue.fields.assignee) {
                usersSet.add(JSON.stringify({
                    accountId: issue.fields.assignee.accountId,
                    displayName: issue.fields.assignee.displayName
                }));
            }
        });

        const users = Array.from(usersSet).map(user => JSON.parse(user));
        cache.set(cacheKey, users);
        return users;
    } catch (error) {
        console.error('Error fetching users by project:', error.response?.data || error.message);
        return [];
    }
}

module.exports = { getJiraUsers, getUsersByProjects };
