function randomSelect(playersArray) {
  //shuffle the position of each item (player) of the array
  for (let i = playersArray.length - 1; i > 0; i--) {
    const random = Math.floor(Math.random() * (i + 1));
    const temporary = playersArray[i];
    playersArray[i] = playersArray[random];
    playersArray[random] = temporary;
  }
  //divide the number of players by two (two teams)
  const numberOfPlayers = Math.round(playersArray.length / 2)
  //create two teams based on the previous division
  const teamOne = playersArray.slice(0, numberOfPlayers)
  const teamTwo = playersArray.slice(numberOfPlayers, playersArray.length)
  // check the avg of the ratings
  const sumTeamOne = teamOne.reduce((acc, current) =>  {
    return acc + current.rate
  },0);
  const sumTeamTwo = teamTwo.reduce((acc, current) =>  {
    return acc + current.rate
  },0);

  const avgTeamOne = sumTeamOne / teamOne.length
  const avgTeamTwo = sumTeamTwo / teamTwo.length
  
  // condition to check if the teams are unballanced (difference betwen avgs is too big)
  // or if the teams balanced
  if(avgTeamOne - avgTeamTwo > 1.5 || avgTeamTwo - avgTeamOne > 1.5) {
    console.log(`Called function again. AVG difference = ${avgTeamOne - avgTeamTwo} or ${avgTeamTwo - avgTeamOne}`)
    randomSelect(playersArray)
  }
  else {
    const randomTeams = {
      finalTeamOne: [...teamOne],
      finalTeamTwo: [...teamTwo]
    }

    console.log(randomTeams)
    console.log(`AVG difference = ${avgTeamOne - avgTeamTwo} or ${avgTeamTwo - avgTeamOne}`)
    return randomTeams
  }
}

module.exports = randomSelect; 