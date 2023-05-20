const router = require('express').Router();
const Team = require('../models/Team.model');
const Player = require('../models/Player.model');
const User = require('../models/User.model');
const RandomSelector = require('../random-selection');
const flatpickr = require("flatpickr");
const Game = require("../models/Game.model");

// const fileUpload = require("../config/cloudinary")

//middleware to only access the route if the conditions match
function requireLogin(req, res, next) {
  if (req.session.currentUser) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Get Teams/create
router.get('/teams/create', requireLogin, (req, res) => {
  res.render('teams/team-create');
});

// Create Team
router.post('/teams/create', requireLogin, async (req, res) => {
  const { name } = req.body;

  const newTeam = await Team.create({
    name: name,
    owner: req.session.currentUser._id
  });

  // console.log("NEW TEAM: ")
  // console.log(newTeam)
  res.redirect(`/team/${newTeam.id}`);
});

// Team Details

router.get('/team/:id', requireLogin, async (req, res) => {
  const getTeam = await Team.findById(req.params.id).populate('players');
  res.render('teams/team-details', getTeam);
});

router.post('/team/:id', requireLogin, async (req, res) => {
  const getTeam = await Team.findById(req.params.id).populate('players');

  const { playerName, email, rate } = req.body;
  let player = await Player.findOne({ email });

  if (!player) {
    player = await Player.create({
      name: playerName,
      email,
      rate
    });
  }

  const updatedTeam = await Team.findByIdAndUpdate(getTeam.id, {
    players: [...getTeam.players, player]
  });
  // console.log(updatedTeam)

  res.redirect(`/team/${getTeam.id}`);
});

// Deleting players from the team without deleting from db
router.post(
  '/team/:id/delete-player/:playerId',
  requireLogin,
  async (req, res) => {
    const teamId = req.params.id;
    const playerId = req.params.playerId;

    // find the team needed
    const team = await Team.findById(teamId).populate('players');

    // remove the player from the team using .filter
    team.players = team.players.filter(player => player.id !== playerId);

    // save the updated team
    await team.save();

    res.redirect(`/team/${teamId}`);
  }
);

// Delete a Team
router.post('/team/:id/delete', requireLogin, async (req, res) => {
  const teamId = req.params.id;

  await Team.findByIdAndDelete(teamId);

  res.redirect('/teams');
});

// Teams list route
router.get('/teams', requireLogin, async (req, res) => {
  // console.log(req.session.currentUser._id)
  const teamsList = await Team.find({ owner: req.session.currentUser._id });
  // console.log(teamsList)
  res.render('teams/teams-list', { teamsList });
});

//Generate random teams

router.post('/team/generate/:id', requireLogin, async (req, res) => {
  const generateForm = req.body.playername;
  console.log('PLAYERS SELECTED:');
  console.log(generateForm);

  const randomTeams = await RandomSelector(generateForm);
  console.log(`Random Teams: ${randomTeams}`);

  res.render(`teams/random-team`, { randomTeams, id: req.params.id });
});

// Save random random teams in db

router.post('/team/:id/starred', requireLogin, async (req, res) => {
  const {
    playerNameOne,
    emailOne,
    rateOne,
    teamOneRate,
    playerNameTwo,
    emailTwo,
    rateTwo,
    teamTwoRate
  } = req.body;

  let teamOne = [];
  let teamTwo = [];

  for (let i = 0; i < playerNameOne.length; i++) {
    teamOne.push({
      name: playerNameOne[i],
      email: emailOne[i],
      rate: rateOne[i]
    });
  }

  for (let i = 0; i < playerNameTwo.length; i++) {
    teamTwo.push({
      name: playerNameTwo[i],
      email: emailTwo[i],
      rate: rateTwo[i]
    });
  }

  const getTeam = await Team.findById(req.params.id);

  const addStarredTeam = await Team.findByIdAndUpdate(req.params.id, {
    starred: [
      ...getTeam.starred,
      {
        id: getTeam.starred.length + 1,
        OneTeam: [...teamOne],
        TwoTeam: [...teamTwo]
      }
    ]
  });
  // console.log('Team from DB');
  // console.log(getTeamfinal);

  res.redirect(`/team/${req.params.id}`);
});

// Schedule games
router.get("/teams/schedule", requireLogin, async (req, res) => {
  const teamsList = await Team.find({owner: req.session.currentUser._id})
  res.render("teams/team-schedule", {teamsList});
})

router.post("/teams/save-date", requireLogin, async (req, res) => {
    const { teamId, selectedDate } = req.body;

    const team = await Team.findById(teamId);
    team.nextGameDate = selectedDate;

    const newGame = new Game({
      scheduledDate: selectedDate,
    });

    team.games.push(newGame);
    await team.save();

    const updatedTeam = await Team.findById(teamId);

    res.redirect("/teams/schedule");
    // TO DO: when we redirect, instead of the placeholder should show the saved date
});

module.exports = router;
