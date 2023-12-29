const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

 const resizeImage = (req, res, next) => {
  
    if (!req.file) {
      return next();
    }
  
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const outputFilePath = path.join('images', `resized_${fileName}`);
  
    sharp(filePath)
      .resize({ width: 206, height: 260 })
      .toFile(outputFilePath)
      .then(() => {
        fs.unlink(filePath, () => {
          req.file.path = outputFilePath;
          next();
        });
      })
      .catch(err => {
        console.log(err);
        return next();
      });
};

module.exports = resizeImage;