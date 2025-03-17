const express = require('express');
const { collectKpi } = require('../controllers/jiraController');
const { format } = require('date-fns');
const { getGroupedIssues } = require('../services/jiraGroupingService');
const { getJiraUsers, getUsersByProjects } = require('../services/jiraUserService');
const { getKpiMetrics } = require('../services/jiraKpiService');
const { getJiraProjects } = require('../services/jiraProjectService');
const { getSprintVelocity, getSprints, getSprintStoryPoints } = require('../services/jiraSprintService');
const { getBugsByCategory } = require('../services/getBugsByCategory');
const {getUserCapacityData} = require('../services/jiraUserCapacityService');  // Import the service file

const { getSprintMetrics } = require('../services/sprintMetricsService');
const { getTimeMetrics } = require('../services/timeMetricsService');
const { getDefectMetrics } = require('../services/defectMetricsService');
const { getReleaseMetrics } = require('../services/releaseMetricsService');
const { getProjectTrackingMetrics } = require('../services/projectTrackingService');
// const { processProjectKpis } = require('../services/user-kpi/timeOffKpiService');
const { getStoryPointMetrics, getAllIssues} = require('../services/main-dashboard/mainSPMetricsService');

const router = express.Router();
router.get('/issues', async (req, res) => {
    try {
        let { projects, startDate, endDate, statuses } = req.query;
        if (!projects) {
            return res.status(400).json({ error: 'Projects are required' });
        }
        const projectsArray = Array.isArray(projects) ? projects : projects.split(',');
        const statusesArray = statuses ? statuses.split(',') : [];

        // Set default values if null
        if (!startDate) {
            startDate = "2025-01-01"; // Default: 01-Jan-2025
        }
        if (!endDate) {
            endDate = format(new Date(), "yyyy-MM-dd"); // Default: Today
        }
        const metrics = await getAllIssues(projectsArray, startDate, endDate, statusesArray);
        res.json(metrics);
    } catch (error) {
        console.error("Error fetching story point metrics:", error.message);
        res.status(500).json({ error: 'Failed to retrieve story point metrics' });
    }
});

// API endpoint to get Story Point Metrics grouped by project and status
router.get('/story-points', async (req, res) => {
    try {
        let { projects, startDate, endDate, statuses } = req.query;

        if (!projects) {
            return res.status(400).json({ error: 'Projects are required' });
        }
        // if (!statuses) {
        //     return res.status(400).json({ error: 'At least one status is required' });
        // }

        // Convert projects & statuses from comma-separated strings to arrays
        const projectsArray = Array.isArray(projects) ? projects : projects.split(',');

        const statusesArray = statuses ? statuses.split(',') : [];

        // Set default values if null
        if (!startDate) {
            startDate = "2025-01-01"; // Default: 01-Jan-2025
        }
        if (!endDate) {
            endDate = format(new Date(), "yyyy-MM-dd"); // Default: Today
        }

        const metrics = await getStoryPointMetrics(projectsArray, startDate, endDate, statusesArray);
        res.json(metrics);
    } catch (error) {
        console.error("Error fetching story point metrics:", error.message);
        res.status(500).json({ error: 'Failed to retrieve story point metrics' });
    }
});


/**
 * API Route to get project-based KPI
 */
