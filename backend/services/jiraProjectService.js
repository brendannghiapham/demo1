const axios = require('axios');
const NodeCache = require('node-cache');
const {fetchProjectsFromJira} = require('../utils/jiraFetchUtils')

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });


/**
 * Fetch all Jira projects
 * @returns {Promise<Array>} List of projects
 */
async function getJiraProjects() {
    const cacheKey = 'jiraProjects';  // Cache key

    // Check if projects are already in cache
    const cachedProjects = cache.get(cacheKey);
    if (cachedProjects) {
        console.log('Fetching Jira projects from cache');
        return cachedProjects;  // Return cached projects if available
    }

    try {
        let allProjects = [];
        let startAt = 0;
        const maxResults = 200;  // Set maximum number of projects per request

        // Loop through pages of Jira projects
        while (true) {
            const projects = await fetchProjectsFromJira(startAt, maxResults);  // Call the utility function

            if (projects.length === 0) {
                break; // Exit loop when no more projects are returned
            }

            allProjects = allProjects.concat(projects.map(project => ({
                id: project.id,
                key: project.key,
                name: project.name
            })));

            // If there are more projects, update startAt for the next request
            startAt += maxResults;
        }

        // Cache the result to avoid redundant API calls
        cache.set(cacheKey, allProjects);
        console.log('Caching Jira projects');

        return allProjects;
    } catch (error) {
        console.error('Error fetching Jira projects:', error.response?.data || error.message);
        return [];
    }
}

module.exports = { getJiraProjects };
