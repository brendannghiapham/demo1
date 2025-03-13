const axios = require('axios');
const {fetchAllJiraIssues} = require("../utils/jiraFetchUtils");

require('dotenv').config();

// Jira API URL and credentials from environment variables
const JIRA_API_URL = `${process.env.JIRA_API_BASE}/search`;  // Using the JIRA_API_BASE environment variable
const JIRA_EMAIL = process.env.JIRA_EMAIL;  // Using the JIRA_EMAIL environment variable
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;  // Your Jira API token should be stored in .env

// Mapping of issue types to avatars (icons or image URLs)
const issueTypeAvatars = {
    Bug: "https://example.com/bug-avatar.png",   // You can replace with actual image URLs or icons
    Story: "https://example.com/story-avatar.png",
    Task: "https://example.com/task-avatar.png"
};

// Function to get user capacity data
async function getUserCapacityData() {
    try {
        // Define the JQL query to fetch issues assigned to each user
        const jql = 'assignee is not EMPTY AND status in ("To Do", "In Progress", "Done")';  // Modify this based on your requirements
        const allIssues = await fetchAllJiraIssues(jql, 'userCap-all-users', undefined, undefined);

        // Process the response to create the expected data structure
        return processJiraData(allIssues);
    } catch (error) {
        throw new Error('Error fetching data from Jira: ' + error.message);
    }
}

// Function to process Jira data and return it in the expected structure
function processJiraData(allIssues) {
    const users = {};

    allIssues.forEach(issue => {
        const assignee = issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned';
        const assigneeAvatar = issue.fields.assignee ? issue.fields.assignee.avatarUrls['48x48'] : '';
        const issueType = issue.fields.issuetype.name;
        const issueTypeAvatar = issueTypeAvatars[issueType] || '';
        const estimatedTime = issue.fields.timeoriginalestimate || 0;
        const loggedTime = issue.fields.timetracking ? issue.fields.timetracking.timeSpentSeconds || 0 : 0;
        const projectKey = issue.fields.project.key;
        const projectName = issue.fields.project.name;
        const status = issue.fields.status.name;

        // If the assignee does not exist in the users object, create it
        if (!users[assignee]) {
            users[assignee] = {
                assignee,
                assigneeAvatar,
                issues_count: 0,
                done_issues_count: 0,
                remaining_days: 0,
                issue_types: [],
                projects: new Set(), // Store unique project keys
            };
        }

        // Store only unique project keys
        users[assignee].projects.add(projectKey);

        // Increment issues count
        users[assignee].issues_count++;

        // Increment done issues count if the issue status is "Done"
        if (status === 'Done') {
            users[assignee].done_issues_count++;
        }

        // Calculate remaining time
        const remainingTime = (estimatedTime - loggedTime) / 3600 / 8;

        // Find or create the issue type entry for this assignee
        const issueTypeEntry = users[assignee].issue_types.find(type => type.issue_type === issueType);
        if (issueTypeEntry) {
            issueTypeEntry.issue_count++;
            issueTypeEntry.total_remaining_time += remainingTime;
            issueTypeEntry.avatar = issueTypeAvatar;
        } else {
            users[assignee].issue_types.push({
                issue_type: issueType,
                issue_count: 1,
                total_remaining_time: remainingTime,
                avatar: issueTypeAvatar,
            });
        }

        // Update remaining days
        users[assignee].remaining_days += remainingTime;
    });

    // Convert users object to an array for the final result
    const result = Object.values(users).map(user => ({
        ...user,
        projects: Array.from(user.projects).map(projectKey => ({
            key: projectKey,
            name: allIssues.find(issue => issue.fields.project.key === projectKey).fields.project.name
        })), // Convert Set to Array with key & name
        projects_count: user.projects.size,
        done_issues_percentage: (user.done_issues_count / user.issues_count) * 100,
    }));

    return { users: result };
}

module.exports = { getUserCapacityData };