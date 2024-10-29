const jwt = require('jsonwebtoken')
import User from '../models/user'

exports.prepairUser = function (data) {
  _.each(data, (user) => {
    user.lastname = user.lastname || ''
    user.email = user.email.toLowerCase()
    user.username = User.createUsernameForName(user.firstname) + randomString(4)
  })
}

function randomString(length) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2)
}

const authenUser = async (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Unauthorized' })
  }
  const token = authorization.split(' ')[1]
  try {
    const jsonToken = await jwt.verify(token, process.env.JWT_SECRET)
    req.token = jsonToken
    next()
  } catch (err) {
    throw new CustomError.UnauthenticatedError('Authen invalid')
  }
}

module.exports = { authenUser }
