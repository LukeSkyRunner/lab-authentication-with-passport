'use strict';

const passport = require('passport');
const passportLocal = require('passport-local');

const PassportLocalStrategy = passportLocal.Strategy;

const bcrypt = require('bcrypt');

const User = require('./models/user');

// Strategy for sign in
// Strategy for sign up
// Tell passport how to serialize user
// Tell passport how to deserialize user

passport.serializeUser((user, callback) => {
  console.log(user)
  callback(null, user._id);
});


passport.deserializeUser((id, callback) => {
  User.findById(id)
    .then(user => {
      callback(null, user);
    })
    .catch(error => {
      callback(error);
    });
});

const signUpStrategy = new PassportLocalStrategy({}, (username, password, callback) => {
  User.findOne({ username })
    .then(user => {
      if (user) {
        const error = new Error('USER_ALREADY_EXISTS');
        return Promise.reject(error);
      } else {
        return bcrypt.hash(password, 10);
      }
    })
    .then(hash => {
      return User.create({
        username,
        passwordHash: hash
      });
    })
    .then(user => {
      // User was successfully created
      //console.log(user)
      callback(null, user);
    })
    .catch(error => {
      // do something with error
      callback(error);
    });
});

passport.use('sign-up', signUpStrategy);


const signInStrategy = new PassportLocalStrategy({}, (username, password, callback) => {
  let user;
  User.findOne({
    username
  })
    .then(document => {
      user = document;
      if (document) {
        return bcrypt.compare(password, user.passwordHash);
      } else {
        return Promise.reject(new Error('USER_DOES_NOT_EXIST'));
      }
    })
    .then(passwordMatches => {
      if (passwordMatches) {
        //console.log(user)
        callback(null, user);
      } else {
        return Promise.reject(new Error('PASSWORD_DOES_NOT_MATCH'));
      }
    })
    .catch(error => {
      callback(error);
    });
});

passport.use('sign-in', signInStrategy);

