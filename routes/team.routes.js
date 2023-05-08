const router = require("express").Router();
const Team = require("../models/Team.model")
const Player = require("../models/Player.model")

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

  const newTeam = await Team.create({name: name});
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
  console.log(updatedTeam)
  
  res.redirect(`/team/${getTeam.id}`)
})

module.exports = router; 