const express = require('express');
const router = express.Router();
const atdController = require('../controllers/atdController');
const gmController = require('../controllers/gmController');
const gameSessionController = require('../controllers/gameSessionController');
const timelineController = require('../controllers/timelineController');
const loginController = require('../controllers/loginController');
const playerController = require('../controllers/playerController');
const diceController = require('../controllers/diceController');
const importController = require('../controllers/importController');
const powerBrowserController = require('../controllers/powerBrowserController');

function requireLogin (req, res, next) {
  let gameMaster = req.session.user;
  if (!gameMaster) {
    res.redirect('/login');
  }
  else {
    next();
  }
}

router.get('/', gmController.index);

router.get('/login', loginController.index);
router.post('/login', loginController.login);
router.get('/logout', loginController.logout);

router.get('/gms', requireLogin,gmController.gm_list);
router.get('/gm', requireLogin,gmController.gm_detail);
router.get('/gm/collection', requireLogin,gmController.gm_collection);
router.post('/gm/:ceid/deleteEvent',requireLogin, gmController.collected_event_delete);

router.get('/updateGM', requireLogin, gmController.update);
router.post('/updateGM', requireLogin, gmController.applyUpdate);
router.get('/updatePassword', requireLogin, gmController.updatePassword);
router.post('/updatePassword', requireLogin, gmController.applyUpdatePassword);

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
router.get('/playerTimeLine/:gsid', playerController.playerTimeline);

router.get('/dice', diceController.load);
router.post('/dice/roll', diceController.roll);
router.post('/dice/hero', diceController.hero);
router.post('/dice/drama', diceController.drama);

router.get('/powersUpload', requireLogin, importController.viewUpload);
router.post('/powersUpload',requireLogin,  importController.upload);


router.get('/powerSetBrowser', powerBrowserController.viewPowerSets);
router.get('/powerSet/:psid', powerBrowserController.viewPowerSet);
router.get('/powerBrowser', powerBrowserController.viewPowers);
router.get('/powerList', powerBrowserController.powerList);

module.exports = router;