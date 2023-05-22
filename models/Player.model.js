const { Schema, model } = require('mongoose');

const playerSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  rate: Number,
  picture: String
  // user: { type: Schema.Types.ObjectId, ref: 'User' }
  // teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }]
});

const Player = model('Player', playerSchema);

module.exports = Player;