router.post('/project-kpi', async (req, res) => {
    try {
        const { projects } = req.body;
        if (!projects || projects.length === 0) {
            return res.status(400).json({ error: "Projects list is required." });
        }
        // const kpiResults = await processProjectKpis(projects);
        // res.json(kpiResults);
        res.json({ message: "not supported yet."})
    } catch (error) {
        console.error("Error processing KPI:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
/**
 * @route GET /api/project-tracking/:projectKey
 * @desc Fetch epic completion rate, on-time delivery, risk register, and stakeholder engagement.
 */
router.get('/project-tracking', async (req, res) => {
    try {
        const { projects } = req.query;
        const projectList = projects ? projects.split(',') : [];

        const metrics = await getProjectTrackingMetrics(projectList);
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
});

/**
 * @route GET /api/release-metrics/:projectKey
 * @desc Fetch release burn-down, confidence score, and Go/No-Go criteria.
 */
router.get('/release-metrics', async (req, res) => {
    try {
        // const { projectKey } = req.params;
        // if (!projectKey) {
        //     return res.status(400).json({ error: "Project Key is required" });
        // }
        const { projects } = req.query;
        const projectList = projects ? projects.split(',') : [];
        const metrics = await getReleaseMetrics(projectList);
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/defect-metrics', async (req, res) => {
    try {
        // const { projectKey } = req.params;
        // if (!projectKey) {
        //     return res.status(400).json({ error: "Project Key is required" });
        // }
        const { projects } = req.query;
        const projectList = projects ? projects.split(',') : [];
        const metrics = await getDefectMetrics(projectList);
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * @route GET /api/time-metrics
 * @desc Fetch Lead Time and Cycle Time
 */
router.get('/time-metrics', async (req, res) => {
    try {
        // const { projectKey, sprintId } = req.query;

        // if (!projectKey && !sprintId) {
        //     return res.status(400).json({ error: "Missing projectKey or sprintId" });
        // }

        // const jql = sprintId
        //     ? `sprint=${sprintId}`
        //     : `project=${projectKey} AND status=Done`;
        //

        const { projects } = req.query;
        const projectList = projects ? projects.split(',') : [];
        const jql = `project IN (${projectList.map(p => `"${p}"`).join(',')}) AND status=Done`;

        const metrics = await getTimeMetrics(jql);
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * @route GET /api/sprint-metrics/:boardId
 * @desc Fetch Sprint Velocity and Planned vs Delivered
 */
router.get('/sprint-metrics/:boardId', async (req, res) => {
    try {
        const { boardId } = req.params;
        const metrics = await getSprintMetrics(boardId);
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/sprints', async (req, res) => {
    const { projects } = req.query;

    if (!projects) {
        return res.status(400).send('No projects specified');
    }

    try {
        const sprints = await getSprints(projects.split(','));
        const sprintData = await getSprintStoryPoints(sprints);
        res.json(sprintData);
    } catch (error) {
        res.status(500).send('Error fetching sprint velocity data');
    }
});
// Route to fetch user capacity data
router.get('/user-capacity', async (req, res) => {
    try {
        const data = await getUserCapacityData(); // Call service function
        res.json(data);  // Return the processed data
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user capacity data' });
    }
});

// API to get Bugs categorized by Type & Root Cause
router.get('/bugs', async (req, res) => {
    try {
        const { projects } = req.query;
        const projectList = projects ? projects.split(',') : [];

        const bugData = await getBugsByCategory(projectList);
        res.json(bugData);
    } catch (error) {
        console.error('Error fetching Bug Data:', error);
        res.status(500).json({ error: 'Failed to fetch bug data' });
    }
});

module.exports = router;

// API to fetch the list of projects
router.get('/projects', async (req, res) => {
    try {
        const projects = await getJiraProjects();
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// router.get('/kpi/:user', async (req, res) => {
//     try {
//         const kpiData = await Kpi.findOne({ user: req.params.user });
//         if (!kpiData) return res.status(404).json({ error: 'No data found' });
//         res.json(kpiData);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch KPI data' });
//     }
// });

// Fetch KPI data with filters
router.get('/kpi2', async (req, res) => {
    try {
        const { user, startDate, endDate, project } = req.query;
        let filter = {};

        if (user) filter.user = user;
        if (project) filter.project = project;
        if (startDate && endDate) {
            filter.lastUpdated = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const kpiData = await Kpi.find(filter);
        res.json(kpiData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch KPI data' });
    }
});


// API to get KPI metrics for multiple projects
router.get('/kpi', async (req, res) => {
    try {
        const { projects, startDate, endDate } = req.query;
        const projectList = projects ? projects.split(',') : [];

        const kpiData = await getKpiMetrics(projectList, startDate, endDate);
        res.json(kpiData);
    } catch (error) {
        console.error('Error fetching KPI metrics:', error);
        res.status(500).json({ error: 'Failed to fetch KPI metrics' });
    }
});

// API to get Sprint Velocity for multiple projects
router.get('/sprint-velocity', async (req, res) => {
    try {
        const { projects } = req.query;
        const projectList = projects ? projects.split(',') : [];

        const sprintVelocityData = await getSprintVelocity(projectList);
        res.json(sprintVelocityData);
    } catch (error) {
        console.error('Error fetching sprint velocity:', error);
        res.status(500).json({ error: 'Failed to fetch sprint velocity' });
    }
});


// API to get and group issues by JQL
router.get('/issues/grouped', async (req, res) => {
    const jql = req.query.jql || "project IS NOT EMPTY"; // Default JQL to get all projects

    try {
        const groupedIssues = await getGroupedIssues(jql);
        res.json(groupedIssues);
    } catch (error) {
        console.error('Error in grouping issues:', error);
        res.status(500).json({ error: 'Failed to fetch and group issues' });
    }
});
router.get('/users', async (req, res) => {
    try {
        const { projects, page = 1, limit = 10 } = req.query;
        const projectList = projects ? projects.split(',') : [];

        let users = projectList.length > 0 ? await getUsersByProjects(projectList) : await getJiraUsers();

        // Implement Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedUsers = users.slice(startIndex, endIndex);

        res.json({
            totalUsers: users.length,
            totalPages: Math.ceil(users.length / limit),
            currentPage: parseInt(page),
            users: paginatedUsers
        });
    } catch (error) {
        console.error('Error in fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;

