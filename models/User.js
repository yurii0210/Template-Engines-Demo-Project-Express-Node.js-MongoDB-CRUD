const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 100 },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  age: { type: Number, min: 0 },
  position: { type: String, trim: true },
  avatar: { type: String, default: '/images/default-avatar.jpg' },
  bio: { type: String, maxlength: 1000 },
  resetToken: String,
  resetTokenExpiration: Date
}, { timestamps: true });

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
