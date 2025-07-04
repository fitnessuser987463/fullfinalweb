// middleware/upload.js

const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  // MODIFIED: Added 'image/jpeg' to the list of allowed mime types
  const allowedTypes = ['image/png', 'image/jpeg', 'video/mp4', 'video/quicktime'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // MODIFIED: Updated the error message to include JPG/JPEG
    cb(new Error('Only PNG, JPG/JPEG images and MP4/MOV videos are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;