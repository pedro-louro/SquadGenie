const Player = require('./models/Player.model');

async function randomSelect(playersArray) {
  try {
    //shuffle the position of each item (player) of the array
    for (let i = playersArray.length - 1; i > 0; i--) {
      const random = Math.floor(Math.random() * (i + 1));
      const temporary = playersArray[i];
      playersArray[i] = playersArray[random];
      playersArray[random] = temporary;
    }
    //divide the number of players by two (two teams)
    const numberOfPlayers = Math.round(playersArray.length / 2);
    //create two teams based on the previous division
    const teamOne = playersArray.slice(0, numberOfPlayers);
    const teamTwo = playersArray.slice(numberOfPlayers, playersArray.length);

    // check the avg of the ratings
    let teamOneAvg = [];
    for (const player of teamOne) {
      const dbPlayer = await Player.findById(player);
      teamOneAvg.push({
        name: dbPlayer.name,
        email: dbPlayer.email,
        rate: dbPlayer.rate
      });
    }

    let teamTwoAvg = [];
    for (const player of teamTwo) {
      const dbPlayer = await Player.findById(player);
      teamTwoAvg.push({
        name: dbPlayer.name,
        email: dbPlayer.email,
        rate: dbPlayer.rate
      });
    }

    const sumTeamOne = teamOneAvg.reduce((acc, current) => {
      return acc + current.rate;
    }, 0);
    const sumTeamTwo = teamTwoAvg.reduce((acc, current) => {
      return acc + current.rate;
    }, 0);

    const avgTeamOne = sumTeamOne / teamOneAvg.length;
    const avgTeamTwo = sumTeamTwo / teamTwoAvg.length;

    // condition to check if the teams are unballanced (difference betwen avgs is too big)
    // or if the teams balanced
    if (avgTeamOne - avgTeamTwo > 1.5 || avgTeamTwo - avgTeamOne > 1.5) {
      console.log(
        `Called function again. AVG difference = ${
          avgTeamOne - avgTeamTwo
        } or ${avgTeamTwo - avgTeamOne}`
      );
      const randomTeam = await randomSelect(playersArray);
      return randomTeam;
    } else {
      const randomTeams = {
        finalTeamOne: [...teamOneAvg, avgTeamOne],
        finalTeamTwo: [...teamTwoAvg, avgTeamTwo]
      };

      console.log(randomTeams);
      console.log(
        `AVG difference = ${avgTeamOne - avgTeamTwo} or ${
          avgTeamTwo - avgTeamOne
        }`
      );
      return randomTeams;
    }
  } catch (e) {
    return e;
  }
}

module.exports = randomSelect;
