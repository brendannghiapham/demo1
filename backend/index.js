require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jiraRoutes = require('./routes/jiraRoutes');
const cron = require('node-cron');
const { collectKpi } = require('./controllers/jiraController');
const cors = require('cors');
const { getGroupedIssues } = require('./services/jiraGroupingService');

const router = express.Router();

const app = express();
app.use(express.json());
// Allow requests from the frontend
app.use(cors({
  origin: 'http://localhost:3000', // Change this to your frontend URL in production
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.use('/api/jira', jiraRoutes);

const usersToTrack = ['john.doe', 'alice.smith'];

cron.schedule('0 */6 * * *', async () => { // Runs every 6 hours
  console.log('Running KPI collection job...');
  for (const user of usersToTrack) {
    try {
      await collectKpi({ params: { user } }, { json: console.log });
      console.log(`KPI collected for ${user}`);
    } catch (error) {
      console.error(`Error collecting KPI for ${user}`, error);
    }
  }
});

cron.schedule('0 9 * * *', async () => { // Runs every day at 9 AM
  console.log('Checking for overdue Jira issues...');
  const { overdueIssues } = await getGroupedIssues('project IS NOT EMPTY');

  if (overdueIssues.length > 0) {
    console.log("🚨 Sending alert: Overdue Jira issues found");
    // Here, you can send an email or Slack notification
  }
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

