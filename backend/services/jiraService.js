const axios = require('axios');

const JIRA_API_BASE = process.env.JIRA_API_BASE;
const AUTH_HEADER = {
  headers: {
    Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
    Accept: 'application/json',
  },
};

// Fetch issues assigned to a user
async function getUserIssues(user) {
  try {
    const response = await axios.get(
      `${JIRA_API_BASE}/search?jql=assignee=${user}`,
      AUTH_HEADER
    );
    return response.data.issues;
  } catch (error) {
    console.error('Error fetching user issues:', error.response?.data || error.message);
    return [];
  }
}

// Fetch worklogs (time spent)
async function getIssueWorklog(issueId) {
  try {
    const response = await axios.get(
      `${JIRA_API_BASE}/issue/${issueId}/worklog`,
      AUTH_HEADER
    );
    return response.data.worklogs;
  } catch (error) {
    console.error('Error fetching worklog:', error.response?.data || error.message);
    return [];
  }
}

// Fetch issue details including status
async function getIssueDetails(issueId) {
  try {
    const response = await axios.get(
      `${JIRA_API_BASE}/issue/${issueId}`,
      AUTH_HEADER
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching issue details:', error.response?.data || error.message);
    return null;
  }
}

async function getIssueComments(issueId) {
  try {
    const response = await axios.get(
        `${JIRA_API_BASE}/issue/${issueId}/comment`,
        AUTH_HEADER
    );
    return response.data.comments;
  } catch (error) {
    console.error('Error fetching comments:', error.response?.data || error.message);
    return [];
  }
}


module.exports = {
  getUserIssues,
  getIssueWorklog,
  getIssueDetails,
  getIssueComments,
};

