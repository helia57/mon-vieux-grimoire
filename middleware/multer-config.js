const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image.png': 'png',
  'image/webp': 'webp',
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'images');
    },
    filename: (req, file, callback) => {
      const name = file.originalname.split(' ').join('_');
      callback(null, Date.now() + name );
    }
});



module.exports = multer({storage: storage}).single('image');



  // Vérification de la taille du fichier (1 Mo maximum)
module.exports.resizeImage = (req, res, next) => {
  
    if (!req.file) {
        return next();
    }
  
    // Vérification de la taille du fichier (1 Mo maximum)
    const maxFileSize = 1 * 1024 * 1024; // 1 Mo en octets
    if (req.file.size > maxFileSize) {
        // Si le fichier est trop grand, il est supprimé et renvoie une réponse
        fs.unlink(req.file.path, () => {
            return res.status(400).json({ error: 'La taille du fichier dépasse la limite autorisée (1 Mo).' });
        });


    } else {
        const filePath = req.file.path;
        const fileName = req.file.filename;
        const outputFilePath = path.join('images', `resized_${fileName.replace(/\.[^.]+$/, '')}.webp`);
  
        sharp(filePath)
        .resize({ width: 463, height: 595 })
        .webp({ quality: 85})
        .toFile(outputFilePath)
        .then(() => {
            fs.unlink(fileName, () => {
                req.file.path = outputFilePath;
                next();
            });
        })


        .catch(err => {
            console.log(err);
            return next();
        });   
    };
  
};

