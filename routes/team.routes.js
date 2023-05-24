const router = require('express').Router();
const Team = require('../models/Team.model');
const Player = require('../models/Player.model');
const User = require('../models/User.model');
const RandomSelector = require('../random-selection');
const flatpickr = require('flatpickr');
const Game = require('../models/Game.model');

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

  res.redirect(`/team/${newTeam.id}`);
});

// Team Details

router.get('/team/:id', requireLogin, async (req, res) => {
  const getTeam = await Team.findById(req.params.id).populate('players');
  res.render('teams/team-details', getTeam);
});

// Add player to team
router.post('/team/:id', requireLogin, async (req, res) => {
  const getTeam = await Team.findById(req.params.id).populate('players');

  const { playerName, email, rate } = req.body;
  let player = await Player.findOne({ email });

  if (!player) {
    player = await Player.create({
      name: playerName,
      email,
      rate,
      teams: [req.params.id]
    });
  }

  const updatedTeam = await Team.findByIdAndUpdate(getTeam.id, {
    players: [...getTeam.players, player]
  });

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
  const teamsList = await Team.find({ owner: req.session.currentUser._id });

  //remove games older than today from the team.games array
  const dateNow = new Date();
  const changeFormat = dateNow.toISOString();
  const finalFormat = new Date(
    Date.UTC(
      Number(changeFormat.slice(0, 4)),
      Number(changeFormat.slice(5, 7)) - 1,
      Number(changeFormat.slice(8, 10))
    )
  );

  for (let i = 0; i < teamsList.length; i++) {
    const newArray = teamsList[i].games.filter(game => {
      if (game.length) {
        game.getTime() >= finalFormat.getTime();
      }
    });
    console.log(teamsList[i].id);
    console.log(newArray);
    await Team.findByIdAndUpdate(teamsList[i].id, { games: newArray });
  }

  const finalList = JSON.parse(JSON.stringify(teamsList));
  finalList.forEach(team => {
    if (team.games[0]) {
      {
        team.gameFormatted = team.games[0].toString().slice(0, 10);
      }
    }
  });
  res.render('teams/teams-list', { finalList });
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

//remove starred team
router.post('/team/:id/removeStarred', requireLogin, async (req, res) => {
  const getTeam = await Team.findById(req.params.id);
  const removeStarred = getTeam.starred.filter(
    team => team.id !== Number(req.body.startedTeamID)
  );

  const updateTeam = await Team.findByIdAndUpdate(req.params.id, {
    starred: removeStarred
  });
  res.redirect(`/team/${req.params.id}`);
});

// Schedule games
router.get('/teams/schedule', requireLogin, async (req, res) => {
  const teamsList = await Team.find({ owner: req.session.currentUser._id });
  res.render('teams/team-schedule', { teamsList });
});

router.post('/teams/save-date', requireLogin, async (req, res) => {
  const { teamId, selectedDate } = req.body;

  const team = await Team.findById(teamId);
  // team.nextGameDate = selectedDate;

  const newGame = new Game({
    scheduledDate: selectedDate
  });
  team.games.push(
    new Date(
      Date.UTC(
        Number(selectedDate.slice(6, 10)),
        Number(selectedDate.slice(3, 5)) - 1,
        Number(selectedDate.slice(0, 2))
      )
    )
  );
  await team.save();

  const updatedTeam = await Team.findById(teamId);

  updatedTeam.games.sort((date1, date2) => date1 - date2);
  await updatedTeam.save();

  res.redirect('/teams/schedule');
  // TO DO: when we redirect, instead of the placeholder should show the saved date
});

module.exports = router;
