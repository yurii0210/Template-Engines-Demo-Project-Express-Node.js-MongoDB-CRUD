const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, default: 0 },
  category: { type: String, index: true },
  tags: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('TestItem', testSchema);
