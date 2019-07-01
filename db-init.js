
const mongoose = require('mongoose');
const moment = require('moment');

// Deprecation pre settings
mongoose.set('useFindAndModify', false);

// Loading schemas
const guardianSchema = require('./models/guardians');
const playersSchema = require('./models/players');
const teamsSchema = require('./models/teams');
const coachesSchema = require('./models/coaches');
const categoriesSchema = require('./models/categories');
const roosterSchema = require('./models/rooster');

// Loading JSON files containing mock data
const guardiansJson = require('./data/guardians.json');
const playersJson = require('./data/players.json');
const teamsJson = require('./data/teams.json');
const coachesJson = require('./data/coaches.json');
const categoriesJson = require('./data/categories.json');

// Connection string will depend on the Database configuration
const connectionString = "mongodb://localhost:27017/teams-api-test";

var DB;
const schema = {};
const jsonDataList = { 'guardians' : guardiansJson, 'players' : playersJson, 'coaches' : coachesJson, 'categories' : categoriesJson, 'teams' : teamsJson };

// connectDB sets the connection to the database
// the callback async function synchronizes the initialization scripts
connectDB().then(async (msg)=>{
        console.log(msg);
        try {
            await aWipeDB();
            await teamToPlayersRel();
            console.log(`OK: DB Initialization complete.`);
            
            // Delays closing the connection to the database enough
            // for the prior transactions to close
            // It avoids a flood of 'topology destroyed' warnins.
            setTimeout( function () {
                mongoose.disconnect();
            }, 1000);
        } catch (err) {
            console.log(`ERROR: DB Initialization failed: \n ${err}`);
        }
    }
).catch(
    (err)=>{
        console.log(err);
        return false;
    }
);

// fix the relationship between teams and players
async function teamToPlayersRel(){
    try {
        // retrieves the players, teams and categories collections
        // for further processing
        let playersList = await schema.players.find().exec();
        let teamsList = await schema.teams.find().exec();
        let categoriesList = await schema.categories.find().exec();

        for (player in playersList){

            let playerAge = moment(new Date()).diff(playersList[player].Birthdate, 'years', false); // defina rule for clasifying the age

            // Find player's category
            let category = categoriesList.find((cat)=>{
                    return cat.MinAge <= playerAge && cat.MaxAge >= playerAge;
                });

            // If category was found
            if(category){

                let teams = [];

                // Find teams from the category found that have availability
                teamsList.forEach(
                    (team)=>{
                        if(`${team.Category}` == `${category._id}` && team.Players < category.MaxPlayers)
                            teams.push(team);
                });

                // sort the teams, less occupied first. No effect if no teams were found.
                teams.sort(
                    (a ,b) =>{
                        return a.Players < b.Players ? -1 : 1;
                    }
                );

                // if at least one team was found, assign it to the player
                // increment the number of players in that team.
                if(teams.length > 0){
                    playersList[player].Team = teams[0]._id;
                    teams[0].Players++;
                } else {
                    // I no team has room for the player, no team can be assigned
                    playersList[player].Team = null;
                }

            } else {
                // I no category matches the player, no team can be assigned
                playersList[player].Team = null;
            }
            playersList[player].Category = category ? category._id : null;
        }

        // Update DB with the player's assignations
        playersList.forEach(async (player) =>{
            let query = {'_id': player._id};
            await schema.players.findOneAndUpdate(query, player, {upsert:true});
        });
        return `OK: "Players" collection successfully updated.`;
    } catch (err) {
        throw err;
    }
}
// fix the relationship between teams and coaches, and teams and categories
async function teamToCoachesAndCategoriesRel(){
    try {
        // retrieves the coaches, and categories collections
        // for further processing.
        // the team information is got from the Json file
        // and updated after processed
        let coachesList = await schema.coaches.find().exec();
        let categoriesList = await schema.categories.find().exec();
        
        offsetCoaches = 0;
        offsetCategories = 0;

        for (team in teamsJson){

            // if ran out of categories, it goes back to the first category of the list
            if(team == categoriesList.length) offsetCategories = offsetCategories + categoriesList.length;
            teamsJson[team].Category = categoriesList[team - offsetCategories]._id;

            // if ran out of coaches, it goes back to the first coach of the list
            if(team == coachesList.length) offsetCoaches = offsetCoaches + coachesList.length;
            teamsJson[team].Coach = coachesList[team - offsetCoaches]._id;

        }
        return teamsJson;
    } catch (err) {
        throw err;
    }
}

// Assigns guardians to all the players of the list
async function playerToGuardiansRel(){
    try {
        let guardianList = await schema.guardians.find().exec();
        offset = 0;
        for (player in playersJson){

            // if ran out of guardians, it goes back to the first guardian of the list
            if(player == guardianList.length) offset = offset + guardianList.length;
            playersJson[player].Guardian = guardianList[player - offset]._id;
        }
        return playersJson;
    } catch (err) {
        throw err;
    }
}

// connectDB sets the connection to the database
function connectDB(){
    return new Promise(function(resolve, reject){

        mongoose.connect(connectionString, { useNewUrlParser: true });

        DB = mongoose.connection;

        DB.on('error', (err) => {
            reject(`ERROR: Connection to DB failed: \n ${err}`);
        });

        DB.on('disconnected', function(){
            console.log("Mongoose default connection is disconnected");
        });
        
        // once opened it sets the models for accesing the 
        // collections in the database
        DB.once('open',()=>{

            schema.guardians = DB.model('guardians', guardianSchema);
            schema.players = DB.model('players', playersSchema);
            schema.teams = DB.model('teams', teamsSchema);
            schema.coaches = DB.model('coaches', coachesSchema);
            schema.categories = DB.model('categories', categoriesSchema);
            schema.rooster = DB.model('rooster', roosterSchema);
            
            resolve(`OK: Connection to DB succeded`);

        });
    });
}

// Synchreonizes initialization of the collections in the database
// the collections are created in order so the documents are available at
// the time of creating their relationships. 
async function aWipeDB(){
    for (collection in jsonDataList){
        try {
            if (collection == 'players') await playerToGuardiansRel();
            if (collection == 'teams') await teamToCoachesAndCategoriesRel();
            console.log(await aWipeCol(jsonDataList[collection], collection));
        } catch (err) {
            console.log(err);
        }
    }
}


// Syncrhonizes the drop and creation for each collection
async function aWipeCol(json, collection){
    try {
        console.log(await dropCol(collection));
    } catch (err) {
        console.log(err);
    }

    try {
        console.log(await addCol(json, collection));
        return `OK: "${collection}" collection initialized.`;
    } catch (err) {
        console.log(err);
        return `ERROR: "${collection}" collection initialization failed.`;
    }
}

function addCol(json, collection){
    return new Promise(function(resolve, reject){
        schema[collection].create(json ,(err, result) => {
            if(err){
                reject(err);
            } else {
                resolve(`OK: "${collection}" collection created.`);
            }
        });

    });
}

function dropCol(collection){
    return new Promise(function(resolve, reject){
        DB.db.listCollections({name: collection}).toArray().
        then(
            (items)=>{
                if(items.length > 0){
                    DB.dropCollection(collection).
                    then(
                        () =>{
                            resolve(`OK: "${collection}" collection droped.`)
                        }
                    ).
                    catch(
                        (err)=>{
                            reject(`ERROR: "${collection}" - Drop collection failed: ${err}`);
                        }
                    );
                } else {
                    reject(`WARNING:"${collection}" - Drop collection failed: "${collection}" doesn't exists!`);
                }
            }
        );
    });
}
