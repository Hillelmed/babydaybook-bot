const mongoose = require('mongoose');
const url = process.env.MONGO_URL;
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
module.exports = mongoose;
