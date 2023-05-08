const {Schema, model} = require("mongoose");

const teamSchema = new Schema(
  {
  name: String,
  players: [{type: Schema.Types.ObjectId, ref: "Player"}],
  games: Array,
  owner: {type: Schema.Types.ObjectId, ref: "User"},
  },
  {
    timestamps: true,
  }
);

const teamModel = model("Team", teamSchema);

module.exports = teamModel;
//