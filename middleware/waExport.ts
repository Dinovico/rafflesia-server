import multer from 'multer';
import multerS3 from 'multer-s3';

import s3 from '../services/misc/s3Init.js';

const waExport = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_TEXT_BUCKET!,
        //acl: 'public-read', // Making file public
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const extension = file.mimetype.split('/')[1]; // Get the file extension from the mimetype
            const uniqueName = Date.now().toString(); // Use unique name for every file
            const fileName = `${uniqueName}.${extension}`; // Construct the filename with the extension
            cb(null, fileName);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE, // Set the contentType to be equal to the mimetype
    }),
});

export default waExport;