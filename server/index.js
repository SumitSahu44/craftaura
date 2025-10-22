const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload-design', upload.single('design'), async (req, res) => {
  try {
    // file buffer -> upload to cloudinary
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileStr, {
      folder: 'custom-gift-designs',
    });

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
