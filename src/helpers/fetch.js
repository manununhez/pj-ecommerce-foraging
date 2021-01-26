// Fetch.js
import * as constant from '../helpers/constants';

const _apiHost = 'https://api.swps-pjatk-experiment.pl/v2';//'http://localhost:5000'; //
const fetch_sheet_url = '/v4-get';
const save_sheet_url = '/v4-post';

async function request(url, params, method = 'GET') {

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    if (params) {
        if (method === 'GET') {
            url += '?' + objectToQueryString(params);
        } else {
            options.body = JSON.stringify(params);
        }
    }

    const response = await fetch(_apiHost + url, options);

    if (response.status !== 200) {
        return generateErrorResponse('The server responded with an unexpected status.');
    }

    const result = await response.json();

    return result;

}

function objectToQueryString(obj) {
    return Object.keys(obj).map(key => key + '=' + obj[key]).join('&');
}

function generateErrorResponse(message) {
    return {
        status: 'error',
        message
    };
}

export function get(url, params) {
    return request(url, params);
}

export function create(url, params) {
    return request(url, params, 'POST');
}

//  function update(url, params) {
//   return request(url, params, 'PUT');
// }

// function remove(url, params) {
//   return request(url, params, 'DELETE');
// }

function save(spreadSheetName, row, column, data, callback) {
    create(save_sheet_url, {
        spreadSheetName: spreadSheetName,
        column: row,
        row: column,
        submissionValues: data
    }).then((response) => {
        callback({ response });
    }, function (reason) {
        callback(false, reason);
    });
}

/**
 * Load app versions from the spreadsheet
 * @param {*} callback 
 */
export function fetchVersions(callback) {

    let spreadsheetName = constant.VERSIONS_SHEETNAME;
    let row = "A2";
    let column = "B";

    get(fetch_sheet_url, { spreadSheetName: spreadsheetName, column: row, row: column })
        .then((response) => {
            const data = response.rows;
            let versions = data.map((versions) => {
                return { version: versions[0], url: versions[1] };
            });

            callback({ versions });
        }, (response) => {
            callback(false, response);
        });
}

/**
 * Load psychology questionaries input data from the spreadsheet
 * @param {*} callback 
 */
export function fetchPSFormData(callback) {

    let spreadsheetName = constant.PSFORM_SHEETNAME;
    let row = "A2";
    let column = "J";

    get(fetch_sheet_url, { spreadSheetName: spreadsheetName, column: row, row: column })
        .then((response) => {
            const data = response.rows;
            let result = data.map((version, i) => {
                let answersValues = []

                const indexScreen = 0
                const indexQuestionCode = 1
                const indexType = 2
                const indexAnswerStart = 3

                for (let i = indexAnswerStart; i < version.length; i++)
                    answersValues.push(version[i])

                return {
                    screen: version[indexScreen],
                    questionCode: version[indexQuestionCode],
                    type: version[indexType],
                    answer: answersValues
                };
            });

            callback({ result });
        }, (response) => {
            callback(false, response.result.error);
        });
}

/**
 * Load all the necessary Text structure for the app from the spreadsheet
 * @param {*} callback 
 */
export function fetchAppTextFemale(callback) {
    let spreadsheetName = constant.APP_TEXT_FEMALE_SHEETNAME;
    let row = "A2";
    let column = "C";

    get(fetch_sheet_url, { spreadSheetName: spreadsheetName, column: row, row: column })
        .then((response) => {
            const data = response.rows;

            let appText = data.map((version, i) => {
                return { screen: version[0], size: version[1], text: version[2] };
            });

            callback({ appText });
        }, (response) => {
            callback(false, response.result.error);
        });
}

/**
 * Load all the necessary Text structure for the app from the spreadsheet
 * @param {*} callback 
 */
