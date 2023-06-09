const { Schema, model } = require('mongoose');
const Game = require('./Game.model');

const teamSchema = new Schema(
  {
    name: String,
    players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    games: Array,
    starred: Array,
    owner: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true
  }
);

const teamModel = model('Team', teamSchema);

module.exports = teamModel;
//
