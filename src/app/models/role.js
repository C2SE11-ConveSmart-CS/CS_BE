import mongoose from 'mongoose';

const { Schema } = mongoose;

const Role = new Schema({
  org: {
    type: Schema.ObjectId,
    ref: 'organization'
  },
  name: {
    type: String
  },
  reportingTo: {
    type: String
  },
  shareWithPeers: {
    type: Boolean,
    default: false
  }
});

// indexing
Role.index({
  org: 1
});

Role.set('toJSON', { getters: true });


module.exports = mongoose.model('role', Role);