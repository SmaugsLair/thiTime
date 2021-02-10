const multer = require('multer');
const path = require('path');
const excelToJson = require('convert-excel-to-json');
const PowerSet = require('../models/powerSet');
const Power = require('../models/power');

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

        //console.log(excelData);
        //console.log('excelData[\'Powers List\'][0].MaxTaken '+excelData['Powers List'][0].MaxTaken)
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
           /* console.log('------------stub------------------');
            console.log(JSON.stringify(stub, null, 2));*/
            const newPs = new PowerSet(stub);
          /*  console.log('------------newPs------------------');
            console.log(JSON.stringify(newPs, null, 2));*/
            powerSets.push(newPs);
        }
        let powers = [];
        for (let item of excelData.PowersList) {
            const stub = {abilityMods: new Map()};
            for (const [key, value] of Object.entries(item)) {
                if (key.startsWith('set_')) {
                    console.log("key: "+key+" -- value:"+value);
                    let psName = key.substring(4);
                    const ps = powerSets.find(({ name }) => name === psName);
                    if (ps) {
                        console.log(JSON.stringify(ps, null, 2))
                        let array = ps.powers.get(value.toString());
                        if (array) {
                            array.push(item.name);
                        } else {
                            ps.powers.set(value.toString(), [item.name]);
                        }
                    }
                }
                else if (key.startsWith('am_')) {
                    let ability = key.substring(3);
                    stub.abilityMods.set(ability, Number(value));
                }
                else if (key === 'prerequisite') {
                    if (value !== 'none' ) {
                        stub[key] = value.split(' or ')
                    }
                }
                else {
                    stub[key] = value;
                }
            }
            powers.push(new Power(stub));

        }

        res.render('powersUpload' , {
            title: 'Powers Upload',
            message: message,
            results: JSON.stringify(excelData, null, 2),
            powerSets: JSON.stringify(powerSets, null, 2),
            powers: JSON.stringify(powers, null, 2),

        });
    });
}

function ExcelDateToJSDate(date) {
    return new Date(Math.round((date - 25569)*86400*1000));
}

