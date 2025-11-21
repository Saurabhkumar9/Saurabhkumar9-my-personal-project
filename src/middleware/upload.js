import multer from "multer";
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.config.js'

const storage = new CloudinaryStorage({
  cloudinary:cloudinary ,
  params: {
    folder: "user_uploads", 
    allowed_formats: ["jpg", "jpeg", "png", "webp"], 
    public_id: (req, file) => `blog_${Date.now()}_${file.originalname.split('.')[0]}`, 
  },
});

const upload = multer({ storage });

export default upload