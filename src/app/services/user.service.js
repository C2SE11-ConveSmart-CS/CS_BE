import User from '../models/user';

exports.prepairUser = function (data) {
    _.each(data, (user) => {
      user.lastname = user.lastname || '';
      user.email = user.email.toLowerCase();
      user.username = User.createUsernameForName(user.firstname) + randomString(4);
    });
};

function randomString (length) {
    return Math.random().toString(36).substring(2, length + 2);
}

