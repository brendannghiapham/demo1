// const { getJiraUsers, getTimeOffData } = require("../../utils/apiUtils");
//
// /**
//  * Map JIRA emails to full names
//  * @param {Array} jiraUsers - JIRA Users List
//  * @param {Array} timeOffList - Time-Off List
//  * @returns {Object} Mapping of emails to adjusted working days
//  */
// function mapJiraEmailsToTimeOff(jiraUsers, timeOffList) {
//     const emailToNameMap = jiraUsers.reduce((map, user) => {
//         map[user.emailAddress] = user.displayName;
//         return map;
//     }, {});
//
//     const nameToWorkingDays = {};
//     timeOffList.forEach(timeOff => {
//         nameToWorkingDays[timeOff.userFullName] = calculateWorkingDays(timeOff.startTime, timeOff.endTime);
//     });
//
//     return Object.keys(emailToNameMap).reduce((result, email) => {
//         const fullName = emailToNameMap[email];
//         result[email] = nameToWorkingDays[fullName] || 5; // Default to 5 days/week
//         return result;
//     }, {});
// }
//
// /**
//  * Calculate working days excluding weekends
//  * @param {string} start - Start Date
//  * @param {string} end - End Date
//  * @returns {number} Working days taken off
//  */
// function calculateWorkingDays(start, end) {
//     const startDate = new Date(`2024-${start}`);
//     const endDate = new Date(`2024-${end}`);
//     let count = 0;
//     while (startDate <= endDate) {
//         if (startDate.getDay() !== 0 && startDate.getDay() !== 6) {
//             count++;
//         }
//         startDate.setDate(startDate.getDate() + 1);
//     }
//     return 5 - (count / 5 * 5); // Adjust to working week scale
// }
//
// /**
//  * Adjust KPI based on available working days
//  * @param {Array} userKpis - User KPI Data
//  * @param {Object} workingDaysMap - Mapped working days per user
//  * @returns {Array} Adjusted KPI data
//  */
// function adjustKpiForTimeOff(userKpis, workingDaysMap) {
//     return userKpis.map(kpi => {
//         const workingDays = workingDaysMap[kpi.userEmail] || 5;
//         kpi.adjustedKpi = (kpi.performanceScore / 100) * (workingDays / 5) * 100;
//         return kpi;
//     });
// }
//
// /**
//  * Main function to process KPI with Time-Off Data
//  */
// async function processKpiWithTimeOff(userKpis) {
//     const jiraUsers = await getJiraUsers();
//     const timeOffData = await getTimeOffData();
//     const workingDaysMap = mapJiraEmailsToTimeOff(jiraUsers, timeOffData);
//     return adjustKpiForTimeOff(userKpis, workingDaysMap);
// }
//
// module.exports = { processKpiWithTimeOff };
