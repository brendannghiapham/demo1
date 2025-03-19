import { toWeekDay } from '../../utils/datetime.utils';
import { format, parseISO, startOfWeek } from 'date-fns';
import { projectList } from '../../project-list';

export const parseProjectKpi = async (issues) => {
  const projectKPI = {};
  const sprintMap = {};
  // const users = new Set();

  issues.forEach((issue) => {
    if (issue.fields && issue.fields.project && issue.fields.customfield_10028) {
      const project = issue.fields.project.key;
      const storyPoints = issue.fields.customfield_10028 || 0;

      // Get Sprint Info
      const sprintField = issue.fields.customfield_10020;
      if (!sprintField || sprintField.length === 0) return;
      const sprintName = sprintField[0].name;
      const sprintStartDate = parseISO(sprintField[0].startDate);
      const sprintWeek = format(startOfWeek(sprintStartDate, { weekStartsOn: 1 }), 'yyyy-ww');

      // Map yyyy-ww to Sprint Name
      sprintMap[sprintWeek] = sprintName;

      if (!projectKPI[project]) {
        projectKPI[project] = {};
      }
      if (!projectKPI[project][sprintWeek]) {
        projectKPI[project][sprintWeek] = 0;
      }

      projectKPI[project][sprintWeek] += storyPoints;
    }
  });

  // Prepare X-axis labels (yyyy-ww format)
  const weeks = [
    ...new Set(Object.values(projectKPI).flatMap((weekData) => Object.keys(weekData))),
  ].sort();

  // Prepare dataset for Chart.js
  const datasets = Object.entries(projectKPI).map(([project, weeklySP]) => ({
    label: project,
    data: weeks.map((week) => weeklySP[week] || 0), // Use yyyy-ww format for X-axis
    backgroundColor: projectList()[project].backgroundColor,
  }));

  return {
    labels: weeks,
    sprintMap: sprintMap,
    datasets: datasets,
  };
};
