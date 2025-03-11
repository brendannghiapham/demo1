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

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;
    const url = `${JIRA_API_BASE}/search?jql=${encodeURIComponent(jql)}&startAt=${startAt}&maxResults=${MAX_RESULTS}&fields=project,status,assignee,issuetype,timespent,timeoriginalestimate,timetracking,created,${STORY_POINTS_FIELD},${SPRINT_FIELD}, ${BUG_TYPE_FIELD}, ${ROOT_CAUSE_FIELD}`;

    try {
        const response = await axios.get(url, AUTH_HEADER);
        cache.set(cacheKey, response.data.issues, 300); // Cache for 5 min
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
    console.log('JQL to search in Jira', jql);

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

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

    cache.set(cacheKey, allIssues, 300); // Cache for 5 min
    return allIssues;
}
module.exports = { fetchAllJiraIssues };