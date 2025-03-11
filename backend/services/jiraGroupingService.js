const axios = require('axios');

const JIRA_API_BASE = process.env.JIRA_API_BASE;
const AUTH_HEADER = {
    headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
        Accept: 'application/json',
    },
};

/**
 * Fetch issues from Jira based on JQL
 * @param {string} jql - The JQL query
 * @returns {Promise<Array>} List of Jira issues
 */
async function getIssuesByJQL(jql) {
    try {
        const response = await axios.get(
            `${JIRA_API_BASE}/search?jql=${encodeURIComponent(jql)}&maxResults=1000`,
            AUTH_HEADER
        );
        return response.data.issues || [];
    } catch (error) {
        console.error('Error fetching issues from Jira:', error.response?.data || error.message);
        return [];
    }
}

/**
 * Groups issues by project, then by user
 * @param {Array} issues - List of Jira issues
 * @returns {Object} Grouped issues by project and user
 */
function groupIssuesByProjectAndUser(issues) {
    const groupedData = {};
    // console.log('project data: ', issues[0].fields.project)
    issues.forEach(issue => {

        const project = issue.fields.project.key;
        const assignee = issue.fields.assignee ? issue.fields.assignee.displayName : "Unassigned";
        const issueType = issue.fields.issuetype.name;

        // Extract additional information
        const timeSpent = issue.fields.timespent ? issue.fields.timespent / 3600 : 0; // Convert to hours
        const originalEstimate = issue.fields.timeoriginalestimate ? issue.fields.timeoriginalestimate / 3600 : 0; // Convert to hours
        const dueDate = issue.fields.duedate || "No due date";
        const resolutionDate = issue.fields.resolutiondate || "Not resolved";

        if (!groupedData[project]) {
            groupedData[project] = {};
        }

        if (!groupedData[project][assignee]) {
            groupedData[project][assignee] = {
                issues: [],
                issueTypeCount: {},
            };
        }

        // Increment issue type count
        if (!groupedData[project][assignee].issueTypeCount[issueType]) {
            groupedData[project][assignee].issueTypeCount[issueType] = 0;
        }
        groupedData[project][assignee].issueTypeCount[issueType]++;

        // Store issue details with additional information
        groupedData[project][assignee].issues.push({
            id: issue.id,
            key: issue.key,
            summary: issue.fields.summary,
            issueType: issueType,
            status: issue.fields.status.name,
            created: issue.fields.created,
            updated: issue.fields.updated,
            timeSpent, // Logged time in hours
            originalEstimate, // Estimated time in hours
            dueDate,
            resolutionDate
        });
    });

    return groupedData;
}

function getOverdueIssues(issues) {
    return issues.filter(issue =>
        issue.fields.duedate && new Date(issue.fields.duedate) < new Date() && issue.fields.status.name !== "Done"
    ).map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
        dueDate: issue.fields.duedate,
        assignee: issue.fields.assignee ? issue.fields.assignee.displayName : "Unassigned"
    }));
}

async function getGroupedIssues(jql) {
    console.log('getting isses, jsql = ' + jql);

    const issues = await getIssuesByJQL(jql);
    const groupedData = groupIssuesByProjectAndUser(issues);
    const overdueIssues = getOverdueIssues(issues);

    if (overdueIssues.length > 0) {
        console.log("⚠ Overdue Issues Found:", overdueIssues);
    }

    return { groupedData, overdueIssues };
}

module.exports = { getGroupedIssues };