export function fetchAppTextMale(callback) {
    let spreadsheetName = constant.APP_TEXT_MALE_SHEETNAME;
    let row = "A2";
    let column = "C";

    get(fetch_sheet_url, { spreadSheetName: spreadsheetName, column: row, row: column })
        .then((response) => {
            const data = response.rows;

            let appText = data.map((version, i) => {
                return { screen: version[0], size: version[1], text: version[2] };
            });

            callback({ appText });
        }, (response) => {
            callback(false, response.result.error);
        });
}

/**
 * Load screen navigation structure from the spreadsheet
 * @param {*} spreadsheetName 
 * @param {*} callback 
 */
export function fetchNavScreens(spreadsheetName, callback) {

    let row = "A2";
    let column = "B";

    get(fetch_sheet_url, { spreadSheetName: spreadsheetName, column: row, row: column })
        .then((response) => {
            const data = response.rows;
            let screens = data.map((version, i) => {
                return { pageId: version[0], screen: version[1] };
            });

            callback({ screens });
        }, (response) => {
            callback(false, response.result.error);
        });
}

/**
 * Load the current amount of participants of the experiment from the spreadsheet
 * @param {*} callback 
 */
export function fetchParticipantsCounter(callback) {

    let spreadsheetName = constant.USER_PARTICIPANTS_COUNTER_SHEETNAME;
    let row = "B2";
    let column = "I";

    get(fetch_sheet_url, { spreadSheetName: spreadsheetName, column: row, row: column })
        .then((response) => {
            const data = response.rows;

            let participants = []
            let scenarios = []
            let groups = []
            let config = {
                participantsLimit: "",
                yearsEducLimit: "",
                scenariosLimit: ""
            }

            data.forEach(column => {
                //Participants table from column B to D
                if (column[0] !== "" && column[1] !== "" && column[2] !== "") {
                    participants.push([column[0], column[1], column[2]])
                }

                //Config parameters table from column G to I
                if (column[5] === "participants_per_sex_per_group") {
                    config.participantsLimit = column[6]
                } else if (column[5] === "years_education_limit") {
                    config.yearsEducLimit = column[6]
                } else if (column[5] === "participants_per_scenario_per_group") {
                    config.scenariosLimit = column[6]
                } else if (column[5].includes("scenario_")) {
                    scenarios.push(column[6])
                } else if (column[5].includes("group_")) {
                    groups.push({ minAge: column[6], maxAge: column[7] })
                }
            });


            callback({ participants, config, groups, scenarios });
        }, (response) => {
            callback(false, response.result.error);
        });
}

/**
 * Load reward info data from the spreadsheet
 * @param {*} callback 
 */
export function fetchRewardData(callback) {

    let spreadsheetName = constant.INPUT_REWARD_SHEETNAME;
    let row = "A2";
    let column = "C";

    get(fetch_sheet_url, { spreadSheetName: spreadsheetName, column: row, row: column })
        .then((response) => {
            const data = response.rows;
            let result = data.map((version, i) => {

                const indexScreen = 0
                const indexThreshold = 1
                const indexBonusPoints = 2

                return {
                    screen: version[indexScreen],
                    threshold: version[indexThreshold],
                    bonusPoint: version[indexBonusPoints]
                };
            });

            callback({ result });
        }, (response) => {
            callback(false, response.result.error);
        });
}

/**
 * Load reward info data from the spreadsheet
 * @param {*} callback 
 */
export function fetchAppGeneralMessages(callback) {

    let spreadsheetName = constant.INPUT_APP_MESSAGES;
    let row = "A2";
    let column = "B";

    get(fetch_sheet_url, { spreadSheetName: spreadsheetName, column: row, row: column })
        .then((response) => {
            const data = response.rows;
            let result = data.map((version, i) => {

                const indexKey = 0
                const indexValue = 1

                return {
                    key: version[indexKey],
                    value: version[indexValue]
                };
            });

            callback({ result });
        }, (response) => {
            callback(false, response.result.error);
        });
}


