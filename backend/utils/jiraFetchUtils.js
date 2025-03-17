const axios = require('axios');
const NodeCache = require('node-cache');
const { format, parse } = 'date-fns';
const { formatDate } = require('./dateTimeUtils')

const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 }); // Cache expires in 5 min

const JIRA_API_BASE = process.env.JIRA_API_BASE;
const AUTH_HEADER = {
    headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
        Accept: 'application/json',
    },
};

// Jira custom fields (Ensure they match your Jira setup)
const MAX_RESULTS = 100;
const STORY_POINTS_FIELD = "customfield_10028";  // Story Points (custom field)
const SPRINT_FIELD = "customfield_10020";
const BUG_TYPE_FIELD = "customfield_10271";   // Bug Type
const ROOT_CAUSE_FIELD = "customfield_10272"; // Bug Root Cause
/**
 * Fetch a single paginated API request
 * @param {string} jql - JIRA Query Language filter
 * @param {number} startAt - Starting record number
 * @returns {Promise<Array>} - Issues from JIRA API response
 */
async function fetchJiraIssues(jql, startAt) {
    const cacheKey = `jiraIssues_${jql}_${startAt}`;
    console.log('JQL to search in Jira', jql);

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;
    const url = `${JIRA_API_BASE}/search?jql=${encodeURIComponent(jql)}&startAt=${startAt}&maxResults=${MAX_RESULTS}&fields=project,resolutiondate,status,assignee,issuetype,timespent,timeoriginalestimate,timetracking,created,${STORY_POINTS_FIELD},${SPRINT_FIELD}, ${BUG_TYPE_FIELD}, ${ROOT_CAUSE_FIELD}`;

    try {
        const response = await axios.get(url, AUTH_HEADER);
        cache.set(cacheKey, response.data.issues, process.env.SYS_CACHE_TIME); // Cache for 5 min
        return response.data.issues || [];
    } catch (error) {
        console.error('Error fetching JIRA data:', error.response?.data || error.message);
        return [];
    }
}

/**
 * Fetch all JIRA issues using parallel API calls with `Promise.all()`
 * @param {string} jql - JIRA Query Language filter
 * @returns {Promise<Array>} - Combined array of all issues
 */
async function fetchAllJiraIssues(jql, cacheKey, startDate, endDate) {
    console.log('JQL to search in Jira', jql);
    if (!cacheKey) {
        cacheKey = `allJiraIssues_${jql}`;
    }
    if (!startDate) {
        startDate = '2025-01-01';
    }
    if (!endDate) {
        endDate = formatDate(new Date());
    }
    jql = jql + ` AND created >= "${startDate}" AND created <= "${endDate}"`

    // Check cache first
    const cachedData = cache.get(cacheKey);
    console.log('[APIUtil] Finding cache with key: ', cacheKey);
    if (cachedData) {
        console.log('[APIUtil] Cache found');
        return cachedData
    } else {
        console.log('[APIUtil] Cache Not found');
    }


    let allIssues = [];
    let startAt = 0;
    const firstBatch = await fetchJiraIssues(jql, startAt);

    if (firstBatch.length === 0) return [];

    // Calculate total number of issues
    const totalIssues = firstBatch.length < MAX_RESULTS ? firstBatch.length : (await axios.get(`${JIRA_API_BASE}/search?jql=${encodeURIComponent(jql)}&maxResults=1000&fields=project,status,assignee,issuetype,timespent,timeoriginalestimate,created,${STORY_POINTS_FIELD},${SPRINT_FIELD}, ${BUG_TYPE_FIELD}, ${ROOT_CAUSE_FIELD}`, AUTH_HEADER)).data.total;

    // Create an array of promises for all paginated requests
    const requests = [];
    for (let startAt = 0; startAt < totalIssues; startAt += MAX_RESULTS) {
        requests.push(fetchJiraIssues(jql, startAt));
    }

    // Fetch all pages simultaneously
    const results = await Promise.all(requests);

    // Flatten results into a single array
    allIssues = results.flat();

    allIssues.forEach(issue => {
        issue.expand = undefined;
        issue.self = undefined;
        if (issue.fields.issuetype) {
            issue.fields.issuetype.self = undefined;
            issue.fields.issuetype.iconUrl = undefined;
            issue.fields.issuetype.description = undefined;
        }


        if (issue.fields.project) {
            issue.fields.project.self = undefined;
            issue.fields.project.avatarUrls = undefined;
        }
        if (issue.fields.assignee) {
            issue.fields.assignee.self = undefined;
            issue.fields.assignee.avatarUrls = undefined;
        }
        if (issue.fields.status.self) {
            issue.fields.status.self = undefined;
            issue.fields.status.description = undefined;
            issue.fields.status.iconUrl = undefined;
        }
    });
    cache.set(cacheKey, allIssues, 300);
    return allIssues;
}


async function fetchProjectsFromJira(startAt = 0, maxResults) {
    try {
        const response = await axios.get(`${JIRA_API_BASE}/project/search?startAt=${startAt}&maxResults=${maxResults}&status=live`, AUTH_HEADER);
        return response.data.values;
    } catch (error) {
        console.error('Error fetching Jira projects from API:', error.response?.data || error.message);
        throw new Error('Failed to fetch Jira projects');
    }
}


/**
 * Fetch Story Points from Jira API
 * @param {string} jql - JQL query
 * @returns {Promise<Array>} List of issues with Story Points
 */
async function fetchStoryPoints(jql) {
    const cacheKey = 'main-storypoint-compare';
    try {
        const cachedData = cache.get(cacheKey);
        if (cachedData) return cachedData;

        console.log('[apiUtil], requesting isseus with JQL: ', jql);
        const response = await axios.get(
            `${JIRA_API_BASE}/search?jql=${encodeURIComponent(jql)}&fields=project,issuetype,status,${STORY_POINTS_FIELD}`,
            AUTH_HEADER
        );
        cache.set(cacheKey, response.data.issue, process.env.SYS_CACHE_TIME);
        return response.data.issues || [];
    } catch (error) {
        console.error("Error fetching Story Points:", error.response?.data || error.message);
        return [];
    }
}
module.exports = { fetchAllJiraIssues,  fetchProjectsFromJira, fetchStoryPoints};