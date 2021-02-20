const multer = require('multer');
const path = require('path');
const excelToJson = require('convert-excel-to-json');
const PowerSet = require('../models/powerSet');
const Power = require('../models/power');
const _ = require('underscore');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + path.extname(file.originalname));
    }
});

const xlsxFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(xlsx|XLSX)$/)) {
        req.fileValidationError = 'Only xlsx files are allowed!';
        return cb(new Error('Only xlsx files are allowed!'), false);
    }
    cb(null, true);
};

exports.viewUpload = function(req, res) {
    res.render('powersUpload' , {
            user: req.session.user,
            title: 'Powers Upload'
        });
};

exports.upload = function (req, res, next) {
    let upload = multer({ storage: storage, fileFilter: xlsxFilter }).single('powers');

    upload(req, res, function(err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any

        let message = 'Upload Successful';

        if (req.fileValidationError) {
            message =req.fileValidationError
        }
        else if (!req.file) {
            message ='no file';
        }
        else if (err instanceof multer.MulterError) {
            message = 'MulterError';
        }
        else if (err) {
            message = 'other error';
        }
        const excelData = excelToJson({
            sourceFile: 'uploads/powers.xlsx',
            header:{rows: 4},
            columnToKey: {'*': '{{columnHeader}}'}
        });

        let errorMessages = [];
        //let validateCount = 0;

        let powerSets = [];
        for (let item of excelData.PowerSetInformation) {
            const stub = {abilityMods: new Map(), powers: new Map()};
            for (const [key, value] of Object.entries(item)) {
                if (key === 'updated') {
                    let date = ExcelDateToJSDate(value);
                    if (date) {
                        stub.lastUpdate = date;
                    }
                }
                else if (key.startsWith('ps_')) {
                    let ability = key.substring(3);
                    stub.abilityMods.set(ability, Number(value));
                }
                else {
                    stub[key] = value;
                }
            }
            const newPs = new PowerSet(stub);
            powerSets.push(newPs);

        }
        let powers = [];
        for (let item of excelData.PowersList) {
            const stub = {abilityMods: [], powerSets:[]};
            let minTier = 11;
            for (const [key, value] of Object.entries(item)) {
                if (key.startsWith('set_')) {
                    let psName = key.substring(4);
                    const ps = powerSets.find(({ name }) => name === psName);
                    if (ps) {
                        let array = ps.powers.get(value.toString());
                        if (array) {
                            array.push(item.name);
                        } else {
                            ps.powers.set(value.toString(), [item.name]);
                        }
                    }
                    minTier = Math.min(minTier, value);
                    stub.powerSets.push(psName+':'+value);
                }
                else if (key.startsWith('am_')) {
                    let ability = key.substring(3);
                    stub.abilityMods.push(ability+':'+value);
                }
                else if (key === 'prerequisite') {
                    if (value !== 'none' ) {
                        stub[key] = trimStringArray(value.split('OR'));

                    }
                }
                else if (key === 'subPowers') {
                    if (value) {
                        stub[key] = value.split(',');
                    }
                }
                else {
                    stub[key] = value;
                }
            }
            if (minTier < 11) { //found one
                stub['minTier'] = minTier;
            }
            let newPower = new Power(stub);
            powers.push(newPower);

        }

        let psResults = {created:[], updated:[], unchanged:[]};
        let pResults = {created:[], updated:[], unchanged:[]};

        let tasksToGo = powerSets.length + powers.length;
        //console.log('initial taskToGo:'+tasksToGo);

        let complete = function () {
            tasksToGo -= 1;
            //console.log('in complete:taskToGo:'+tasksToGo);
            if (tasksToGo <= 0) {
                res.render('powersUpload', {
                    title: 'Powers Upload',
                    message: message,
                    error: JSON.stringify(errorMessages, null, 2),
                    user: req.session.user,
                    newPowerSets: JSON.stringify(psResults.created, null, 2),
                    updatedPowerSets: JSON.stringify(psResults.updated, null, 2),
                    unchangedPowerSets: JSON.stringify(psResults.unchanged, null, 2),
                    newPowers: JSON.stringify(pResults.created, null, 2),
                    updatedPowers: JSON.stringify(pResults.updated, null, 2),
                    unchangedPowers: JSON.stringify(pResults.unchanged, null, 2),
                });
            }
        }

        if (tasksToGo == 0) {
            complete();
        }
        parseDataIntoModels(PowerSet, powerSets, psResults, errorMessages, complete, next);
        parseDataIntoModels(Power, powers, pResults, errorMessages, complete, next);


    });
}

