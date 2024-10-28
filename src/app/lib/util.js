const mongoose = require('mongoose')

function transformVietnamese(str, isNotReplaceSpace) {
  str = str.toLowerCase()
  // for lower code
  str = str.replace(/á|à|ả|ã|ạ|â|ấ|ầ|ẩ|ẫ|ậ|ă|ắ|ằ|ẳ|ẵ|ặ/g, 'a')
  str = str.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'e')
  str = str.replace(/í|ì|ỉ|ĩ|ị/g, 'i')
  str = str.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'o')
  str = str.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, 'u')
  str = str.replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y')
  str = str.replace(/đ/g, 'd')
  // for higher code
  str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
  str = str.replace(/[èéẹẻẽêềếệểễ]/g, 'e')
  str = str.replace(/[ìíịỉĩ]/g, 'i')
  str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
  str = str.replace(/[ùúụủũưừứựửữ]/g, 'u')
  str = str.replace(/[ỳýỵỷỹ]/g, 'y')
  str = str.replace(/đ/g, 'd')

  if (!isNotReplaceSpace) {
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|=|<|>|\?|\/|,|\.|:|;|'| |"|&|#|\[|]|~|$|_/g, '-')
    str = str.replace(/-+-/g, '-')
    str = str.replace(/^-+|-+$/g, '')
  }

  return str
}

function cleanData(model, data) {
  for (const p in model.schema.paths) {
    const prop = model.schema.paths[p]

    if (prop.options.update === false) {
      if (Object.prototype.hasOwnProperty.call(data, prop.path)) {
        delete data[prop.path]
      }
    }
  }
  return data
}

function randomString(length) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2)
}

module.exports = {
  transformVietnamese,
  cleanData,
  randomString
}
