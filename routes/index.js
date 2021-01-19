var express = require('express');
var router = express.Router();
var atdController = require('../controllers/atdController');
var gmController = require('../controllers/gmController');
var gameSessionController = require('../controllers/gameSessionController');
var timelineController = require('../controllers/timelineController');
var loginController = require('../controllers/loginController');
var playerController = require('../controllers/playerController');

function requireLogin (req, res, next) {
  console.log('requireLogin');
  var gameMaster = req.session.gameMaster;
  if (!gameMaster) {
    res.redirect('/login');
  } else {
    console.log('gameMaster:'+gameMaster.name);
    next();
  }
};

router.get('/', gmController.index);

router.get('/login', loginController.index);
router.post('/login', loginController.login);
router.get('/logout', loginController.logout);

router.get('/gms', requireLogin,gmController.gm_list);
router.get('/gm', requireLogin,gmController.gm_detail);
router.get('/gm/collection', requireLogin,gmController.gm_collection);
router.post('/gm/:ceid/deleteEvent',requireLogin, gmController.collected_event_delete);

router.get('/gamesession/create', requireLogin,gameSessionController.game_session_create);
router.post('/gamesession/create', requireLogin,gameSessionController.game_session_save);
router.get('/gamesession/:id/delete', requireLogin,gameSessionController.game_session_delete);
router.post('/gamesession/:id/delete', requireLogin,gameSessionController.game_session_confirm_delete);

router.get('/timeline/:gsid', requireLogin,timelineController.load)
router.post('/timeline/:gsid/create', requireLogin,timelineController.timeline_event_create);
router.post('/timeline/:gsid/import', requireLogin,timelineController.timeline_event_import);
router.post('/timeline/:tid/update', requireLogin,timelineController.timeline_event_update);
router.post('/timeline/:tid/:gsid/delete', requireLogin,timelineController.timeline_event_delete);
router.post('/timeline/:tid/:gsid/clone', requireLogin,timelineController.timeline_event_clone);
router.post('/timeline/:tid/:gsid/updateDeltas', requireLogin,timelineController.timeline_event_updateDeltas);
router.post('/timeline/:tid/:gsid/collect', requireLogin, timelineController.timeline_event_collect);

router.get('/atds', atdController.atd_list);


router.get('/playerSessions', playerController.playerSessions);
router.get('/playerSession/:gmid/:gsid', playerController.playerSession);

router.get('/lastEventDate/:gsid', playerController.lastEventDate);

module.exports = router;















/*
var express = require('express');
var router = express.Router();

/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// GET home page.
router.get('/', function(req, res) {
  res.redirect('/games');
});

module.exports = router;

 */