function ExcelDateToJSDate(date) {
    return new Date(Math.round((date - 25569)*86400*1000));
}

function parseDataIntoModels(Model, array, results, errorMessages, complete, next) {
    for (let newItem of array) {
        let messageDetails = newItem.name+':'+newItem.ssid;
        Model.findOne({ 'ssid': newItem.ssid }, function (err, oldItem) {
            if (err) {
                errorMessages.push('Unexpected error while searching for:'+messageDetails+':'+err.message);
                complete();
            }
            else {
                if (oldItem) {
                    var changes = compareMongooseObjects(oldItem, newItem, Model);
                    if (_.isEmpty(changes)) {
                        results.unchanged.push(newItem.name);
                        complete();
                    }
                    else {
                        Model.findByIdAndUpdate(
                            oldItem._id,
                            {$set:changes},
                            {runValidators: true},
                            function (err) {
                                if (err) {
                                    errorMessages.push('Error updating: '+messageDetails+' : '+err.message);
                                }
                                else {
                                    results.updated.push(newItem.name);
                                }
                                complete();
                        });
                    }
                }
                else {
                    newItem.save(function (err) {
                        if (err) {
                            errorMessages.push('Error creating: '+messageDetails+' : '+err.message);
                        }
                        else {
                            results.created.push(newItem.name);
                        }
                        complete();
                    });
                }
            }
        });
    }
}

function compareMongooseObjects(oldObj, newObj, model) {
    const schemaProperties = Object.keys(model.schema.paths);
    const updateQuery = {};
    for (let i = 0; i < schemaProperties.length; i++) {
        let key = schemaProperties[i];
        if (key !== '_id' && key !== '__v') {
            let oldValue = oldObj[key];
            let newValue = newObj[key];
            let changed = false;
            if (oldValue instanceof Map) {
                if (compareStringMaps(oldValue, newValue)) {
                }
                else {
                    changed = true;
                }
            }
            else if (Array.isArray(oldValue) && Array.isArray(newValue)) {
                if (oldValue.length == newValue.length) {
                    for (let i = 0; i < oldValue.length; i++) {
                        if (oldValue[i] !== newValue[i]) {
                            changed = true;
                            break;
                        }
                    }
                }
                else {
                    changed = true;
                }
            }
            else if (!oldValue && newValue) {
                changed = true;
            }
            else if (oldValue && !newValue) {
                changed = true;
            }
            else if (oldValue === newValue) {
            }
            else {
                changed = true;
            }
            if (changed) {
                updateQuery[key] = newValue;
            }
        }
    }
    return updateQuery;
}

function compareStringMaps(map1, map2) {
    let testVal;
    if (map1.size !== map2.size) {
        return false;
    }
    for (let [key, val] of map1) {
        let one = val.toString();
        testVal = map2.get(key);
        let two = testVal.toString();
        // in cases of an undefined value, make sure the key
        // actually exists on the object so there are no false positives
        if (one !== two || (testVal === undefined && !map2.has(key))) {
            return false;
        }
    }
    return true;
}
function trimStringArray(array) {
    for (var i = 0; i < array.length; i++) {
        array[i] = array[i].trim();
    }
    return array;
}