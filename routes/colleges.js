const express = require('express');
const router = express.Router();

const {collegeSchema} = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const College = require('../models/collegeCard');
const { isLoggedIn, isAuthor, validateCollege } = require('../middleware');
const colleges = require('../controllers/colleges.js');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(colleges.index))
    .post(isLoggedIn,upload.array('image'),validateCollege, catchAsync(colleges.createCollege));


router.get('/new', isLoggedIn,colleges.renderNewForm)

router.route('/:id')
    .get( catchAsync(colleges.showCollege))
    .put( isLoggedIn,isAuthor,upload.array('image'),catchAsync(colleges.updateCollege))
    .delete( isLoggedIn,isAuthor,catchAsync(colleges.deleteCollege));

router.get('/:id/edit', isLoggedIn,isAuthor,catchAsync(colleges.renderRditForm));


module.exports = router;