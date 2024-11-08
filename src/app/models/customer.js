const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  lastContactDate: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
});

customerSchema.pre('save', function(next) {
  if (this.isModified() || this.isNew) { 
    this.lastContactDate = new Date();
  }
  next();
});

customerSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update) {
    update.$set = update.$set || {};
    update.$set.lastContactDate = new Date();
  }
  next();
});


const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
