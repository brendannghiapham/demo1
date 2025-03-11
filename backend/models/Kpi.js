const mongoose = require('mongoose');

const KpiSchema = new mongoose.Schema({
  user: String,
  issuesAssigned: Number,
  issuesCompleted: Number,
  timeSpent: Number,
  timeEstimate: Number,
  cycleTime: Number,  // Time from In Progress to Done
  leadTime: Number,   // Time from Created to Done
  bugCount: Number,
  commentsCount: Number, // Collaboration metric
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Kpi', KpiSchema);
