const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, minlength: 3, maxlength: 25 },
    password: { type: String, required: true },
    membership_status: { type: String, enum: ['User', 'Member', 'Admin'], default: 'User', required: true  }
  }
);

module.exports = mongoose.model('User', UserSchema);