/**
 * Write results to GSheets
 * @param {*} data 
 * @param {*} callback 
 */
export function saveGeneralData(data, ariadnaUserID, callback) {
    let userdata = usergeneraldata(data, ariadnaUserID);
    let spreadSheetName = constant.USER_GENERAL_DATA_SHEETNAME;
    let row = "A2";
    let column = "Z";

    save(spreadSheetName, row, column, userdata, callback)
}

/**
 * Write results to GSheets
 * @param {*} data 
 * @param {*} callback 
 */
export function saveUserPSForm(data, callback) {
    let userPSForm = userpsform(data);
    let spreadSheetName = constant.USER_PSFORM_SHEETNAME;
    let row = "A2";
    let column = "D";

    save(spreadSheetName, row, column, userPSForm, callback)
}

/**
 * Write results to GSheets
 * @param {*} data 
 * @param {*} callback 
 */
export function saveUserInfo(data, callback) {
    let userInfo = userinfo(data);
    let spreadSheetName = constant.USER_INFO_SHEETNAME;
    let row = "A2";
    let column = "L";

    save(spreadSheetName, row, column, userInfo, callback)
}


/**
 * Write results to GSheets
 * @param {*} data 
 * @param {*} callback 
 */
export function saveUserForm(data, callback) {
    let userForm = userform(data);
    let spreadSheetName = constant.USER_FORM_SHEETNAME;
    let row = "A2";
    let column = "K";

    save(spreadSheetName, row, column, userForm, callback)
}

/**
 * Write results to GSheets
 * @param {*} data 
 * @param {*} callback 
 */
export function saveUserLogTime(data, callback) {
    let userLogtime = userlogtime(data);
    let spreadSheetName = constant.USER_LOGTIME_SHEETNAME;
    let row = "A2";
    let column = "F";

    save(spreadSheetName, row, column, userLogtime, callback)
}

/**
 * Write results to GSheets
 * @param {*} data 
 * @param {*} callback 
 */
export function saveUserVisualPattern(data, callback) {
    let userVisualPattern = uservisualpattern(data);
    let spreadSheetName = constant.USER_VISUAL_PATTERN_SHEETNAME;
    let row = "A2";
    let column = "L";

    save(spreadSheetName, row, column, userVisualPattern, callback)
}


/**
 * Helpers to format the data in the correct outputvalue
 * for a specific sheet
 */
const usergeneraldata = (data, ariadnaUserID) => {

    let result = [];
    for (let j = 0; j < data.length; j++) {
        let output = data[j];
        if (output.task === constant.USER_FORM_SCREEN) {
            result.push([
                output.userID,
                ariadnaUserID,
                output.task,
                output.timestamp, //created
                output.data.sex,
                output.data.age,
                output.data.profession,
                output.data.yearsEduc,
                output.data.levelEduc,
                output.data.typeAuction
            ]);
        } else if (output.task === constant.USER_INFO_SCREEN) {
            result.push([
                output.userID,
                ariadnaUserID,
                output.task,
                output.timestamp,
                output.data[0],
                output.data[1],
                output.data[2],
                output.data[3],
                output.data[4],
                output.data[5],
                output.data[6],
                output.data[7],
                output.data[8],
                output.data[9]
            ]);
        } else if (output.task === constant.PSFORM_SCREEN) {
            result.push([
                output.userID,
                ariadnaUserID,
                output.task,
                output.timestamp, //created
                output.data.questionCode,
                output.data.answer
            ]);
        } else if (output.task === constant.VISUAL_PATTERN_SCREEN || output.task === constant.VISUAL_PATTERN_DEMO_SCREEN) {
            let vp1 = output.data.map((item) => {
                return [
                    output.userID,
                    ariadnaUserID,
                    output.task,
                    output.timestamp, //created
                    (item.level + 1), //+1 to be more idiomatic: starts from level 1 insteado of level 0
                    item.dimention,
                    JSON.stringify(item.matrix),
                    JSON.stringify(item.matrixCheckResult),
                    item.matrixCheckResult.filter((element) => element === constant.TILE_SUCCESS).length, //we get the amount of success if any
                    item.matrixCheckResult.filter((element) => element === constant.TILE_ERROR).length, //we get the amount of errors if any
                    item.matrixCheckResult.filter((element) => element === constant.TILE_LEFT).length, //we get the amount of errors if any
                    item.retry,
                    item.timestamp
                ]
            });
            result = result.concat(vp1);
        }
    }

    return result;
}

