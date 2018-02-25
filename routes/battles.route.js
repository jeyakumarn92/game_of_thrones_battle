import express from "express";
import battleController from "../controllers/battles.controller"
const router = express.Router()


//Index route
router.get('/', (req, res) => {
    res.redirect('/list');
});


/**
*  Method : GET
*  /list - list all the places where battle has taken place
*/
router.get('/list', (req, res) => {
    battleController.listBattlePlace(req, res);
});


/**
*  Method : GET
*  /count - Count total number of battle occurred
*/
router.get('/count', (req, res) => {
    battleController.battleCount(req, res);
});


/**
*  Method : GET
*  /stats - Battle stats
*/
router.get('/stats', (req, res) => {
    battleController.battleStats(req, res);
});


/**
*  Method : GET
*  /search - search on battles by query params
*/
router.get('/search', (req, res) => {
    battleController.battleSearch(req, res);
});

router.get("*",function(req,res){
	res.send("Invalid Endpoint");
})

export default router;