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

  const newTeam = await Team.create({name: name, players: player.id});
  res.redirect(`/team/${newTeam.id}`)

})

// Team ID route

router.get("/team/:id", async (req, res) => {
  const getTeam = await Team.findById(req.params.id).populate("players");
  console.log(getTeam.players[0])

  res.render("teams/team-details", {getTeam})
})

router.post("/team/:id", async (req, res) => {
  const getTeam = await Team.findById(req.params.id).populate("players");

  const {name, playerName, email, rate} = req.body;
  let player = await Player.findOne({email});

  if (!player) {
    player = await Player.create({
      name: playerName,
      email,
      rate
    })
  }

  // TODO:
  // Update Team by adding new player
  // Display players list in the Team details page
  res.render("teams/team-details", {getTeam})
})

module.exports = router; 