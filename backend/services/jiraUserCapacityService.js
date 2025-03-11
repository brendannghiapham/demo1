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
        const allIssues = await fetchAllJiraIssues(jql, 'userCap-all-users');

        // Process the response to create the expected data structure
        return processJiraData(allIssues);
    } catch (error) {
        throw new Error('Error fetching data from Jira: ' + error.message);
    }
}

// Function to process Jira data and return it in the expected structure
function processJiraData(allIssues) {
    const users = {};

    // Iterate through issues and process each one
    allIssues.forEach(issue => {
        const assignee = issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned';
        const assigneeAvatar = issue.fields.assignee ? issue.fields.assignee.avatarUrls['48x48'] : '';  // Fetching the assignee's avatar URL
        const issueType = issue.fields.issuetype.name;
        const issueTypeAvatar = issueTypeAvatars[issueType] || ''; // Using predefined issue type avatars
        const estimatedTime = issue.fields.timeoriginalestimate || 0;  // Estimated time in seconds
        const loggedTime = issue.fields.timetracking ? issue.fields.timetracking.timeSpentSeconds || 0 : 0;  // Time logged in seconds
        const project = issue.fields.project.name;
        const status = issue.fields.status.name;  // Get the issue status

        // If the assignee does not exist in the users object, create it
        if (!users[assignee]) {
            users[assignee] = {
                assignee,
                assigneeAvatar,  // Adding the assignee's avatar to the user object
                issues_count: 0,
                done_issues_count: 0, // Initialize done issues count
                remaining_days: 0, // Remaining days will be calculated based on total estimate and time logged
                issue_types: [],
                projects: new Set(), // To store unique projects the user is involved in
            };
        }

        // Add the project to the user's project list
        users[assignee].projects.add(project);

        // Increment issues count
        users[assignee].issues_count++;

        // Increment done issues count if the issue status is DONE
        if (status === 'Done') {
            users[assignee].done_issues_count++;
        }

        // Calculate remaining time and update issue types
        const remainingTime = (estimatedTime - loggedTime) / 3600 / 8;  // Convert remaining time from seconds to days (assuming 8-hour workday)

        // Find or create the issue type entry for this assignee
        const issueTypeEntry = users[assignee].issue_types.find(type => type.issue_type === issueType);
        if (issueTypeEntry) {
            issueTypeEntry.issue_count++;
            issueTypeEntry.total_remaining_time += remainingTime;
            issueTypeEntry.avatar = issueTypeAvatar;  // Add the issue type avatar
        } else {
            users[assignee].issue_types.push({
                issue_type: issueType,
                issue_count: 1,
                total_remaining_time: remainingTime,
                avatar: issueTypeAvatar,  // Add the issue type avatar
            });
        }

        // Update the remaining days for the assignee (total estimated time minus logged time)
        users[assignee].remaining_days += remainingTime;
    });

    // Convert users object to an array for the final result
    const result = Object.values(users).map(user => ({
        ...user,
        projects: Array.from(user.projects), // Convert Set to Array for project list
        projects_count: user.projects.size, // Add count of unique projects
        done_issues_percentage: (user.done_issues_count / user.issues_count) * 100,  // Calculate percentage of done issues
    }));

    return { users: result };
}

module.exports = { getUserCapacityData };