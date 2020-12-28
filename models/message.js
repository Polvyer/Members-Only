const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  }
);

MessageSchema
  .virtual('url')
  .get(function() {
    return '/delete/' + this._id;
  })

module.exports = mongoose.model('Message', MessageSchema);