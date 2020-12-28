module.exports = function(passport) {

  const express = require('express');
  const router = express.Router();
  const { body } = require('express-validator');
  const flash = require('connect-flash');

  // Display login form 
  router.get('/', function(req, res, next) {

    if (res.locals.currentUser) { res.redirect('/'); }

    res.render('login', { title: 'Login', errors: req.flash().error })
  });

  // Handle login form submission
  router.post('/', [

    // Sanitise the username field
    body('username').trim().escape(),

    // Sanitise the password field
    body('password').trim().escape(),

    passport.authenticate("local", {
      successRedirect: "/",
      failureFlash: true,
      failureRedirect: "/login",
    })
  ]);

  return router;
}