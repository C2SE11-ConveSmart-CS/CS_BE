// import mongoose from 'mongoose';
const mongoose = require('mongoose')

const { cleanData, transformVietnamese } = require('../lib/util')

const { Types, Schema } = mongoose

const User = new Schema({
  username: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    update: false
  },
  normalize: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'customer'],
    default: 'customer'
  },
  password: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  firstname: {
    type: String,
    default: ''
  },
  lastname: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String
  },
  avatar: {
    type: String,
    default: ''
  },
  ownOrgs: {
    type: [
      {
        type: Schema.ObjectId,
        ref: 'organization'
      }
    ],
    default: [],
    update: false
  },
  belongOrgs: {
    type: [
      {
        type: Schema.ObjectId,
        ref: 'organization'
      }
    ],
    default: [],
    update: false
  },
  createdAt: {
    type: Number,
    default: Date.now,
    update: false
  },
  username_id: String,
  provider: String
})

User.index({
  email: 1
})
User.index({
  username: 1
})

/** Hooks **/
User.pre('save', function (next) {
  let value = ''
  if (this.firstname || this.lastname) {
    value = this.firstname + ' ' + this.lastname
  }
  if (value && value.trim()) {
    this.normalize = transformVietnamese(value.trim())
  }

  next()
})
User.post('remove', function (doc) {
  doc.on('es-removed', function (err) {
    if (err) {
      console.log('ERROR: ES User remove', err)
    }
  })
})
/** Static Methods **/
User.statics.clean = function (data) {
  return cleanData(this, data)
}

User.statics.createUsernameForName = function (name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .substr(0, 15)
}

/** Methods **/
User.methods.addOwnOrg = function (orgId) {
  if (this.ownOrgs.indexOf(Types.ObjectId(orgId)) < 0) {
    this.ownOrgs.push(Types.ObjectId(orgId))
  }
}

User.methods.removeOwnOrg = function (orgId) {}
User.methods.addBelongOrg = function (orgId) {
  if (this.belongOrgs.indexOf(Types.ObjectId(orgId)) < 0) {
    this.belongOrgs.push(Types.ObjectId(orgId))
  }
}
User.methods.removeBelongOrg = function (orgId) {}

User.set('toJSON', { getters: true })

const esUser = mongoose.model('user', User)

module.exports = esUser
