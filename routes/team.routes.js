const router = require("express").Router();
const Team = require("../models/Team.model")
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


// get all the teams
router.get("/teams/create", (req, res) => {
  res.render("teams/team-create")
});

module.exports = router;