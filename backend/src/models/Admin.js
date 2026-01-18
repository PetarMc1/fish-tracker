const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superadmin'], required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'admins' });

adminSchema.statics.findByUsername = function(username) {
  return this.findOne({ username }).exec();
};

adminSchema.statics.findAll = function() {
  return this.find({}).exec();
};

adminSchema.statics.deleteById = function(id) {
  const _id = typeof id === 'string' ? mongoose.Types.ObjectId(id) : id;
  return this.deleteOne({ _id }).exec();
};

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);