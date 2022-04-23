const mongoose = require("mongoose")
const LinkData = mongoose.Schema({
  link: String,
  name: String,
  ID: String,
  created: String
  
})
module.exports = mongoose.model('links', LinkData)