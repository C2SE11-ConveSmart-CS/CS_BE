import mongoose from 'mongoose';
import mongoosastic from 'mongoosastic';
import { esClient } from '../../config/elasticsearch';

const { Schema } = mongoose;

const sessionOmniSchema = new Schema({
  conversation: {
    type: Schema.ObjectId,
    ref: 'SessionOmni'
  },
  commentfacebook: {
    type: Schema.ObjectId,
    ref: 'CommentFacebook'
  },
  channel: {
    type: String,
    default: 'FACEBOOK'
  },
  pageId: String,
  pageName: String,
  lastMessageAt: {
    type: Number,
  },
  lastSentMassage: {
    type: Number,
  },
  assignedTo: {
    type: Schema.ObjectId,
    ref: 'user'
  },
  isCalculateWaitingTime: {
    type: Boolean,
    default: false
  },
  isDone: {
    type: Boolean,
    default: false
  },
  isSupport: {
    type: Boolean,
    default: false
  },
  createdBySentMessage: {
    type: Boolean,
    default: false
  },
  doneAt: {
    type: Number,
  },
  doneBy: {
    type: Schema.ObjectId,
    ref: 'user'
  },
  firstResponseIn: {
    type: Number,
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdAtDate: {
    type: Date,
    default: new Date()
  },
  createdAtHour: {
    type: Number
  },
  org: {
    type: Schema.ObjectId,
    ref: 'organization'
  },
  isAssignSession: {
    type: Boolean,
    default: true
  },
  time_support: {
    type: Number,
    default: 0
  },
  tags: [{
    type: Schema.ObjectId,
    ref: 'Tag'
  }],
  fb_ads_id: String,
});

sessionOmniSchema.index({
  contact: 1
});

sessionOmniSchema.index({
  conversation: 1
});
sessionOmniSchema.index({
  commentfacebook: 1
});
sessionOmniSchema.index({
  assignedTo: 1
});
if (esClient) {
  sessionOmniSchema.plugin(mongoosastic, {
    esClient: esClient,
    saveOnSynchronize: false,
    bulk: {
      size: 10,
      delay: 100
    }
  });
}
sessionOmniSchema.post('save', doc => {
  doc.on('es-indexed', (err) => {
    if (err) {
      console.log('ERROR: ES sessionOmniSchema save', err);
    }
  });
});
sessionOmniSchema.post('remove', doc => {
  doc.on('es-removed', (err) => {
    if (err) {
      console.log('ERROR: ES sessionOmniSchema remove', err);
    }
  });
});

const esSessionOmniSchema = mongoose.model('SessionOmni', sessionOmniSchema);

module.exports = esSessionOmniSchema;