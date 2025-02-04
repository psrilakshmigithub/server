const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const contactSchema = new mongoose.Schema({
  phone: { type: String },
  address: { type: String},
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  googleId: { type: String },
  facebookId: { type: String },
  contacts: { type: [contactSchema], default: [] }

});

// Password hashing for secure storage
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
