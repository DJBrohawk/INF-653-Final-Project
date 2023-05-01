const State = require('../model/State');


const data = {
    states: require('../data/statesData.json'),
    setStates: function(data) {this.states = data}
};

const getAllStates = async (req, res) => {

    console.log("This is a get all statement");

    //params only returns the "/?contig" part of the url, acting as if that whole thing is the param, which it isn't
    //I tried a number of things and eventually just settled on getting the value of that whole thing
    const params = new URLSearchParams(req.url);
    console.log(params);
    console.log(params.get('/?contig'));
    // const params = req.url;
    const value = params.get('/?contig');


    //if contig exists, check value
    if(value !== null){
        //if true, get the lower 48 plus their fun fact data
        if(value == "true"){
            res.status(200);
            //data.states is an array, loop through the array for AK and HI and remove them
            //using splice

            for(let i = 0; i < data.states.length; i++){

                if(data.states[i].code === "HI" || data.states[i].code === "AK"){
                    data.states.splice(i, 1);
                }

                //pull the data from MongoDB
                const duplicate = await State.findOne({ stateCode: data.states[i].code }).exec();
                //if no data exists for that state, skip this iteration of the loop
                if(duplicate === null) continue;
                //if there ARE facts for that state, add them to that state's JSON object
                if(duplicate.funfacts !== null) data.states[i].funfacts = duplicate.funfacts;

            }
            res.json(data.states);
            return;
           //if false, get Alaska and Hawaii + fun fact data
        } else if (value == "false") {


            res.status(200);
            let statesArr = [];
            //pull the two states individually as opposed to a for loop
            const state = data.states.find(stt => stt.code === "HI");
            const state2 = data.states.find(stt => stt.code === "AK");

            //pull data from MongoDB for the individual states
            const stateFact = await State.findOne({ stateCode: "HI" }).exec();
            const state2Fact = await State.findOne({ stateCode: "AK" }).exec();

            //if those states exist in MongoDB and they have fun facts, put them in the JSON object
            if(stateFact !== null && stateFact.funfacts !== null) state.funfacts = stateFact.funfacts;
            if(state2Fact !== null && state2Fact.funfacts !== null) state2.funfacts = state2Fact.funfacts;

            //push to the array we're using for the states data
            statesArr.push(state);
            statesArr.push(state2);

            //set the state data to just the two states with their facts
            data.setStates(statesArr);
            //response is the above data
            res.json(data.states);
            return;
        }
    }
    
    //I could not get external functions to work correctly and so
    //I'm using a similar for loop to the lower 48 here but not excluding any states
    for (let i = 0; i < data.states.length; i++){

        const duplicate = await State.findOne({ stateCode: data.states[i].code }).exec();

        if(duplicate === null) continue;

        if(duplicate.funfacts !== null) data.states[i].funfacts = duplicate.funfacts;


    }

    //otherwise the response is just all the states with their fact data
    res.status(200);
    res.json(data.states);
    return;

}

const getOneState = async (req, res) => {

    console.log("This is a get one state statement");
    
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }

    const duplicate = await State.findOne({ stateCode: state.code }).exec();
    if(duplicate !== null && duplicate.funfacts !== null) state.funfacts = duplicate.funfacts;
       
    res.status(200);

    res.json(state);
}

const getStateCapital = async(req, res) => {

    console.log("This is a get state capital statement");
    
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }

    res.json({'state': state.state, 'capital': state.capital_city});
}

const getStateNickname = async(req, res) => {
    console.log("This is a get state capital statement");
    
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }

    res.json({'state': state.state, 'nickname': state.nickname});
}

const getStatePopulation = async(req, res) => {

    console.log("This is a get state population statement");
    
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }

    res.json({'state': state.state, 'population': state.population});

}

const getStateAdmission = async(req, res) => {

    console.log("This is a get state admission statement");
    
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }

    res.json({'state': state.state, 'admitted': state.admission_date});


}

