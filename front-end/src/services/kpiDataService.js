import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Fetch Sprint Velocity Data
 * @param {Array} selectedProjects - List of selected projects
 * @returns {Promise<Object>} Sprint Velocity data
 */
export const fetchSprintVelocity = async (selectedProjects) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sprint-metrics`, {
      params: { projects: selectedProjects.join(',') },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sprint velocity data:', error);
    return null;
  }
};

/**
 * Fetch Time Tracking Data (Lead Time and Cycle Time)
 * @param {Array} selectedProjects - List of selected projects
 * @returns {Promise<Object>} Time Tracking data
 */
export const fetchTimeTrackingData = async (selectedProjects) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/time-metrics`, {
      params: { projects: selectedProjects.join(',') },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching time tracking data:', error);
    return null;
  }
};

/**
 * Fetch Defect Density Data
 * @param {Array} selectedProjects - List of selected projects
 * @returns {Promise<Object>} Defect Density data
 */
export const fetchDefectDensityData = async (selectedProjects) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/defect-metrics`, {
      params: { projects: selectedProjects.join(',') },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching defect density data:', error);
    return null;
  }
};

/**
 * Fetch Release Readiness Data
 * @param {Array} selectedProjects - List of selected projects
 * @returns {Promise<Object>} Release Readiness data
 */
export const fetchReleaseReadinessData = async (selectedProjects) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/release-metrics`, {
      params: { projects: selectedProjects.join(',') },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching release readiness data:', error);
    return null;
  }
};

/**
 * Fetch Project Tracking Data
 * @param {Array} selectedProjects - List of selected projects
 * @returns {Promise<Object>} Project Tracking data
 */
export const fetchProjectTrackingData = async (selectedProjects) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/project-tracking`, {
      params: { projects: selectedProjects.join(',') },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching project tracking data:', error);
    return null;
  }
};
