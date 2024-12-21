const jwt = require('jsonwebtoken')
const express = require('express')
const User = require('../models/user')
const accountManageRouter = express.Router()

const authenAdmin = async (req, res, next) => {
  if (!req.headers['authorization']) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
    const token = req.headers['authorization'].replace('Bearer ', '')
    const { userId } = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(userId)
    if (!user || user.role !== 'admin') {
      throw new Error('Not admin')
    }
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}

accountManageRouter.get('/', authenAdmin, async (req, res, next) => {
  const { nameOrAccount, role } = req.query
  const roleQuery = role === 'all' ? { $in: ['staff', 'admin'] } : { $eq: role }
  const users = await User.find({
    _id: { $ne: req.user._id },
    role: roleQuery,
    $or: [
      { username: new RegExp(nameOrAccount, 'i') },
      { normalize: new RegExp(nameOrAccount, 'i') },
    ],
  }).select(['normalize', 'role', 'createdAt', 'email', 'status_account'])
  res.json({
    users,
  })
})

accountManageRouter.post('/block', authenAdmin, async (req, res, next) => {
  const { listId } = req.body
  await User.updateMany(
    {
      _id: { $in: listId },
    },
    {
      status_account: 'blocked',
    }
  )
  res.json({
    message: 'Block account successfully',
  })
})

accountManageRouter.post('/un-block', authenAdmin, async (req, res, next) => {
  const { listId } = req.body
  await User.updateMany(
    {
      _id: { $in: listId },
    },
    {
      status_account: 'active',
    }
  )
  res.json({
    message: 'Un-Block account successfully',
  })
})

accountManageRouter.post('/edit-role', authenAdmin, async (req, res, next) => {
  const { listId, role } = req.body
  await User.updateMany(
    {
      _id: { $in: listId },
    },
    {
      role,
    }
  )
  res.json({
    message: 'Edit role account successfully',
  })
})

module.exports = accountManageRouter
