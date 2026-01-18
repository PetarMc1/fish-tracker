const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, index: true },
  userPassword: { type: String, required: true },
  fernetKey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

userSchema.statics.findById = function(id) {
  return this.findOne({ id }).exec();
};

userSchema.statics.findByName = function(name) {
  return this.findOne({ name }).exec();
};

userSchema.statics.findAll = function(query = {}, options = {}) {
  return this.find(query, null, options).exec();
};

userSchema.statics.count = function(query = {}) {
  return this.countDocuments(query).exec();
};

userSchema.statics.updateById = function(id, updateData) {
  return this.updateOne({ id }, { $set: updateData }).exec();
};

userSchema.statics.deleteById = function(id) {
  return this.deleteOne({ id }).exec();
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);