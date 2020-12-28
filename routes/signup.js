const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Display signup form 
router.get('/', function(req, res, next) {
  
  if (req.user) { res.redirect('/'); }

  res.render('signup', { title: 'Signup' });
});

// Handle signup form submission
router.post('/', [

  // Validate and sanitise the username field
  body('username', 'Username must be at least 3 characters long').trim().isLength({ min: 3 }).escape(),

  // Validate and sanitise the password field
  body('password', 'Password must be at least 3 characters long').trim().isLength({ min: 3 }).escape(),

  // Check if password confirmation matches password
  body('passwordConfirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password')
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),

  (req, res, next) => {

    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a user object with escaped and trimmed data
    const user = new User(
      {
        'username': req.body.username,
        'password': req.body.password,
        'membership_status': 'User',
      }
    );

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('signup', { title: 'Signup', errors: errors.array() });
      return;
    }
    
    else {
      // Check if username already exists
      User.findOne({ username: req.body.username })
        .exec(function(err, found_username) {

          if (err) { return next(err); }

          if (found_username) {
            // Username already exists. Render the form again with sanitized values/error messages.
            res.render('signup', { title: 'Signup', errors: [{ msg: 'Username already exists' }, ] });
            return;
          } 
          
          else {
            // Encrypt password
            bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {

              if (err) { return next(err); }

              // Replace plain text password with hashed password
              user.password = hashedPassword;

              // Save user to db
              user.save(function(err) {
                if (err) { return next(err); }
                
                // User saved. Login and redirect to home page.
                req.login(user, function(err) { // Automatically log in the newly registered user
                  if (err) { return next(err); }
                  return res.redirect('/');
                });
              });
            });
          }
        });
    }
  }
]);

module.exports = router;