import Battle from '../models/battles.model'
import logger from '../core/logger/app-logger'
import config from '../core/config/config.dev'
import _ from 'lodash';
import async from 'async';

const controller = {};

/**
 * List array of all places where battle has taken place
 *
 */
controller.listBattlePlace = async (req, res) => {
    try {
        let battles = await Battle.listBattlePlace();
        logger.info('sending List Battles place...');
        battles = battles.map(function(u) {
            return u._id.location;
        })
        res.send({
            status: "success",
            data: battles
        });
    } catch (err) {
        logger.error('Error in getting Battles- ' + err);
        res.status(500).send({
            error: 'Something Went Wrong!'
        });
    }
}



/**
 * Controller to count the number of battles occurred
 * Used Aggregate stage for query operation
 */
controller.battleCount = async (req, res) => {
    try {
        let battles = await Battle.battleCount();
        logger.info('sending Battle Count...');
        res.send({
            status: "success",
            data: {
               // battle_occured_count: battles.length
			   battle_occured_count: battles
            }
        });
    } catch (err) {
        logger.error('Error in getting Battles- ' + err);
        res.status(500).send({
            error: 'Something Went Wrong!'
        });
    }
}



/**
 * Controller for displaying Battle Stats
 * Single Query model been reused for multiple tasks
 * 
 */
controller.battleStats = async (req, res) => {
    try {
        let battleStats = {
            most_active: {},
            attacker_outcome: {},
            battle_type: [],
            defender_size: {}
        };
        async.parallel([statCallback => {
			
            //Most Active attacker
            try {
                Battle.mostActive('attacker_king', (err, callbackAttacker) => {
                    if (err)
                        return statCallback(err, null)
                    else {
                        let result = _.head(callbackAttacker);
                        battleStats.most_active.attacker_king = (!_.isUndefined(result)) ?
                            result._id.attacker_king :
                            '';
                        statCallback(null, 'Done')
                    }
                });
            } catch (err) {
                statCallback(err, null)
            }

        }, statCallback => {
			
            //Most Active defender
            try {
                Battle.mostActive('defender_king', (err, callbackAttacker) => {
                    if (err)
                        return statCallback(err, null)
                    else {
                        let result = _.head(callbackAttacker);
                        battleStats.most_active.defender_king = (!_.isUndefined(result)) ?
                            result._id.defender_king :
                            ''
                        statCallback(null, 'Done')
                    }
                });
            } catch (err) {
                statCallback(err, null)
            }
        }, statCallback => {
			
            //Most Active region
            try {
                Battle.mostActive('region', (err, callbackRegion) => {
                    if (err)
                        return statCallback(err, null)
                    else {
                        let result = _.head(callbackRegion);
                        battleStats.most_active.region = (!_.isUndefined(result)) ?
                            result._id.region :
                            ''
                        statCallback(null, 'Done')
                    }
                });
            } catch (err) {
                statCallback(err, null)
            }
        }, statCallback => {
            //Most Active name
            try {
                Battle.mostActive('name', (err, callbackName) => {
                    if (err)
                        return statCallback(err, null)
                    else {
                        let result = _.head(callbackName);
                        battleStats.most_active.name = (!_.isUndefined(result)) ?
                            result._id.name :
                            ''
                        statCallback(null, 'Done')
                    }
                });
            } catch (err) {
                statCallback(err, null)
            }
        }, statCallback => {
			
            //Attacker Outcome win or loss
            try {
                Battle.totalWinLoss((err, callbackWinLoss) => {
                    if (err)
                        return statCallback(err, null)
                    else {
                        _.filter(callbackWinLoss, o => {
                            battleStats.attacker_outcome[o._id] = o.count;
                        })
                        statCallback(null, 'Done')
                    }
                });
            } catch (err) {
                statCallback(err, null)
            }
        }, statCallback => {
			
            //Battle type
            try {
                Battle.battleType((err, callbackBattleType) => {
                    if (err)
                        return statCallback(err, null)
                    else {
                        battleStats.battle_type = callbackBattleType.map(u => u._id.battle_type)
                        statCallback(null, 'Done')
                    }
                });
            } catch (err) {
                statCallback(err, null)
            }
        }, statCallback => {
			
            //Defender size Max,Min & Avg
            try {
                Battle.defenderSize((err, callbackDefenderSize) => {
                    if (err)
                        return statCallback(err, null)
                    else {
                        _.filter(callbackDefenderSize, o => {
                            Object.keys(o).forEach(key => {
                                if (o[key] != null) {
                                    battleStats.defender_size[key] = parseInt(o[key]);
                                }
                            });
                        })
                        statCallback(null, 'Done')
                    }
                });
            } catch (err) {
                statCallback(err, null)
            }
        }], (err, statsResponse) => {
            if (err) {
                res.status(500).send({
                    error: 'Something Went Wrong!'
                });
            } else {
                res.send({
                    status: "success",
                    data: battleStats
                })
            }
        })
    } catch (err) {
        logger.error('Error in Battle Stats- ' + err);
        res.status(500).send({
            error: 'Something Went Wrong!'
        });
    }
}



/**
 * Search based on any fields as query param
 * Regex been used and incasesensitive.
 * Change to $match for exact match of param value
 * Generate dynamic subquery based on query param key & value
 */
controller.battleSearch = async (req, res) => {
    try {
        // To handle any dynamic query param key and value
		if(!_.isEmpty(req.query)){
		let query = [];
        _.findKey(req.query, function(o, i) {
            let flag = false,
                matches, querystring;
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
        let battleSearch = (!_.isEmpty(query) ?
            await Battle.battleSearch(query) : {
                error: 'Invalid Input'
            })
        res.send({
            status: "success",
            data: battleSearch
        })
	}else{
		let battleSearch = await Battle.getAll();
		 res.send({
            status: "success",
            data: battleSearch
        })
	}
    } catch (err) {
        logger.error('Error in battle search- ' + err);
        res.status(500).send({
            error: 'Something Went Wrong!'
        });
    }
}

export default controller;