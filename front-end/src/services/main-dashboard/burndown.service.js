import { format, parseISO, startOfWeek } from 'date-fns';
import { toWeekDay } from '../../utils/datetime.utils';
import { projectList } from '../../project-list';

export const parseBurndownDataGroupByProject = async (issues) => {
  const projectBurndown = {}; // { project: { week: SP } }
  issues.forEach((issue) => {
    if (issue.fields && issue.fields.project && issue.fields.customfield_10028) {
      const project = issue.fields.project.key;
      const storyPoints = issue.fields.customfield_10028 || 0;

      // Get Sprint Info
      const sprintField = issue.fields.customfield_10020;
      if (!sprintField || sprintField.length === 0) return;
      const sprintWeek = toWeekDay(sprintField[0].startDate);

      if (!projectBurndown[project]) {
        projectBurndown[project] = {};
      }
      if (!projectBurndown[project][sprintWeek]) {
        projectBurndown[project][sprintWeek] = 0;
      }

      projectBurndown[project][sprintWeek] += storyPoints;
    }
  });

  // Prepare X-axis labels (yyyy-ww format)
  const weeks = [
    ...new Set(Object.values(projectBurndown).flatMap((weekData) => Object.keys(weekData))),
  ].sort();

  // Prepare dataset for Chart.js Stacked Line Chart
  const datasets = Object.entries(projectBurndown).map(([project, weeklySP]) => ({
    label: project,
    data: weeks.map((week) => weeklySP[week] || 0),
    // borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 150, 1)`,
    backgroundColor: projectList()[project].backgroundColor,
    fill: true,
    tension: 0.3,
  }));

  return {
    weeks: weeks,
    datasets: datasets,
  };
};
