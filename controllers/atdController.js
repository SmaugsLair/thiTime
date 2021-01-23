const ActionTimeDefault = require('../models/atd');

// Display list of all atds
exports.atd_list = function(req, res) {
    ActionTimeDefault.find({}, 'name time')
        .exec(function (err, list_atds) {
            if (err) { return next(err); }
            //Successful, so render
            console.log('returning');
            //res.json(list_atds);
            res.render('atd', { title: 'ATD List', atd_list: list_atds });
        });
};
