const {Schema, model} = require("mongoose");

const playerSchema = new Schema({
  name: String,
  email: String,
  rate: Number,
  picture: String,
});

const Player = model("Player", playerSchema);

module.exports = Player;