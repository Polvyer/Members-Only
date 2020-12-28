var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Message = require('../models/message');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

/* Display home page */
router.get('/', function(req, res, next) {
  Message.find()
    .populate('user')
    .exec(function(err, list_of_messages) {
      if (err) { return next(err); }

      res.render('index', { title: 'Home', user: req.user, messages: list_of_messages });
    })
});

// Display create message form
router.get('/create-message', function(req, res, next) {

  if (!res.locals.currentUser) { res.redirect('/'); }
  
  res.render('createMessage', { title: 'Create message', user: req.user })
});

// Handle create message form submission
router.post('/create-message', [

  // Sanitise the title field
  body('title').trim().escape(),

  // Sanitise the message field
  body('message').escape(),

  (req, res, next) => {

    // Create a message object with escaped and trimmed data
    const message = new Message(
      {
        'title': req.body.title,
        'message': req.body.message,
        'user': res.locals.currentUser._id
      }
    );

    message.save((err) => {
      if (err) { return next(err); }

      // Message saved. Redirect to home page.
      res.redirect('/');
    });
  }
]);

// Display become member form
router.get('/become-member', function(req, res, next) {

  if (!res.locals.currentUser) { res.redirect('/'); }

  if (res.locals.currentUser.membership_status === 'Member') { res.redirect('/'); }
  
  res.render('becomeMember', { title: 'Become member', user: req.user });
});

// Handle become member form submission
router.post('/become-member', [

  // Sanitise the title field
  body('password').trim().escape(),

  (req, res, next) => {

    // Check if password matches
    if (req.body.password !== process.env.MEMBER_PASS) {
      // Password does not match
      res.render('becomeMember', { title: 'Become member', user: req.user, errors: ['Incorrect password'] });
    } else {

      // Password matches
      const newUser = {
        username: res.locals.currentUser.username,
        password: res.locals.currentUser.password,
        membership_status: 'Member',
        _id: res.locals.currentUser._id, // This is required, or a new ID will be assigned!
      }

      User.findByIdAndUpdate(res.locals.currentUser._id, newUser, {}, function(err, oldUser) {
        if (err) { return next(err); }
        // Successful - redirect to home page.
        res.redirect('/');
      });
    }
  }
]);

// Display become admin form
router.get('/become-admin', function(req, res, next) {

  if (!res.locals.currentUser) { res.redirect('/'); }

  if (res.locals.currentUser.membership_status === 'Admin') { res.redirect('/'); }
  
  res.render('becomeAdmin', { title: 'Become admin', user: req.user });
});

// Handle become admin form submission
router.post('/become-admin', [

  // Sanitise the title field
  body('password').trim().escape(),

  (req, res, next) => {

    // Check if password matches
    if (req.body.password !== process.env.ADMIN_PASS) {
      // Password does not match
      res.render('becomeAdmin', { title: 'Become admin', user: req.user, errors: ['Incorrect password'] });
    } else {
      
      // Password matches
      const newUser = {
        username: res.locals.currentUser.username,
        password: res.locals.currentUser.password,
        membership_status: 'Admin',
        _id: res.locals.currentUser._id, // This is required, or a new ID will be assigned!
      }

      User.findByIdAndUpdate(res.locals.currentUser._id, newUser, {}, function(err, oldUser) {
        if (err) { return next(err); }
        // Successful - redirect to home page.
        res.redirect('/');
      });
    }
  }
]);

// Display delete form
router.get('/delete/:id', (req, res, next) => {

  if (!res.locals.currentUser) { res.redirect('/'); }

  if (res.locals.currentUser.membership_status !== 'Admin') { res.redirect('/'); }

  Message.findById(req.params.id)
    .populate('user')
    .exec((err, message) => {
    if (err) { return next(err); }

    if (message === null) { // No results
      const error = new Error('Message not found');
      err.status = 404;
      return next(err);
    }

    // Successful, so render
    res.render('deleteMessage', { title: 'Delete message', message: message, user: res.locals.currentUser });
  });
});

// Handle delete message form submission
router.post('/delete/:id', (req, res, next) => {

  Message.findByIdAndRemove(req.body.messageid, function deleteMessage(err) {
    if (err) { return next(err); }
    // Success - redirect to home page
    res.redirect('/');
  });
});

// Handle logout request
router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
