const axios = require('axios');
const {fetchAllJiraIssues} = require("../utils/jiraFetchUtils");
const BUG_TYPE_FIELD = "customfield_10271";   // Bug Type
const ROOT_CAUSE_FIELD = "customfield_10272"; // Bug Root Cause

/**
 * Fetch Bug Data from Jira categorized by Bug Type & Root Cause.
 * @param {Array} projects - List of project keys
 * @returns {Promise<Object>} Bug statistics grouped by month
 */
async function getBugsByCategory(projects) {
    try {
        if (!projects || projects.length === 0) return {};

        // Jira JQL query to fetch issues including project, sprint, and story points
        const jql = `project IN (${projects.map(p => `"${p}"`).join(',')}) AND issuetype = "Bug"`;

        const allIssues = await fetchAllJiraIssues(jql, `bug-category_${projects.map(p => `"${p}"`).join(',')}`);
        const bugData = {};

        allIssues.forEach(issue => {
            const createdDate = issue.fields.created.split("T")[0];  // Extract YYYY-MM-DD
            const month = createdDate.slice(0, 7); // Extract YYYY-MM for monthly grouping
            const projectKey = issue.fields.project ? issue.fields.project.key : "Unknown";

            // Extract values from array of objects
            const extractedBugTypes = issue.fields[BUG_TYPE_FIELD] ? issue.fields[BUG_TYPE_FIELD].map(item => item.value) : ["Unknown"];
            const extractedRootCauses = issue.fields[ROOT_CAUSE_FIELD] ? issue.fields[ROOT_CAUSE_FIELD].map(item => item.value) : ["Unknown"];

            if (!bugData[projectKey]) {
                bugData[projectKey] = {};
            }

            if (!bugData[projectKey][month]) {
                bugData[projectKey][month] = { totalBugs: 0, bugTypes: {}, rootCauses: {} };
            }

            // Count total bugs
            bugData[projectKey][month].totalBugs += 1;

            // Count by bug type
            extractedBugTypes.forEach(bugType => {
                if (!bugData[projectKey][month].bugTypes[bugType]) {
                    bugData[projectKey][month].bugTypes[bugType] = 0;
                }
                bugData[projectKey][month].bugTypes[bugType] += 1;
            });

            // Count by root cause
            extractedRootCauses.forEach(rootCause => {
                if (!bugData[projectKey][month].rootCauses[rootCause]) {
                    bugData[projectKey][month].rootCauses[rootCause] = 0;
                }
                bugData[projectKey][month].rootCauses[rootCause] += 1;
            });
        });

        // cache.set(cacheKey, bugData, 300); // Cache final sprint velocity result for 5 min
        return bugData;
    } catch (error) {
        console.error('Error fetching Bug Data:', error.response?.data || error.message);
        return {};
    }
}

module.exports = { getBugsByCategory };
