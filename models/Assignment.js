const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  subject: { type: String, required: true, trim: true },
  score: { type: Number, required: true, min: 0, max: 100, index: true }
}, { timestamps: true });

assignmentSchema.index({ score: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
