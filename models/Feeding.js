const { Schema, model } = require('mongoose');

const feedingSchema = new Schema({
  amount: { type: Number, required: true },
  timestamp: { type: Date, required: true }
});

module.exports = model('Feeding', feedingSchema);
