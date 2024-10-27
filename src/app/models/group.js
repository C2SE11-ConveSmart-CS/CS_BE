const mongoose = require('mongoose');

const { cleanData, transformVietnamese } = require ('../lib/util');

const { Schema } = mongoose;

const Group = new Schema({
  site: {
    type: String,
  },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String
  },
  normalize: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  inTrash: {
    type: Schema.ObjectId,
    ref: 'trash',
  },
  users: {
    type: [{
      type: Schema.ObjectId,
      ref: 'user'
    }],
    default: []
  },
  createdBy: {
    type: Schema.ObjectId,
    ref: 'user',
    update: false
  },
  createdAt: {
    type: Number,
    default: Date.now,
    update: false
  },
  updatedAt: {
    type: Number
  },
  org: {
    type: Schema.ObjectId,
    ref: 'organization',
    update: false
  },
});


// indexing
Group.index({
  org: 1,
  normalize: 1
});

// hooks
Group.pre('save', function (next) {
  this.updatedAt = +new Date();
  const { name } = this;
  this.normalize = transformVietnamese(name.trim());
  next();
});

Group.pre('update', function () {
  this.update({}, { $set: { updatedAt: +new Date() } });
});

Group.pre('findOneAndUpdate', function () {
  this.update({}, { $set: { updatedAt: +new Date() } });
});


Group.set('toJSON', { getters: true });

Group.statics.clean = function (data) {
  return cleanData(this, data);
};

const esGroup = mongoose.model('group', Group);

module.exports = esGroup;
