const { fetchStoryPoints, fetchAllJiraIssues} = require('../../utils/jiraFetchUtils');
const { format, parseISO, startOfWeek } = require('date-fns');

async function getAllIssues(projects, startDate, endDate, statuses) {
    if (!projects || projects.length === 0) return [];

    let jql = `project IN (${projects.map(p => `"${p}"`).join(',')})`;

    if (statuses && statuses.length > 0) {
        console.log('[allissues-service], statues', statuses);
        // jql = ` ${jql} AND status IN (${statuses.map(s => `"${s}"`).join(',')})`;
        jql = `${jql} AND status != Done`
    }

    const allIssues = await fetchAllJiraIssues(jql,`kpi-category_${projects.join('-')}`, startDate, endDate);
    return allIssues;
}


/**
 * Fetch Story Points metrics grouped by project and status
 * @param {Array} projects - List of project keys
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {Array} statuses - List of statuses to filter by
 * @returns {Promise<Object>} Story point metrics grouped by project and status
 */
async function getStoryPointMetrics(projects, startDate, endDate, statuses = null) {
    try {
        // const projectFilter = `project IN (${projects.map(p => `"${p}"`).join(',')})`;
        // const dateFilter = `created >= "${startDate}" AND created <= "${endDate}"`;

        // let statusFilter = "";
        let jql = `project IN (${projects.map(p => `"${p}"`).join(',')})`;

        if (statuses && statuses.length > 0) {
            jql = ` ${jql} AND status IN (${statuses.map(s => `"${s}"`).join(',')})`;
        }

        const allIssues = await fetchAllJiraIssues(jql,`kpi-category_${projects.map(p => `"${p}"`).join(',')}`, startDate, endDate);

        // Initialize object to store metrics
        const groupedMetrics = {};
        // Ensure all requested projects are initialized in the response
        projects.forEach(project => {
            groupedMetrics[project] = { totalSP: 0, statusSP: {} };
        });
        // Process returned issues
        allIssues.forEach(issue => {
            const projectName = issue.fields.project.key; // Using project KEY instead of name
            const status = issue.fields.status.name;
            const storyPoints = issue.fields.customfield_10028 || 0;

            // Track total SP
            groupedMetrics[projectName].totalSP += storyPoints;

            // Track SP per status
            if (!groupedMetrics[projectName].statusSP[status]) {
                groupedMetrics[projectName].statusSP[status] = 0;
            }

            groupedMetrics[projectName].statusSP[status] += storyPoints;
        });

        return groupedMetrics;
    } catch (error) {
        console.error("Error fetching story point metrics:", error.message);
        return {};
    }
}

module.exports = { getStoryPointMetrics, getAllIssues };
