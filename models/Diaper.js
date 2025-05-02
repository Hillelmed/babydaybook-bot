const { Schema, model } = require('mongoose');

const diaperSchema = new Schema({
  type: { type: String, enum: ['pee','poop'], required: true },
  timestamp: { type: Date, required: true }
});

module.exports = model('Diaper', diaperSchema);
