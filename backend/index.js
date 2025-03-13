require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jiraRoutes = require('./routes/jiraRoutes');
const cron = require('node-cron');
const { collectKpi } = require('./controllers/jiraController');
const cors = require('cors');
const { getGroupedIssues } = require('./services/jiraGroupingService');
const serverless = require('serverless-http');

const router = express.Router();

const app = express();
app.use(express.json());



const allowedOrigins = [
  "http://localhost:3000",
  "https://dc3a2nnz3tsya.cloudfront.net"
];

app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("CORS not allowed"));
        }
      },
      credentials: true
    })
);
// Manually set headers if API Gateway is stripping them
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});


// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.log(err));
//
app.use('/api/jira', jiraRoutes);

// const usersToTrack = ['john.doe', 'alice.smith'];

// cron.schedule('0 */6 * * *', async () => { // Runs every 6 hours
//   console.log('Running KPI collection job...');
//   for (const user of usersToTrack) {
//     try {
//       await collectKpi({ params: { user } }, { json: console.log });
//       console.log(`KPI collected for ${user}`);
//     } catch (error) {
//       console.error(`Error collecting KPI for ${user}`, error);
//     }
//   }
// });
//
// cron.schedule('0 9 * * *', async () => { // Runs every day at 9 AM
//   console.log('Checking for overdue Jira issues...');
//   const { overdueIssues } = await getGroupedIssues('project IS NOT EMPTY');
//
//   if (overdueIssues.length > 0) {
//     console.log("🚨 Sending alert: Overdue Jira issues found");
//     // Here, you can send an email or Slack notification
//   }
// });
//
module.exports.handler = serverless(app);

// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

