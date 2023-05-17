const router = require("express").Router();
const Team = require("../models/Team.model")
const Player = require("../models/Player.model")
const User = require("../models/User.model")
const RandomSelector = require("../random-selection")


// const fileUpload = require("../config/cloudinary")

//middleware to only access the route if the conditions match
function requireLogin(req, res, next) {
  if (req.session.currentUser) {
    next();
  }
  else{
    res.redirect("/login")
  }
}

// Get Teams/create
router.get("/teams/create",requireLogin, (req, res) => {
  res.render("teams/team-create")
});

// Create Team
router.post("/teams/create", requireLogin, async (req,res) => {

  const {name} = req.body;

  const newTeam = await Team.create({name: name, owner: req.session.currentUser._id});

  // console.log("NEW TEAM: ")
  // console.log(newTeam)
  res.redirect(`/team/${newTeam.id}`)

})

// Team Details

router.get("/team/:id", requireLogin, async (req, res) => {
  const getTeam = await Team.findById(req.params.id).populate("players");
  res.render("teams/team-details", getTeam)
})

router.post("/team/:id", requireLogin, async (req, res) => {
  const getTeam = await Team.findById(req.params.id).populate("players");

  const {playerName, email, rate} = req.body;
  let player = await Player.findOne({email});

  if (!player) {
    player = await Player.create({
      name: playerName,
      email,
      rate
    })
  }

  const updatedTeam = await Team.findByIdAndUpdate(getTeam.id,{
    players:[...getTeam.players, player]
  })
  // console.log(updatedTeam)
  
  res.redirect(`/team/${getTeam.id}`)
})

// Deleting players from the team without deleting from db
router.post("/team/:id/delete-player/:playerId", requireLogin, async (req, res) => {
  const teamId = req.params.id;
  const playerId = req.params.playerId;

  // find the team needed
  const team = await Team.findById(teamId).populate("players");

  // remove the player from the team using .filter
  team.players = team.players.filter(player => player.id !== playerId);

  // save the updated team
  await team.save();

  res.redirect(`/team/${teamId}`)
})

// Delete a Team
router.post("/team/:id/delete", requireLogin, async (req,res) => {
  const teamId = req.params.id;

  await Team.findByIdAndDelete(teamId);

  res.redirect("/teams");
})

// Teams list route
router.get("/teams", requireLogin, async(req, res) => {
  // console.log(req.session.currentUser._id)
  const teamsList = await Team.find({owner: req.session.currentUser._id})
  // console.log(teamsList)
  res.render("teams/teams-list", {teamsList})
})

//Generate random teams 

router.post("/team/generate/:id", requireLogin, async (req,res) => {
  const generateForm = req.body.playername;
  console.log("PLAYERS SELECTED:")
  console.log(generateForm)

  const randomTeams = RandomSelector(generateForm)
  console.log(randomTeams);

  // TODO: show the random function results in the team-details view secong modal
  res.render(`teams/random-team`, {randomTeams, id: req.params.id})
})

// Schedule games
router.get("/teams/mygames", requireLogin, async (req, res) => {
  const teamsList = await Team.find({owner: req.session.currentUser._id})
  res.render("teams/team-schedule", {teamsList});
})


module.exports = router;