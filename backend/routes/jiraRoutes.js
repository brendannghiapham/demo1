const express = require('express');
const { collectKpi } = require('../controllers/jiraController');
const Kpi = require('../models/Kpi');
const { getGroupedIssues } = require('../services/jiraGroupingService');
const { getJiraUsers, getUsersByProjects } = require('../services/jiraUserService');
const { getKpiMetrics } = require('../services/jiraKpiService');
const { getJiraProjects } = require('../services/jiraProjectService');
const { getSprintVelocity, getSprints, getSprintStoryPoints } = require('../services/jiraSprintService');
const { getBugsByCategory } = require('../services/getBugsByCategory');
const {getUserCapacityData} = require('../services/jiraUserCapacityService');  // Import the service file


const router = express.Router();

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
router.get('/kpi/:user', async (req, res) => {
    try {
        const kpiData = await Kpi.findOne({ user: req.params.user });
        if (!kpiData) return res.status(404).json({ error: 'No data found' });
        res.json(kpiData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch KPI data' });
    }
});

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

