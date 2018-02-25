import mongoose from 'mongoose';

const BattleSchema = mongoose.Schema({
    "name": {"type": "string"}, 
    "year": {"type": "string"}, 
    "battle_number": {"type": "string"}, 
    "attacker_king": { "type": "string"}, 
    "defender_king": {"type": "string" }, 
    "attacker_1": {"type": "string"}, 
    "attacker_2": {"type": "string"}, 
    "attacker_3": {"type": "string"}, 
    "attacker_4": {"type": "string"}, 
    "defender_1": {"type": "string"}, 
    "defender_2": {"type": "string"}, 
    "defender_3": {"type": "string"}, 
    "defender_4": {"type": "string"}, 
    "attacker_outcome": {"type": "string"}, 
    "battle_type": {"type": "string"}, 
    "major_death": {"type": "string"}, 
    "major_capture": {"type": "string"}, 
    "attacker_size": {"type": "string"}, 
    "defender_size": {"type": "string"}, 
    "attacker_commander": {"type": "string"}, 
    "defender_commander": {"type": "string"}, 
    "summer": {"type": "string"}, 
    "location": {"type": "string"}, 
    "region": {"type": "string"}, 
    "note": {"type": "string"}
}, {collection : 'game'});

let BattleModel = mongoose.model('Battle', BattleSchema);





BattleModel.getAll = () => {
    return BattleModel.find({});
}

/**
 *  returns the list of all the places where battle has taken place 
 *
 * @return <Array> element
 */
BattleModel.listBattlePlace = () => {
	return BattleModel.aggregate([
	 {
        "$match": {
            "location": { "$exists": true, "$nin": ["",null]}
        }
    },
    {
        $group:{
            "_id": {
                "location": "$location",
            }
        }
    }]);        
}


/**
 *  returns the records based on search queries 
 *
 * @param <Object> subquery 
 * @return <Array> element
 */
BattleModel.battleSearch = (subquery) =>{
	//return BattleModel.aggregate( [{$match : { $or: [ { "attacker_king" : textString }, { "defender_king" : textString } ] } }])
	/*return BattleModel.find({"$and" : 
	                      [{ "$or" : [{"attacker_king" : new RegExp(textString, 'i')},{"defender_king" :  new RegExp(textString, 'i')} ]},
						//   {"location" : {$regex : /Duskendale/, $options : 'i'}},
							//   {"battle_type" :  {$regex : /pitched battle/, $options : 'i'}}
	]})*/
    return BattleModel.find({"$and" : subquery})
	}

	
/**
 *  returns the total number of battle occurred
 *
 * @return <Array> element
 */
BattleModel.battleCount = () => {
    return BattleModel.aggregate(
	{$match: {$or : [{$and : [
	{ $or: [{ attacker_size: '' }, { defender_size: '' }] },
	{ $and : [{ major_death: {$eq :0} }, { major_capture: {$eq : 0} }]}
	]},
	{$or : [{ attacker_outcome: '' },{ battle_type: '' }]},
		{$or : [
	{ $and : [{ attacker_king: '' },{ attacker_commander: {$eq :''} }] },
	{ $and : [{ defender_king: '' }, {defender_commander : {$eq : ''} }]}
	]}
	] } } );
}



/**
 *  returns the most active attacker king,defender king,region and name
 * @param <String> string
 * @param callback
 * @return <Array> element
 */
BattleModel.mostActive = (string,callback) => {
let callbackAttacker = 	callback;
let query = {};
query[string]="$"+string;
BattleModel.aggregate([
    {
        $group:{
            "_id": query,
			"count" :{ $sum: 1 },		
        },
    }
	,{
    $sort:{count:-1}
  },{
	  $limit:1
  }
  ],function(err,resp){
	  callbackAttacker(err,resp)
  });
}


/**
 *  returns the total win & loss of attacker 
 * @param callback
 * @return <Array> element
 */
BattleModel.totalWinLoss= (callback) => {	
let callbackName = 	callback;
 BattleModel.aggregate([
  {
        "$match": {
            "attacker_outcome": { "$ne": "" }
        }
    },
    {$group : { _id : '$attacker_outcome', count : {$sum : 1}}}
  ],function(err,resp){
	  callbackName(err,resp)
  });
}


/**
 *  returns the array of battle type 
 * @param callback
 * @return <Array> element
 */
BattleModel.battleType = (callback) => {
	let callbackName = 	callback;
	 BattleModel.aggregate([
	 {
        "$match": {
            "battle_type": { "$exists": true, "$nin": ["",null]}
        }
    },
    {
        $group:{
            "_id": {
                "battle_type": "$battle_type",
            }
        }
    }],function(err,resp){
	  callbackName(err,resp)
  });       
}


/**
 *  returns the size of defender min,max and average 
 * @param callback
 * @return <Array> element
 */
BattleModel.defenderSize = (callback) => {
	let callbackName = 	callback;
	 BattleModel.aggregate([
	 {
        "$match": {
            "defender_size": { "$exists": true, "$nin": ["",null]}
        }
    },
	 { "$group": { 
        "_id": null,
        "max": { "$max": "$defender_size" }, 
        "min": { "$min": "$defender_size" },
		"average": { "$avg": "$defender_size" }
    }}
	],function(err,resp){
	  callbackName(err,resp)
  });       
}


export default BattleModel;