const express = require('express');
const router = express.Router();
const path = require('path');
const ebayController = require('../controllers/ebayController');
const cors = require('cors');
const corsOptions = require('../config/corsOptions');


router.options('*', cors());


router.route('/')
    .get(ebayController.getLiterallyAnything)
    .post()
    .put()
    .delete()

   

module.exports = router;