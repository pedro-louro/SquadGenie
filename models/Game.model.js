const {Schema, model} = require("mongoose");

const gameSchema = new Schema({
    scheduledDate: {
        type: Date,
        required: true,
    },
});

const Game = model("Game", gameSchema);

module.exports = Game;