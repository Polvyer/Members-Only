var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Handle create message form submission
router.post('/create-message', function(req, res, next) {
  res.send('TO-DO: Message form POST')
});

module.exports = router;
