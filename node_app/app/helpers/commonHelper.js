const env = process.env;
const fs = require('fs');


function trimObj(obj) {
    if (!obj || (!Array.isArray(obj) && typeof obj !== 'object')) {
        return obj;
    }
    return Object.keys(obj).reduce(function (acc, key) {
        const trimmedKey = key.trim();
        const trimmedValue = typeof obj[key] === 'string' ? obj[key].trim() : trimObj(obj[key]);
        const capitalizedValue = typeof trimmedValue === 'string'
            ? trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1)
            : trimmedValue;
        acc[trimmedKey] = capitalizedValue;
        return acc;
    }, Array.isArray(obj) ? [] : {});
}

exports.trimobject = (obj) => {
    return trimObj(obj)
}


function trim(obj) {
    if (!Array.isArray(obj) && typeof obj != 'object') {
      return obj;
    }
    if (obj) {
      return Object.keys(obj).reduce(function (acc, key) {
        acc[key.trim()] = typeof obj[key] == 'string' ? obj[key].trim() : trimObj(obj[key]);
        return acc;
      }, Array.isArray(obj) ? [] : {});
    }
  
  }
  exports.trimObjc = (obj) => {
    return trim(obj)
  }

exports.siteName = () => {
    return process.env.APP_NAME;
}

exports.getBaseurl = () => {
    return env.APP_URL;
}

exports.prepareUploadFolder = (path) => {
    const pathExist = fs.existsSync(path)
 
    if (!pathExist) {
        fs.mkdirSync(path, {
            recursive: true
        })
    }
}