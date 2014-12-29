define([], function() {

  // The needed definitions
  
  var temp;
  // Cannot put non-chart values in these mappings!
  var batMapStrict = ["so", "gb", "fb", "bb", "1b", "1b+", "2b", "3b", "hr"];
  var pitMapStrict = ["pu", "so", "gb", "fb", "bb", "1b", "2b", "hr"];
  var batMap = {
    0 : "so",
    1 : "gb",
    2 : "fb",
    3 : "bb",
    4 : "1b",
    5 : "1b+",
    6 : "2b",
    7 : "3b",
    8 : "hr",
    // We have to track every result even though you can only get results on certain charts!
    // Hence results are mapped to trackable values.
    "so" : 0,
    "gb" : 1,
    "fb" : 2,
    "bb" : 3,
    "1b" : 4,
    "1b+": 5,
    "2b" : 6,
    "3b" : 7,
    "hr" : 8,
    "pu" : 2 // batter sees a flyball
  };
  var pitMap= {
    0 : "pu",
    1 : "so",
    2 : "gb",
    3 : "fb",
    4 : "bb",
    5 : "1b",
    6 : "2b",
    7 : "hr",
    // We have to track every result even though you can only get results on certain charts!
    // Hence results are mapped to trackable values.
    "pu" : 0,
    "so" : 1,
    "gb" : 2,
    "fb" : 3,
    "bb" : 4,
    "1b" : 5,
    "2b" : 6,
    "hr" : 7,
    "1b+": 5, // pitcher sees a normal single
    "3b" : 6  // pitcher sees a double
  };
  
  var sig = 100; // sig = statistically significant
  var numGames = 162;
  
  
  //var score = 0; // clear score
  // A place to hold the raw results of the simulation
  var batterTallies = [
    [[0,0,0,0,0,0,0,0,0],[0,0/*How many steals*/,0/*Fielding representation*/]],
    [[0,0,0,0,0,0,0,0,0],[0,0,0]],
    [[0,0,0,0,0,0,0,0,0],[0,0,0]],
    [[0,0,0,0,0,0,0,0,0],[0,0,0]],
    [[0,0,0,0,0,0,0,0,0],[0,0,0]],
    [[0,0,0,0,0,0,0,0,0],[0,0,0]],
    [[0,0,0,0,0,0,0,0,0],[0,0,0]],
    [[0,0,0,0,0,0,0,0,0],[0,0,0]],
    [[0,0,0,0,0,0,0,0,0],[0,0,0]]
  ];
  // Don't know what the group pitcherTallies[0][1] is for yet
  var pitcherTallies = [
    [[0,0,0,0,0,0,0,0],[0,0]]
  ];
  
  var abres = ''; // current batter's result
  
  var batters;
  var pitchers;
  
  
  
  
  /****************** THE ACTUAL SIMULATION CODE *********************/
  //Requirements:
  //  Return the average statistics of the players passed in.
  //    * passed exactly 9 batters (there is a single batter flag) and 1 pitcher.
  //    * return the average number of each result as a percentage of average number of plate appearances
  // The function simulates a large number of innings played, and does that many times to average the results. 
  //
  // If defense is to be used: defense[0] = catcher throwing
  //                           defense[1] = infield
  //                           defense[2] = outfield
  // If defense to be ignored: defense = 0
  function run(b, p, defense){
    // Set so other methods can access
    batters = b;
    pitchers = p;
    temp = new Array();
    var curBatter = 0; // set first batter
    var curBatterSpeed;
    
    // Convert the player values to numbers as they come in as strings
    for (var i = 0; i < batters.length; i++) {
      for (var j in batters[i]) {
        if(j != "name"){
          batters[i][j] = Number(batters[i][j]);
        }
      }
    }
    for (var i = 0; i < pitchers.length; i++) {
      for (var j in pitchers[i]) {
        if(j != "name"){
          pitchers[i][j] = Number(pitchers[i][j]);
        }
      }
    }
    
    // // check that all charts add up to 20
    // for (var i = 0; i < batters.length; i++) {
      // var sum = 0;
      // for (var f = 0; f < batters[i][0].length; f++) {
        // sum += batters[i][0][f];
      // }
      // console.log(sum);
    // }

    // to contain results of each simulation to be averaged together
    
    for (var a = 0; a < sig; a++){
      // Reset everything for next round of simulation
      // status[0] = score.
      // status[1] = speed of batter on first, -1 if vacant
      // status[2] = speed of batter on second, -1 if vacant
      // status[3] = speed of batter on third, -1 if vacant
      // status[4] = number of outs.
      var status = [0, -1, -1, -1, 0]; // Nobody is on base to start with! 
      //score = 0;
      batterTallies = [
        [[0,0,0,0,0,0,0,0,0],[0,0/*How many steals*/,0/*Fielding representation*/]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]]
      ];
      pitcherTallies = [
        [[0,0,0,0,0,0,0,0],[0,0]]
      ];
      curBatter = 0;
      abres = '';
      
      // We can play as many innings as we want, in multiples of 9 to keep things even.
      for (var i = 1; i <= 9*numGames; i++) {
        status[4] = 0;
        // end inning after 3 outs
        while(status[4] < 3){
          abres = getResultAtBat(curBatter);
          //console.log(abres);
          // Out result
          if(abres == "pu" || abres == "so" || abres == "gb" || abres == "fb"){
            status[4]++;
          }
          // Not an out result
          else{
            curBatterSpeed = batters[curBatter]["sp"];
            status = advanceRunners(defense, curBatterSpeed, status);
          }
          // Save statistics for display
          logResult(curBatter);
          // Next batter
          curBatter = (curBatter + 1) % 9;
          if(status[4] < 3){
            //console.log("Batter "+ curBatter + " up. Inning " + i + ": " + outs + " outs.");
          }
          else{
            //console.log("Inning over. Moving to the "+ (i+1));
          }
          //return;
        }
        // Inning over. Clear the basses
        status[1] = -1;
        status[2] = -1;
        status[3] = -1;
      }
      // Games over
      status[0] /= numGames;
      //console.log(pitcherTallies);
      //console.log(batterTallies);
      // Transform what logResult does into the statistics that will be output
      temp.push(transformRawResultsToStatistics(status));
      //return;
      //console.log("Simulation results: ");
    
    }

    //console.log(temp);
    // true flag means 9 batters, false means one
    results = averageResults(true); // to contain all results of simulation as json to be displayed in browser
    //console.log(results);
    return JSON.stringify(results, function(key, val) {
      return val.toFixed ? Number(val).toFixed(4).replace(/^0+/, '') : val;
    });
    // End simulation logic
  }

    
    
    function getResultAtBat(curBatter){
      // console.log("**********");
      // console.log(curBatter);
      // console.log(batters[curBatter][1]);
      // console.log(batters[curBatter][0]);
      // Which chart?
      var pitch = roll();
      if(pitch + Number(pitchers[0]['c']) > Number(batters[curBatter]['ob'])){ // pitcher has advantage!
        return getSwingResult("p", curBatter);
      }
      else{ // batter has advantage!
        return getSwingResult("b", curBatter);
      }
      
    }
    
    function getSwingResult(chart, curBatter){
      var swing = roll();
      //console.log(swing);
      var inc = 0;
      switch(chart){
        case "p":
          for(var x = 0; x < pitMapStrict.length; x++) {
            inc += Number(pitchers[0][pitMapStrict[x]]);
            if(swing <= inc){
              return pitMap[x];
            }
          }
          console.log("Error: No result found on pitcher's chart.");
          break;
        case "b":
          for(var x = 0; x < batMapStrict.length; x++) {
            inc += Number(batters[curBatter][batMapStrict[x]]);
            if(swing <= inc){
              return batMap[x];
            }
          }
          console.log("Error: No result found on batter's chart.");
          break;
        default:
          console.log("Error: don't know whose chart to look at.");
      }
    }

    // Also keeps the score
    function advanceRunners(defense, curBatterSpeed, status){
      switch(abres){
        case "gb":
          return result_gb(defense, curBatterSpeed, status);
          break;
        case "fb":
          return result_fb(defense, curBatterSpeed, status);
          break;
        case "bb":
          return result_bb(defense, curBatterSpeed, status);
          break;
        case "1b":
          return result_1b(defense, curBatterSpeed, status);
          break;
        case "1b+":
          return result_1bplus(defense, curBatterSpeed, status);
          break;
        case "2b":
          return result_2b(defense, curBatterSpeed, status);
          break;
        case "3b":
          return result_3b(defense, curBatterSpeed, status);
          break;
        case "hr":
          return result_hr(defense, curBatterSpeed, status);
          break;
        default:
          console.error("Error: Can't advance runners because hittype not valid.");
      }
    }
    
    function result_gb(defense, curBatterSpeed, status){
      return status;
    }
    function result_fb(defense, curBatterSpeed, status){
      return status;
    }
    
    // Move runners after a walk
    function result_bb(defense, curBatterSpeed, status){
      // No difference if using defense
      if(status[1] != -1){
        if(status[2] != -1){
          if(status[3] != -1){
            // runners on every base...
            status[0]++;
            status[3] = status[2];
            status[2] = status[1];
            status[1] = curBatterSpeed;
          }
          else{
            // runners on first and second, not third...
            status[3] = status[2];
            status[2] = status[1];
            status[1] = curBatterSpeed;
          }
        }
        else{
          // runner on first, not second...
          status[2] = status[1];
          status[1] = curBatterSpeed;
        }
      }
      else{
        // nobody on first...
        status[1] = curBatterSpeed;
      }
      return status;
    }
    
    // Move runners after a single
    function result_1b(defense, curBatterSpeed, status){
      if(defense.length != 3){
        if(status[3] != -1){ // runner on third scores
          status[0]++;
          status[3] = -1;
        }
        if(status[2] != -1){ // runner on second goes to third
          status[3] = status[2];
          status[2] = -1;
        }
        if(status[1] != -1){ // runner on first goes to second
          status[2] = status[1];
        }
        status[1] = curBatterSpeed; // and batter occupies first
      }
      else{ // Use defense
        if(status[3] != -1){ // runner on third scores
          status[0]++;
          status[3] = -1;
        }
        if(status[2] != -1){ // runner on second goes to third, then tries for home
          status[3] = status[2];
          status[2] = -1;
          if(roll() + defense[2] > status[3] + 5){
            status[3] = -1;
            status[4]++;
          }
          else{
            status[3] = -1;
            status[0]++;
          }
        }
        if(status[1] != -1){ // runner on first goes to second
          status[2] = status[1];
        }
        status[1] = curBatterSpeed; // and batter occupies first
      }
      return status;
    }
    
    // Move runners on a single plus
    function result_1bplus(defense, curBatterSpeed, status){
      if(defense.length != 3){
        if(status[3] != -1){ // runner on third scores
          status[0]++;
          status[3] = -1;
        }
        if(status[2] != -1){ // runner on second goes to third
          status[3] = status[2];
          status[2] = -1;
        }
        if(status[1] != -1){ // runner on first goes to second, batter goes to first
          status[2] = status[1];
          status[1] = curBatterSpeed;
        }else{ // no runner on first: batter takes second
          status[2] = curBatterSpeed;
        }
      }
      // else{ // Use defense
        // if(status[2] != -1){ // runner on third scores
          // score++;
          // status[2] = -1;
        // }
        // if(status[1] != -1){ // runner on second goes to third, then tries for home
          // status[2] = status[1];
          // status[1] = -1;
          // if(roll() + outfield > batters[status[2]]["sp"] + 5){
            // status[2] = -1;
            // outs++;
          // }
          // else{
            // status[2] = -1;
            // score++;
          // }
        // }
        // if(status[0] != -1){ // runner on first goes to second, batter goes to first
          // status[1] = status[0];
          // status[0] = curBatter;
        // }else{ // no runner on first: batter takes second
          // status[1] = curBatter;
        // }
      // }
      return status;
    }
    
    // Move runners from a double
    function result_2b(defense, curBatterSpeed, status){
      if(defense.length != 3){
        if(status[3] != -1){ // runner on third scores
          status[0]++;
          status[3] = -1;
        }
        if(status[2] != -1){ // runner on second scores
          status[0]++;
          status[2] = -1;
        }
        if(status[1] != -1){ // runner goes first to third
          status[3] = status[1];
          status[1] = -1;
        }
        status[2] = curBatterSpeed; // batter stands on second
      }
      // else{ // Use defense
        // if(status[2] != -1){ // runner on third scores
          // score++;
          // status[2] = -1;
        // }
        // if(status[1] != -1){ // runner on second scores
          // score++;
          // status[1] = -1;
        // }
        // if(status[0] != -1){ // runner goes first to third, and tries to score
          // status[2] = status[0];
          // status[0] = -1;
          // if(roll() + outfield > batters[status[2]]["sp"] + 5){
            // status[2] = -1;
            // outs++;
          // }
          // else{
            // status[2] = -1;
            // score++;
          // }
        // }
        // status[1] = curBatter; // batter stands on second
      // }
      return status;
    }
    
    // Move runners on triple
    function result_3b(defense, curBatterSpeed, status){
      // No difference with defence
      if(status[1] != -1){ // everybody scores!
        status[0]++;
        status[1] = -1;
      }
      if(status[2] != -1){
        status[0]++;
        status[2] = -1;
      }
      if(status[3] != -1){
        status[0]++;
        status[3] = -1;
      }
      status[3] = curBatterSpeed; // and the batter stands on third
      return status;
    }
    
    // Move runners on a hr
    function result_hr(defense, curBatterSpeed, status){
      if(status[1] != -1){ // everybody scores!
        status[0]++;
        status[1] = -1;
      }
      if(status[2] != -1){
        status[0]++;
        status[2] = -1;
      }
      if(status[3] != -1){
        status[0]++;
        status[3] = -1;
      }
      status[0]++;
      return status;
    }

    // Ubiquitous!
    function roll(){
      return Math.ceil(Math.random() * 20);
    }
    
    // Where the defense action is at!
    function fieldingCheck(){
      if(roll() + defense[2] > status[3] + 5){
            status[3] = -1;
            status[4]++;
          }
          else{
            status[3] = -1;
            status[0]++;
          }
    }

    function logResult(curBatter){
      //console.log(abres);
      pitcherTallies[0][0][pitMap[abres]]++;
      batterTallies[curBatter][0][batMap[abres]]++;
    }
    
    // build 'results'
    // results has 11 items:
    // The first 9 are batters, then pitcher, then score
    function transformRawResultsToStatistics(status){
      var r = new Array();
      // Access a specific raw value with batterTallies[batterIndex][0][resultOfAtbat]
      // Compute each (resultOfAtbat/Plate Appearances), as well as OBP
      
      //Batters
      for (var i = 0; i < batterTallies.length; i++) {
        var PA = batterTallies[i][0].reduce(function(a, b) {return a + b;});
       // remember PU are eaten up by FB
        r.push({"SO/PA": batterTallies[i][0][batMap["so"]] / PA, 
        "GB/PA": batterTallies[i][0][batMap["gb"]] / PA, 
        "FB/PA": batterTallies[i][0][batMap["fb"]] / PA, 
        "BB/PA": batterTallies[i][0][batMap["bb"]] / PA, 
        "1B/PA": batterTallies[i][0][batMap["1b"]] / PA, 
        "1B+/PA": batterTallies[i][0][batMap["1b+"]] / PA, 
        "2B/PA": batterTallies[i][0][batMap["2b"]] / PA, 
        "3B/PA": batterTallies[i][0][batMap["3b"]] / PA, 
        "HR/PA": batterTallies[i][0][batMap["hr"]] / PA, 
        "OBP": (batterTallies[i][0][batMap["bb"]] + batterTallies[i][0][batMap["1b"]] + batterTallies[i][0][batMap["1b+"]] + batterTallies[i][0][batMap["2b"]] + batterTallies[i][0][batMap["3b"]] + batterTallies[i][0][batMap["hr"]]) / PA
        });
      }
      //Pitchers
      for (var i = 0; i < pitcherTallies.length; i++) {
        // remember 1B+ and 3B are eaten up by 1B and 3B
        var PA = pitcherTallies[i][0].reduce(function(a, b) {return a + b;});
         // remember PU are eaten up by FB
        r.push({"PU/PA": pitcherTallies[i][0][pitMap["pu"]] / PA,
        "SO/PA": pitcherTallies[i][0][pitMap["so"]] / PA, 
        "GB/PA": pitcherTallies[i][0][pitMap["gb"]] / PA, 
        "FB/PA": pitcherTallies[i][0][pitMap["fb"]] / PA, 
        "BB/PA": pitcherTallies[i][0][pitMap["bb"]] / PA, 
        "1B/PA": pitcherTallies[i][0][pitMap["1b"]] / PA,
        "2B/PA": pitcherTallies[i][0][pitMap["2b"]] / PA, 
        "HR/PA": pitcherTallies[i][0][pitMap["hr"]] / PA, 
        "OBP": (pitcherTallies[i][0][pitMap["bb"]] + pitcherTallies[i][0][pitMap["1b"]] + pitcherTallies[i][0][pitMap["2b"]] + pitcherTallies[i][0][pitMap["hr"]]) / PA
        });
      }
      
      // Score
      r.push({"Score" : status[0]});
      return r;
    }
    
    // Take temp and average all the values over number of simulation runs
    // At this point temp contains:
    //       temp[simNumber][batterNo,pitcher,score][each value]
    // n^3...ugh
    function averageResults(nineBatters){
      // Initialize an array
      // var r = zeros([batters.length,batters[0][0].length]);
      // function zeros(dim){
        // var array = [];
        // for (var i = 0; i < dim[0]; ++i) {
          // array.push(dim.length == 1 ? 0 : zeros(dim.slice(1)));
        // }
        // return array;
      // }
      var r = [];
      for (i = 0; i < batters.length; i++) {
        r.push({"SO/PA": 0,"GB/PA": 0,"FB/PA": 0,"BB/PA": 0,"1B/PA": 0,"1B+/PA": 0,"2B/PA": 0,"3B/PA": 0,"HR/PA": 0, "OBP": 0});
      }
      
      // Add up first...
      // for each of the simulation runs
      for (var i = 0; i < temp.length; i++) {
        // for each of the batters, pitcher, score, whatever is there
        for (var j = 0; j < 9; j++){// the first 9 are batters
          // for each of the attributes of said batter
          for (var k in temp[i][j]){
            // add the results from each of the simulations
            r[j][k] += temp[i][j][k];
          }
        }
      }
      
      // ...also the pitcher...
      r.push({"PU/PA": 0,"SO/PA": 0,"GB/PA": 0,"FB/PA": 0,"BB/PA": 0,"1B/PA": 0,"2B/PA": 0,"HR/PA": 0, "OBP": 0});
      // for each of the simulation runs
      for (var i = 0; i < temp.length; i++) {
        // for each of the attributes of the pitcher
        for (var k in temp[i][9]){
          // add the results from each of the simulations
          r[9][k] += temp[i][9][k];
        }
      }
      
     // ...also the score...
      r.push({"Score": 0});
      // for each of the simulation runs
      for (var i = 0; i < temp.length; i++) {
        // add the score
        r[10]["Score"] += temp[i][10]["Score"];
      }
      
      // ...and then divide to average...
      for (i = 0; i < r.length; i++){
        for (var j in r[i]){ //console.log(j);return r;
          r[i][j] /= sig;
        }
      }
      //console.log(temp);
      //console.log(r);
      return r;
    }
    
  return {
    run:run,
    roll:roll,
    result_gb: result_gb,
    result_fb: result_fb,
    result_bb: result_bb,
    result_1b: result_1b,
    result_1bplus: result_1bplus,
    result_2b: result_2b,
    result_3b: result_3b,
    result_hr: result_hr
  };
});