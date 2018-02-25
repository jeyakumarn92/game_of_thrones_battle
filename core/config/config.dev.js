import path from "path";

let config = {};

config.logFileDir = path.join(__dirname, '../../log');
config.logFileName = 'app.log';
config.serverPort = process.env.serverPort || 3000;
config.dbHost = "ds147668.mlab.com";
config.dbPort = "47668";
config.dbName = "battles";
config.userName = "jey";
config.userPwd = "jeyakumarn92";
config.fields = ['attacker_king', 'defender_king', 'battle_type', 'location','name','year',"battle_number","attacker_1","attacker_2","attacker_3","attacker_4",
                 "defender_1","defender_2","defender_3","defender_4","attacker_outcome","major_death","major_capture","attacker_size","defender_size",
				 "attacker_commander","defender_commander","summer","location","region","note"];
				 
export default config;