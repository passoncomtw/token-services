const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.json({ title: 'home', test: req.query.test });
});

module.exports = router;
