import { format, parseISO, startOfWeek } from 'date-fns';
import { toWeekDay } from '../../utils/datetime.utils';

const ROOT_CAUSE_FIELD = 'customfield_10272'; // Bug Root Cause

export const parseBugRootCauseByWeek = async (issues) => {
  const floor = Math.floor;
  const rootCauseData = {}; // { rootCause: { week: totalIssues } }
  const weeks = [];
  const allRootCauseKeys = new Set();
  // Process issuesData to group by rootCause and week
  issues.forEach((issue) => {
    const rootCause = issue.fields[ROOT_CAUSE_FIELD]
      ? issue.fields[ROOT_CAUSE_FIELD].map((item) =>
          item.value.trim().toUpperCase().replace(/ /g, '_')
        )
      : ['Unknown'];
    if (!rootCause) {
      return;
    }
    const createdDate = issue.fields.created.split('T')[0]; // Extract YYYY-MM-DD
    if (!createdDate) {
      console.warn(`Issue missing created date, skipping issue: ${issue.id}`);
      return; // Skip the issue if there's no created date
    }

    const rootCauseArr = rootCause;
    const formattedWeek = toWeekDay(createdDate);
    if (!weeks.includes(formattedWeek)) {
      weeks.push(formattedWeek); // Add the week if not already in the list
    }

    // Group data by rootCause for each week
    rootCauseArr.forEach((rootCauseElement) => {
      allRootCauseKeys.add(rootCauseElement);
      if (!rootCauseData[rootCauseElement]) {
        rootCauseData[rootCauseElement] = {};
      }
      if (!rootCauseData[rootCauseElement][formattedWeek]) {
        rootCauseData[rootCauseElement][formattedWeek] = 0;
      }
      rootCauseData[rootCauseElement][formattedWeek] += 1; // Increment the issue count for the rootCause in the week
    });
  });

  // Prepare the chart dataset for root causes
  const datasets = Object.entries(rootCauseData).map(([rootCause, weeklyData], index) => ({
    label: rootCause,
    data: weeks.map((week) => floor(parseFloat(weeklyData[week] || 0))), // Set data for each week
    borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 150, 1)`,
    backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 150, 0.3)`,
    tension: 0.2,
    fill: true,
  }));

  return {
    weeks: weeks,
    datasets: datasets,
  };
  // console.log('Bug group bty datasets:, ', JSON.stringify(datasets));
};
