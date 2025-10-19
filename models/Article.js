const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, trim: true },
  date: { type: String },
  content: { type: String },
  category: { type: String, index: true },
  tags: { type: [String], default: [] },
  image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
