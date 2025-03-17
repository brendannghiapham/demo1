import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchAllIssues = async (selectedProjects, startDate, endDate, reqStatuses) => {
  console.log('[service] selectedProjects: ', selectedProjects);

  if (selectedProjects.length === 0) return [];
  const projectQuery = selectedProjects.map((p) => p).join(',');
  // TODO: add statuses as request param base on reqStatuses, reqStatuses look like projectQuery
  if (!Array.isArray(reqStatuses)) {
    reqStatuses = []; // Ensure it's an array
  }
  const statusQuery = reqStatuses.length > 0 ? reqStatuses.join(',') : ''; // Format statuses

  const queryParams = new URLSearchParams({
    projects: projectQuery,
    startDate: startDate ? startDate.toISOString().split('T')[0] : '',
    endDate: endDate ? endDate.toISOString().split('T')[0] : '',
    statuses: statusQuery,
  });

  try {
    const response = await axios.get(`${API_BASE_URL}/issues`, { params: queryParams });
    if (!response.data || response.data.length === 0) return [];
    return response.data;
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    return [];
  }
};
