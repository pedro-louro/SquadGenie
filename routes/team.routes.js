const router = require("express").Router();
const Team = require("../models/Team.model")
const Player = require("../models/Player.model")

// const fileUpload = require("../config/cloudinary")

//create middleware to only access the route if the conditions match
//then add this function to the routes we want
// function requireLogin(req, res, next) {
//   if (req.session.currentUser) {
//     next();
//   }
//   else{
//     res.redirect("/login")
//   }
// }


// Get Teams/create
router.get("/teams/create", (req, res) => {
  res.render("teams/team-create")
});

// Create Team, player and link them
router.post("/teams/create", async (req,res) => {

  const {name, playerName, email, rate} = req.body;
  let player = await Player.findOne({email});

  if (!player) {
    player = await Player.create({
      name: playerName,
      email,
      rate
    })
  }
  // console.log(`player is: ${player}`)

  await Team.create({name: name, players: player.id});
  res.redirect("/")

})

module.exports = router; 