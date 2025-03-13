import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Fetch all projects
 */
export const fetchProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

/**
 * Fetch KPI data for selected projects
 */
export const fetchKpiData = async (selectedProjects, startDate, endDate) => {
  console.log('[service] selectedProjects: ', selectedProjects);

  if (selectedProjects.length === 0) return [];
  const projectQuery = selectedProjects.map((p) => p).join(',');

  const queryParams = new URLSearchParams({
    projects: projectQuery,
    startDate: startDate ? startDate.toISOString().split('T')[0] : '',
    endDate: endDate ? endDate.toISOString().split('T')[0] : '',
  });

  try {
    const response = await axios.get(`${API_BASE_URL}/kpi`, { params: queryParams });
    if (!response.data || response.data.length === 0) return [];
    return response.data.map((user) => ({
      user: user.user,
      monthlyData: user.monthlyData,
    }));
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    return [];
  }
};

/**
 * Fetch Sprint Velocity data
 */
export const fetchSprintVelocity = async (selectedProjects) => {
  if (selectedProjects.length === 0) return [];
  const projectQuery = selectedProjects.map((p) => p).join(',');

  try {
    const response = await axios.get(`${API_BASE_URL}/sprint-velocity`, {
      params: { projects: projectQuery },
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching Sprint Velocity:', error);
    return [];
  }
};

/**
 * Fetch Bug Analytics data
 */
export const fetchBugData = async (selectedProjects) => {
  if (selectedProjects.length === 0) return {};
  const projectQuery = selectedProjects.map((p) => p).join(',');

  try {
    const response = await axios.get(`${API_BASE_URL}/bugs`, {
      params: { projects: projectQuery },
    });
    return response.data || {};
  } catch (error) {
    console.error('Error fetching Bug Data:', error);
    return {};
  }
};