function userinfo(data) {
    let result = [];

    const { userInfo, userID } = data;
    const now = Date.now();

    result.push([
        userID,
        userInfo.os.name,
        userInfo.os.version,
        userInfo.browser.name,
        userInfo.browser.version,
        userInfo.browser.major,
        userInfo.browser.language,
        userInfo.engine.name,
        userInfo.engine.version,
        userInfo.screen.width,
        userInfo.screen.height,
        now //created
    ]);


    return result;
}

function userform(data) {
    let result = [];
    // let data = this.props.data;
    const { userID, outputFormData, typeTask, ariadnaUserID } = data;
    const now = Date.now();

    result.push([
        userID,
        ariadnaUserID,
        outputFormData.sex,
        outputFormData.age,
        outputFormData.profession,
        outputFormData.yearsEduc,
        outputFormData.levelEduc,
        outputFormData.typeAuction,
        typeTask,
        true, //experimentCompleted,
        now //created
    ]);

    return result;
}

function userlogtime(data) {
    // UserID	QuestionID	QuestionNumber	SelectedAnswer
    let result = [];

    const { logTimestamp, userID } = data;
    const { screen, timestamp } = logTimestamp;
    const now = Date.now();

    for (let i = 0; i < screen.length; i++) {
        result.push([
            userID,
            screen[i],
            timestamp[i],
            Math.floor((((i + 1) < screen.length) ? (timestamp[i + 1] - timestamp[i]) : 0) / 1000),
            now //created
        ]);
    }

    return result;
}

function uservisualpattern(data) {
    const { userID, outputVisualPattern, outputVisualPatternDemo } = data;
    const now = Date.now();

    let resultDemo = outputVisualPatternDemo.map((output) => {
        return [
            userID,
            constant.VISUAL_PATTERN_DEMO_SCREEN,
            (output.level + 1),
            output.dimention,
            JSON.stringify(output.matrix),
            JSON.stringify(output.matrixCheckResult),
            output.matrixCheckResult.filter((item) => item === constant.TILE_SUCCESS).length,
            output.matrixCheckResult.filter((item) => item === constant.TILE_ERROR).length,
            output.matrixCheckResult.filter((item) => item === constant.TILE_LEFT).length,
            output.retry,
            output.timestamp,
            now //created
        ];
    });


    let result = outputVisualPattern.map((output) => {
        return [
            userID,
            constant.VISUAL_PATTERN_SCREEN,
            (output.level + 1),
            output.dimention,
            JSON.stringify(output.matrix),
            JSON.stringify(output.matrixCheckResult),
            output.matrixCheckResult.filter((item) => item === constant.TILE_SUCCESS).length,
            output.matrixCheckResult.filter((item) => item === constant.TILE_ERROR).length,
            output.matrixCheckResult.filter((item) => item === constant.TILE_LEFT).length,
            output.retry,
            output.timestamp,
            now //created
        ];
    });

    return resultDemo.concat(result);
}

function userpsform(data) {
    let result = [];
    const { outputPSForm, userID } = data;
    const now = Date.now();

    for (let i = 0; i < outputPSForm.length; i++) {
        result.push([
            userID,
            outputPSForm[i].questionCode,
            outputPSForm[i].answer,
            now //created
        ]);
    }

    return result;
}

