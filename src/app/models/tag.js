const { cleanData, regexEscape, transformVietnamese } = require('../lib/util') ;

const mongoosastic = require('mongoosastic') ;
const { esClient } = require('../../config/elasticsearch') ;

const mongoose = require('mongoose') ;
// import { esIndexedCallbackHandle, esIndexedRemoveCallbackHandle } from './model.base';

const { Schema } = mongoose;
const Tag = new Schema({
  name: {
    type: String,
    required: true
  },
  normalize: {
    type: String,
    lowercase: true,
    trim: true,
  },
  createdBy: {
    type: Schema.ObjectId,
    ref: 'user',
    required: true,
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
    required: true,
    update: false
  },
  omniCount: {
    type: Number,
    default: 0
  },
  bgcolor: {
    type: String
  },
  color: {
    type: String
  },
  pages: [
    {
      type: Schema.ObjectId,
      ref: 'Page'
    }
  ]
});

if (esClient) {
  Tag.plugin(mongoosastic, {
    esClient: esClient,
    saveOnSynchronize: false,
    bulk: {
      size: 10,
      delay: 100
    }
  });
}

Tag.index({
  org: 1,
  normalize: 1,
  createdAt: -1
});

Tag.pre('save', function (next) {
  this.normalize = transformVietnamese(this.name.trim());
  this.updatedAt = +new Date();
  // TODO: Set color default, define color.
  if (!this.bgcolor) {
    this.bgcolor = '#23b7e5';
  }
  if (!this.color) {
    this.color = '#ffffff';
  }
  next();
});

Tag.pre('update', function () {
  this.update({}, { $set: { updatedAt: +new Date() } });
});

Tag.pre('findOneAndUpdate', function () {
  this.update({}, { $set: { updatedAt: +new Date() } });
});


Tag.statics.findTag = function (org, prefix, pageId) {
  try {
    let tags = this
      .where('org', org);

    if (prefix && prefix.trim()) {
      let normalize = transformVietnamese(prefix);
      prefix = regexEscape(prefix);
      normalize = regexEscape(normalize);
      const prefixNormalize = new RegExp(normalize, 'i');
      prefix = new RegExp(prefix.trim(), 'i');
      tags = tags.or([
        { normalize: prefix },
        { normalize: prefixNormalize },
        { name: prefix }
      ]);
    }
    if (pageId) {
      tags = tags.where('pages').elemMatch({ $eq: pageId });
    }
    return tags;
  } catch (err) {
    console.log('ERROR: Tag findTag', err);
    return [];
  }
};

Tag.statics.get = function (id) {
  return this.findOne({ _id: id });
};

Tag.statics.clean = function (data) {
  return cleanData(this, data);
};

Tag.set('toJSON', { getters: true });


const esTag = mongoose.model('tag', Tag);

module.exports = esTag;