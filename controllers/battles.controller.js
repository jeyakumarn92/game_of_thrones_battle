import Battle from '../models/battles.model'
import logger from '../core/logger/app-logger'
import config from '../core/config/config.dev'
import _ from 'lodash';
import async from 'async';

const controller = {};

/*
controller.getAll = async (req, res) => {
    try {
        const battles = await Battle.getAll();
        logger.info('sending all Battles...');
        res.send(battles);
    }
    catch(err) {
        logger.error('Error in getting Battles- ' + err);
        res.send('Got error in getAll');
    }
}
*/



/**
* 
*
*/
controller.listBattlePlace = async (req, res) => {
    try {
        let battles = await Battle.listBattlePlace();
        logger.info('sending List Battles place...');
		battles = battles.map(function(u) { return u._id.location; })
        res.send({
			battle_places : battles 
		});
    }
    catch(err) {
        logger.error('Error in getting Battles- ' + err);
        res.send({error: 'Something Went Wrong!' });
    }
}



/**
* 
*
*/
controller.battleCount = async (req, res) => {
    try {
        let battles = await Battle.battleCount();
        logger.info('sending Battle Count...');
        res.send({
			battle_occured : battles.length
			});
    }
    catch(err) {
        logger.error('Error in getting Battles- ' + err);
        res.send({
			"error" : "Something Went Wrong!"
		});
    }
}



/**
* 
*
*/
controller.battleStats = async (req, res) => {
        try {
            let battleStats = { 
		most_active : {},
		attacker_outcome : {},
		battle_type : [],
		defender_size:{}
            };
            async.parallel([function(statCallback){
                    //Most Active attacker
                    try{
                        Battle.mostActive("attacker_king",function(err,callbackAttacker){
                            if(err)
				return statCallback(err,null)
			    else{
                                let result = _.head(callbackAttacker);
                                battleStats.most_active.attacker_king = (!_.isUndefined(result))
                                    ? result._id.attacker_king 
                                : "";                     					
                                statCallback(null, 'Done')
                            }							
			});
                    }catch(err){
			statCallback(err,null)
                    }
		
                },function(statCallback){
                    //Most Active defender
                    try{
                        Battle.mostActive("defender_king",function(err,callbackAttacker){
                            if(err)
				return statCallback(err,null)
			    else{
                                let result = _.head(callbackAttacker);	
                                battleStats.most_active.defender_king = (!_.isUndefined(result)) 
                                    ? result._id.defender_king
                                : ""					
                                statCallback(null, 'Done')
                            }							
			});
                    }catch(err){
			statCallback(err,null)
                    }	
                },function(statCallback){
                    //Most Active region
                    try{
                        Battle.mostActive("region",function(err,callbackRegion){
                            if(err)
				return statCallback(err,null)
			    else{
                                let result = _.head(callbackRegion);
                                battleStats.most_active.region = (!_.isUndefined(result))
                                    ? result._id.region 
                                : ""					
                                statCallback(null,'Done')
                            }							
			});
                    }catch(err){
			statCallback(err,null)
                    }
                },function(statCallback){
                    //Most Active name
                    try {
                        Battle.mostActive("name",function(err,callbackName){
                            if(err)
				return statCallback(err,null)
			    else{
                                let result = _.head(callbackName);	
                                battleStats.most_active.name = (!_.isUndefined(result))
                                    ? result._id.name
                                : ""					
                                statCallback(null, 'Done')
                            }							
			});
                    }catch(err){
			statCallback(err,null)
                    }
                },function(statCallback){
                    //Attacker Outcome win or loss
                    try {
                        Battle.totalWinLoss(function(err,callbackWinLoss){
                            if(err)
				return statCallback(err,null)
			    else{
                                _.filter(callbackWinLoss,function(o){							
                                    battleStats.attacker_outcome[o._id]=o.count;
                                })
                                statCallback(null,'Done')
                            }							
			});
                    }catch(err){
			statCallback(err,null)
                    }
                },function(statCallback){
                    //Battle type
                    try{
                        Battle.battleType(function(err,callbackBattleType){
                            if(err)
				return statCallback(err,null)
			    else{
                                battleStats.battle_type = callbackBattleType.map(function(u) {
                                    return u._id.battle_type; 
                                })	
                                statCallback(null,'Done')
                            }							
			});
                    }catch(err){
			statCallback(err,null)
                    }
                },function(statCallback){
                    //Defender size Max,Min & Avg
                    try{
                        Battle.defenderSize(function(err,callbackDefenderSize){
                        if(err)
				         return statCallback(err,null)
			            else{
                                _.filter(callbackDefenderSize,function(o){
                                    Object.keys(o).forEach(function(key) {
                                        if(o[key] != null){
                                            battleStats.defender_size[key] = parseInt(o[key]);								
                                        }
                                    });
                                })
                                statCallback(null,'Done')
                            }							
			});
                    }catch(err){
			statCallback(err,null)
                    }
                }
            ],function(err,statsResponse){
                if(err){
                    res.send({ error:"Something Went Wrong"});
                }else{
                    res.send(battleStats);	 
                }
            })
        }
        catch(err) {
            logger.error('Error in Battle Stats- ' + err);
            res.send({ error:"Something Went Wrong"});
        }
    }



/**
* 
*
*/
controller.battleSearch = async (req, res) => {
    try {
        // To handle dynamic query param key and value
		let query = [];
		_.findKey(req.query, function(o,i) {			
        let flag = false,matches,querystring;
		if (i.length > 3) {
		    flag = true;
		    matches = _.filter(
		        config.fields,
		        function(s) {
		            return s.indexOf(i) !== -1;
		        });
		    if (!_.isUndefined(matches) && !_.isEmpty(matches)) {
		        if (matches.length > 1) {
		            let innerQuery = [];
		            for (let m in matches) {
		                var value = matches[m];
		                let regex = {}
		                regex[value] = new RegExp(o, 'i');
		                innerQuery.push(regex);
		            }
		            querystring = {
		                $or: innerQuery
		            };
		            query.push(querystring);
		        } else {
		            let regex = {}
		            regex[matches] = new RegExp(o, 'i');
		            query.push(regex)
		        }
		    }
		}
		});
		let battles = (!_.isEmpty(query)
                	  ?  await Battle.battleSearch(query)
					  : {error : "Invalid Input"})      
	    res.send(battles)
    }
    catch(err) {
        logger.error('Error in battle search- ' + err);
        res.send({error : "Something Went Wrong!"});
    }
}

export default controller;