const JiraService = require('../services/jiraService');
const Kpi = require('../models/Kpi');

async function collectKpi(req, res) {
  const { user } = req.params;
  try {
    const issues = await JiraService.getUserIssues(user);
    let issuesCompleted = 0, timeSpent = 0, timeEstimate = 0, bugCount = 0;
    let cycleTimeSum = 0, leadTimeSum = 0, commentCount = 0;

    for (const issue of issues) {
      const worklogs = await JiraService.getIssueWorklog(issue.id);
      const issueDetails = await JiraService.getIssueDetails(issue.id);

      if (issueDetails.fields.status.name === "Done") {
        issuesCompleted++;

        // Calculate cycle time (In Progress -> Done)
        const inProgressDate = issueDetails.fields.customfield_10015; // Change this to actual field key
        const resolutionDate = issueDetails.fields.resolutiondate;
        if (inProgressDate && resolutionDate) {
          cycleTimeSum += (new Date(resolutionDate) - new Date(inProgressDate)) / 3600000; // Convert to hours
        }

        // Calculate lead time (Created -> Done)
        const createdDate = issueDetails.fields.created;
        leadTimeSum += (new Date(resolutionDate) - new Date(createdDate)) / 3600000;
      }

      timeSpent += worklogs.reduce((sum, log) => sum + log.timeSpentSeconds, 0);
      timeEstimate += issueDetails.fields.timeoriginalEstimate || 0;
      if (issueDetails.fields.issuetype.name.toLowerCase() === "bug") {
        bugCount++;
      }

      // Count comments
      const comments = await JiraService.getIssueComments(issue.id);
      commentCount += comments.length;
    }

    const kpiData = {
      user,
      issuesAssigned: issues.length,
      issuesCompleted,
      timeSpent: timeSpent / 3600,  // Convert to hours
      timeEstimate: timeEstimate / 3600,
      cycleTime: cycleTimeSum / issuesCompleted || 0,
      leadTime: leadTimeSum / issuesCompleted || 0,
      bugCount,
      commentsCount: commentCount,
      lastUpdated: new Date(),
    };

    await Kpi.findOneAndUpdate({ user }, kpiData, { upsert: true, new: true });
    res.json({ message: 'KPI data updated successfully', data: kpiData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error collecting KPI data' });
  }
}

module.exports = { collectKpi };