const addFunfact = async (req, res) => {

    let funfactsArr = [];
    let funfactsMerge = [];
    console.log("This is a add fun fact state statement");
    
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }
    // check for duplicate states in the DB
    const duplicate = await State.findOne({ stateCode: state.code }).exec();
    const funfactsBody = req.body.funfacts;

   

    if (!funfactsBody) {
        return res.status(400).json({"message": `State fun facts value required`}); //may need to change this
    }

    //if this is not null, the array 
    if(duplicate?.funfacts) funfactsArr = duplicate.funfacts;

    //if the fun facts body is not an array, the automated grading thing doesn't want that, so we
    //reject it
    if(!Array.isArray(funfactsBody)){ 
        
        return res.status(400).json({"message": `State fun facts value must be an array`}); //may need to change this

        //else it must be an array, so we will concatenate the two arrays
    } else {

        console.log("It's an array");
        console.log(funfactsBody);
        funfactsArr = funfactsArr.concat(funfactsBody);
        console.log(funfactsArr);

    }
    
    //if there's nothing in the document, that means it's a state that needs to be added to the DB
    //this will create a new state document in the DB

    if (!duplicate) {

        try {
        
            const result = await State.create({
                
                stateCode: state.code,
                funfacts: funfactsArr

            });
            result.save();
            res.json(result);
            } catch (err) {
                console.error(err);
            }
        
        
        return;
    }

    
    //otherwise, the duplicate is a state that's in the DB?, so we just essentially overwrite the whole thing
    //with the added information
    duplicate.overwrite({stateCode: duplicate.stateCode, funfacts: funfactsArr});
    duplicate.save();
    res.json(duplicate);
    
    //console.log(duplicate);
   
  
}

const getFunfact = async (req, res) => {

    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` });
    }
    // check for duplicate states in the DB
    const duplicate = await State.findOne({ stateCode: state.code }).exec();

    if(!duplicate || duplicate.funfacts === null) return res.status(400).json({"message": `No Fun Facts found for ${state.state}`});

    res.json({"funfact": duplicate.funfacts[getRandomInt(duplicate.funfacts.length)]});


}

const editFunfact = async (req, res) => {

    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); //State ID ${req.params.state} not found
    }
    // check for duplicate states in the DB
    const duplicate = await State.findOne({ stateCode: state.code }).exec();

    if(!duplicate) return res.status(400).json({"message": `No fun fact data found for ${req.params.state}`});

    //need to check for index and funfact

    if(!req.body.index) return res.status(400).json({"message": "State fun fact index value required"}); //may have to change this
    if(!Number.isInteger(parseInt(req.body.index))) return res.status(400).json({"message": "Index must be a number entered without quotes"});
    if(!req.body.funfact) return res.status(400).json({"message": "State fun fact value required"}); //and this
    if(!duplicate) return res.status(400).json({"message": `No Fun Facts found for ${state.state}`})
    if(!duplicate.funfacts[req.body.index - 1]) return res.status(400).json({"message": `No Fun Facts found at that index for ${state.state}`});

    try {

    duplicate.funfacts[req.body.index-1] = req.body.funfact;
    duplicate.save();
    res.json(duplicate);

    }

    catch (err){
        console.error(err);
        return res.status(400).json({"message": "An error occurred, index out of bounds"});
    }


}

const deleteFunfact = async (req, res) => {

    const state = data.states.find(stt => stt.code === req.params.state);
    if (!state) {
        return res.status(400).json({ "message": `State ID ${req.params.state} not found` });
    }
    // check for duplicate states in the DB
    const duplicate = await State.findOne({ stateCode: state.code }).exec();

    if(!duplicate) return res.status(400).json({"message": `No fun fact data found for ${req.params.state}`});

    //need to check for index and funfact

    if(!req.body.index) return res.status(400).json({"message": "State fun fact index value required"}); //may have to change this
    if(!Number.isInteger(parseInt(req.body.index))) return res.status(400).json({"message": "Index must be a number entered without quotes"});
    if(!duplicate) return res.status(400).json({"message": `No Fun Facts found for ${state.state}`})
    if(!duplicate.funfacts[req.body.index - 1]) return res.status(400).json({"message": `No Fun Fact found at that index for ${state.state}`});

    //delete item at given element index - 1, which is the true index of the array (passing in 0 would be wrong because it would
    //falsely show a false value

    try {
    duplicate.funfacts.splice(req.body.index - 1, 1);
    duplicate.save();
    res.json(duplicate);
    }
    catch(err){
        console.error(err);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


module.exports = {
    getAllStates,
    getOneState,
    addFunfact,
    getFunfact,
    editFunfact,
    deleteFunfact,
    getStateCapital,
    getStateNickname,
    getStatePopulation,
    getStateAdmission
}