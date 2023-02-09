import React, { Component } from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
//UUID
import { v4 as uuidv4 } from 'uuid'; // For version 4

//SessionTimer
import IdleTimer from 'react-idle-timer'

//Parse URL
import queryString from 'query-string'
// Loader
import FadeLoader from "react-spinners/FadeLoader";
import SyncLoader from "react-spinners/SyncLoader";

//Style
import "./style.css"

// helpers
import * as request from '../../helpers/fetch';
import * as constant from '../../helpers/constants';
import { USER_INFO, randomNumber } from '../../helpers/utils';

// Views
import Footer from "../Footers/Footer";
import Instruction from "./Instruction"
import UserForm from "./UserForm";
import VisualPatternTask from "./VisualPatternTask";
import VisualPatternDemoTask from "./VisualPatternDemoTask";
import PSForm from "./PSForm";
import BargainTask from "./BargainTask/BargainTask";
import BargainDemoTask from "./BargainTask/BargainDemoTask";
import MultiAttribute from "./MultiAttribute";
import MultiAttributeDemo from "./MultiAttributeDemo/MultiAttributeDemoV3";

const DEBUG = (process.env.REACT_APP_DEBUG_LOG === "true") ? true : false;
const PROLIFIC_REDIRECT_REJECT = process.env.REACT_APP_PROLIFIC_REDIRECT_REJECT;
const PROLIFIC_REDIRECT_ACCEPTED = process.env.REACT_APP_PROLIFIC_REDIRECT_ACCEPTED;

class Index extends Component {
    constructor(props) {
        super(props);

        const userID = uuidv4();
        const userGeneralInfo = { //default value - user info loaded
            userID: userID,
            task: constant.USER_INFO_SCREEN,
            data: [
                this.props.match.params.version,
                USER_INFO.os.name,
                USER_INFO.os.version,
                USER_INFO.browser.name,
                USER_INFO.browser.version,
                USER_INFO.browser.major,
                USER_INFO.browser.language,
                USER_INFO.engine.name,
                USER_INFO.engine.version,
                USER_INFO.screen.width,
                USER_INFO.screen.height
            ],
            sync: constant.STATE_NOT_SYNC
        }
        const generalOutputDefault = [userGeneralInfo]
        const typeTask = this.getTypeTask()
        const studyParams = queryString.parse(this.props.location.search)
        const userFormDefault = {
            sex: constant.TEXT_EMPTY,//default selected sex
            age: 0,
            yearsEduc: 0,
            levelEduc: constant.FORM_LEVEL_EDUC_DEFAULT, //default selected 
            profession: constant.TEXT_EMPTY,
            typeAuction: constant.TEXT_EMPTY
        }

        this.state = {
            studyParams: studyParams,
            userID: userID,
            userInfo: USER_INFO,
            typeTask: typeTask,
            //Variables for input data
            inputNavigation: [],
            inputTextInstructions: [],
            inputParticipants: [],
            inputPSForm: [],
            inputStores: { storesLong: [], storesShort: [] },
            //Variables for output data (results)
            generalOutput: generalOutputDefault,
            generalOutputIndexes: [],
            outputFormData: userFormDefault,
            outputPSForm: [],
            outputBargainTask: { task: [], demo: [] },
            outputVisualPattern: { task: [], demo: [] },
            //utils
            logTimestamp: { screen: [], timestamp: [] },
            currentScreenNumber: 0,
            showAlertWindowsClosing: true,
            loading: false,
            loadingSyncData: false
        };

        //session timer
        this.idleTimer = null

        if (DEBUG) console.log(`PROLIFIC_REDIRECT_REJECT:${PROLIFIC_REDIRECT_REJECT}`);
        if (DEBUG) console.log(`PROLIFIC_REDIRECT_ACCEPTED:${PROLIFIC_REDIRECT_ACCEPTED}`);
        if (DEBUG) console.log(`Debug:${DEBUG}`);
    }

    getTypeTask = () => {
        const version = this.props.match.params.version
        const pathname = this.props.location.pathname

        if (version !== undefined) return version

        if (pathname === constant.EXPERIMENT_TYPE_TASK_PATHNAME) return constant.EXPERIMENT_TYPE_BASIC
    }

    onAction = (e) => {
        // if(DEBUG) console.log('user did something', e)
    }

    onActive = (e) => {
        // if(DEBUG) console.log('user is active', e)
        // if(DEBUG) console.log('time remaining', this.idleTimer.getRemainingTime())

        if (this.idleTimer.getRemainingTime() === 0) {
            alert(constant.SESSION_TIMEOUT_MESSAGE);
            document.location.reload();
        }
    }

    onIdle = (e) => {
        // if(DEBUG) console.log('user is idle', e)
        // if(DEBUG) console.log('last active', this.idleTimer.getLastActiveTime())
    }

    /**
     * Check user authenification status and set app state accordingly
     *     
     ** Sequence calling:
    * fetchNavScreens
    * fetchParticipantsCounter
    * fetchPSForm
     */
    _fetchExperimentInputData() {
        if (DEBUG) console.log("Fetch navigationScreens");
        request.fetchUserInitialData(this.state.typeTask, this._onLoadInitialDataCallBack.bind(this))
    }

    /**
    * Save Data - Synchronously
    * 
    ** Sequence calling:
    * request.saveUserInfo()
    * request.saveUserLogTime()
    * request.userVisualPattern()
    * request.saveUserPSForm
     */
    _syncData() { //if the experiment is not completed, the data is still not sync
        if (DEBUG) console.log("Sync Data...");

        request.saveUserInfo(this.state, this._onSaveUserInfoCallBack.bind(this))
    }

    /**
    * Save Data - Asynchronously
    * Used when the browser window is closing
    * 
     */
    _asyncData() { //if the experiment is not completed, the data is still not sync
        if (DEBUG) console.log("Async Data...");

        const { generalOutput } = this.state
        let itemsNotSyncedAmount = generalOutput.filter(item => item.sync === constant.STATE_NOT_SYNC).length

        if (itemsNotSyncedAmount > 0) { //if we have items not synced yet
            this._syncGeneralData()
        }
    }

    /**
     * 
     */
    _syncGeneralData() {
        const { generalOutput, generalOutputIndexes, studyParams } = this.state
        let itemsNotSynced = []
        let itemsNotSyncedIndexes = []

        for (let i = 0; i < generalOutput.length; i++) {
            if (generalOutput[i].sync === constant.STATE_NOT_SYNC) {
                itemsNotSynced.push(generalOutput[i])
                itemsNotSyncedIndexes.push(i)
            }
        }

        if (DEBUG) console.log("Syncing GeneralData now")
        if (DEBUG) console.log(itemsNotSynced)

        for (let i = 0; i < generalOutput.length; i++) {
            if (generalOutput[i].sync === constant.STATE_NOT_SYNC) {
                generalOutput[i].sync = constant.STATE_SYNCING
            }
        }

        request.saveGeneralData(itemsNotSynced, studyParams, this._onSaveGeneralDataCallBack.bind(this))

        this.setState({
            generalOutput: generalOutput,
            generalOutputIndexes: generalOutputIndexes.concat(itemsNotSyncedIndexes),
            loadingSyncData: true
        })
    }


    /********************************************************** 
     *   Callbacks from async request - get data (see fetch.js)
     **********************************************************/

    /**
     * 
     * @param {*} data 
     * @param {*} error 
     */
    _onAsyncDataCallBack(data, error) {
        if (DEBUG) console.log(data)
        if (DEBUG) console.log(error)
    }

    /**
     * Once the navigation screen structure have been loaded from the spreadsheet
     * @param {*} data 
     * @param {*} error 
     */
    _onLoadInitialDataCallBack(data, error) {
        if (data) {
            this.setState({
                inputNavigation: data.screens,
                inputParticipants: { participants: data.participants, total: data.totalParticipants }
            })

            if (DEBUG) console.log(data)
            request.fetchStores(constant.STORES_LONG_TYPE, this._onLoadStoresLongDataCallBack.bind(this))
        } else {
            this.setState({
                loading: false,
            }, () => {
                alert(`${error}. Please refresh page.`)
                if (DEBUG) console.log(error)
            })
        }
    }

    /**
     * Once the navigation screen structure have been loaded from the spreadsheet
     * @param {*} data 
     * @param {*} error 
     */
    _onLoadStoresLongDataCallBack(data, error) {
        if (data) {

            const { inputStores } = this.state
            inputStores.storesLong = data.response

            this.setState({
                inputStores: inputStores
            })

            if (DEBUG) console.log(data)
            request.fetchStores(constant.STORES_SHORT_TYPE, this._onLoadStoresShortDataCallBack.bind(this))
        } else {
            this.setState({
                loading: false,
            }, () => {
                alert(`${error}. Please refresh page.`)
                if (DEBUG) console.log(error)
            })
        }
    }

    /**
     * 
     * @param {*} data 
     * @param {*} error 
     */
    _onLoadStoresShortDataCallBack(data, error) {
        if (data) {
            //Loggin the first screen of the navigation
            const { inputStores, inputNavigation } = this.state

            inputStores.storesShort = data.response

            this.setState({
                loading: false, //Hide loading
                inputStores: inputStores,
                logTimestamp: {
                    screen: [inputNavigation[0].screen],//we grap the first screen
                    timestamp: [Date.now()]//we log the first screen we are entering in
                }
            }, () => {
                if (DEBUG) console.log(this.state)
            });

        } else {
            this.setState({
                loading: false,
            }, () => {
                alert(`${error}. Please refresh page.`)
                if (DEBUG) console.log(error)
            })
        }
    }

    /**
     * Once all the necessary experiment text have been loaded from the spreadsheet 
     * @param {*} data 
     * @param {*} error 
     */
    _onLoadAppTextCallBack(data, error) {
        if (data) {
            this.setState({
                inputTextInstructions: data.appText
            })
            if (DEBUG) console.log(data)

            request.fetchPSFormData(this.state.outputFormData.sex, this._onLoadPSFormCallback.bind(this));

        } else {
            this.setState({
                loading: false,
            }, () => {
                alert(`${error}. Please refresh page.`)
                if (DEBUG) console.log(error)
            })

        }
    }

    /**
    * Once the psychology questionnaries input have been loaded from the spreadsheet
    * @param {*} data 
    * @param {*} error 
    */
    _onLoadPSFormCallback(data, error) {
        if (data) {

            this.setState({
                loading: false, //Hide loading
                inputPSForm: data.result,
                typeTask: constant.EXPERIMENT_TYPE_LONG
            }, () => {
                if (DEBUG) console.log(this.state)
                this._goToNextTaskInInputNavigation();
            });

        } else {
            this.setState({
                loading: false,
            }, () => {
                alert(`${error}. Please refresh page.`)
                if (DEBUG) console.log(error)
            })
        }
    }


    /********************************************************** 
     *   Callbacks from async request - save data (see fetch.js)
     **********************************************************/

    /**
     * Results from saving user info data
     * @param {*} data 
     * @param {*} error 
     */
    _onSaveUserInfoCallBack(data, error) {
        if (DEBUG) console.log(data);
        if (data) {
            if (DEBUG) console.log("SaveUserInfo");
            request.saveUserLogTime(this.state, this._onSaveUserLogTimeCallBack.bind(this))
        } else {
            if (DEBUG) console.log("Error saving user info")
            this.setState({ loading: false });
        }
    }

    /**
     * Results from saving user logtime data
     * @param {*} data 
     * @param {*} error 
     */
    _onSaveUserLogTimeCallBack(data, error) {
        if (DEBUG) console.log(data);
        if (data) {
            if (DEBUG) console.log("SaveUserLogTime");
            request.saveUserVisualPattern(this.state, this._onSaveUserVisualPatternCallBack.bind(this))
        } else {
            if (DEBUG) console.log("Error saving user logtime")
            this.setState({ loading: false });
        }
    }

    /**
     * Results from saving user visual pattern data
     * @param {*} data 
     * @param {*} error 
     */
    _onSaveUserVisualPatternCallBack(data, error) {
        if (DEBUG) console.log(data);
        if (data) {
            if (DEBUG) console.log("SaveUserVisualPattern");
            request.saveUserPSForm(this.state, this._onSaveUserPSFormCallBack.bind(this))
        } else {
            if (DEBUG) console.log("Error saving user visualPattern")
            this.setState({ loading: false });
        }
    }

    /**
    * Results from saving user ps questionaries data
    * @param {*} data 
    * @param {*} error 
    */
    _onSaveUserPSFormCallBack(data, error) {
        if (DEBUG) console.log(data);
        if (data) {
            if (DEBUG) console.log("SaveUserPSForm");

            request.saveBargains(this.state, this._onSaveUserBargainCallBack.bind(this))

        } else {
            if (DEBUG) console.log("Error saving user psform")
            this.setState({ loading: false });
        }
    }

    /**
     * 
     * @param {*} data 
     * @param {*} error 
     */
    _onSaveUserBargainCallBack(data, error) {
        if (DEBUG) console.log(data);
        if (data) {
            if (DEBUG) console.log("SaveUserBargain");

            //redirect to PROLIFIC
            window.location.replace(PROLIFIC_REDIRECT_ACCEPTED);

        } else {
            if (DEBUG) console.log("Error saving UserBargain")
            this.setState({ loading: false });
        }
    }

    /**
     * Results from saving user general data
     * @param {*} data 
     * @param {*} error 
     */
    _onSaveGeneralDataCallBack(data, error) {
        if (data) {
            const { generalOutput, generalOutputIndexes } = this.state
            for (let i = 0; i < generalOutputIndexes.length; i++) {
                if (generalOutput[generalOutputIndexes[i]].sync === constant.STATE_SYNCING) {
                    generalOutput[generalOutputIndexes[i]].sync = constant.STATE_SYNC
                }
            }

            this.setState({
                loadingSyncData: false,
                generalOutput: generalOutput
            })
            if (DEBUG) console.log(data)
            if (DEBUG) console.log("Success General data!")
        }
        else {
            this.setState({
                loading: false,
            }, () => {
                alert(`${error}. Please refresh page.`)
                if (DEBUG) console.log(error)
            })
        }
    }


    /********************
     * COMPONENTS HANDLER
     ********************/

    /**
     * Manage results comming from User Form Data
     * UserForm component (UserForm.js)
     * @param {*} evt 
     */
    formHandler = (formData) => {
        const { generalOutput, userID } = this.state

        if (DEBUG) console.log(formData)

        //we find the index of userform to update the same element instead of adding a new one in array
        let index = -1;
        for (let i = 0; i < generalOutput.length; i++) {
            if (generalOutput[i].task === constant.USER_FORM_SCREEN) {
                index = i;
                break;
            }
        }

        if (index === -1) { //does not exists yet
            generalOutput.push({
                userID: userID,
                task: constant.USER_FORM_SCREEN,
                data: formData,
                sync: constant.STATE_NOT_SYNC
            })
        } else { //we update existing values
            generalOutput[index] = {
                userID: userID,
                task: constant.USER_FORM_SCREEN,
                data: formData,
                sync: constant.STATE_NOT_SYNC
            }
        }

        //save results
        this.setState({
            outputFormData: formData,
            generalOutput: generalOutput
        }, () => {
            this._validateToNextPage()
        })
    }

    /**
     * Manage results comming from Psychology questionaries
     * PSFORM component (PSForm.js)
     * @param {*} evt 
     */
    psFormHandler = (result) => {
        const { outputPSForm, generalOutput, userID } = this.state;

        if (DEBUG) console.log(result.questionCode)
        if (DEBUG) console.log(result.answer)

        let outputPSFormIndex = -1;
        //if something already exists, we loop through to find the element
        for (let i = 0; i < outputPSForm.length; i++) {
            if (outputPSForm[i].questionCode === result.questionCode) {  //if it is something already selected, we find that code and updated it
                outputPSFormIndex = i;
                break;
            }
        }

        if (outputPSFormIndex === -1) {
            outputPSForm.push(result)
        } else {
            outputPSForm[outputPSFormIndex] = result
        }


        //we find the index of userform to update the same element instead of adding a new one in array
        let generalOutputIndex = -1;
        for (let i = 0; i < generalOutput.length; i++) {
            if ((generalOutput[i].task === constant.PSFORM_SCREEN) &&
                (generalOutput[i].data.questionCode === result.questionCode)) {
                generalOutputIndex = i;
                break;
            }
        }

        if (generalOutputIndex === -1) {
            generalOutput.push({
                userID: userID,
                task: constant.PSFORM_SCREEN,
                data: result,
                sync: constant.STATE_NOT_SYNC
            })
        } else {
            generalOutput[generalOutputIndex] = {
                userID: userID,
                task: constant.PSFORM_SCREEN,
                data: result,
                sync: constant.STATE_NOT_SYNC
            }
        }

        //save results
        this.setState({
            outputPSForm: outputPSForm,
            generalOutput: generalOutput
        }, () => {
            if (DEBUG) console.log(this.state)
            this._checkSyncGeneralData()

            //we simulate a space btn pressed because Auction task already finishes with a space btn pressed
            this._validateToNextPage()
        })
    }

    /**
     * Manage results comming from VisualPattern component (VisualPatternTask.js)
     * @param {*} results 
     */
    visualPatternTaskHandler = (results) => {
        if (DEBUG) console.log(results)

        const { generalOutput, userID, outputVisualPattern } = this.state;

        generalOutput.push({
            userID: userID,
            task: constant.VISUAL_PATTERN_SCREEN,
            data: results,
            sync: constant.STATE_NOT_SYNC
        })

        outputVisualPattern.task = results

        //save results
        this.setState({
            outputVisualPattern: outputVisualPattern,
            generalOutput: generalOutput
        }, () => {
            //we simulate a space btn pressed because VisualPattern already finishes with a space btn pressed
            this._validateToNextPage()
        })
    }

    /**
     * Manage results comming from VisualPatternDemo component (VisualPatternDemoTask.js)
     * @param {*} results 
     */
    visualPatternDemoTaskHandler = (results) => {
        if (DEBUG) console.log(results)
        const { generalOutput, userID, outputVisualPattern } = this.state;

        generalOutput.push({
            userID: userID,
            task: constant.VISUAL_PATTERN_DEMO_SCREEN,
            data: results,
            sync: constant.STATE_NOT_SYNC
        })

        outputVisualPattern.demo = results

        //save results
        this.setState({
            outputVisualPattern: outputVisualPattern,
            generalOutput: generalOutput
        }, () => {
            //we simulate a space btn pressed because VisualPattern already finishes with a space btn pressed
            this._validateToNextPage()
        })
    }

    /**
     * 
     * @param {*} results 
     */
    bargainTaskDemoTaskHandler = (results) => {
        if (DEBUG) console.log(results)
        const { outputBargainTask } = this.state;

        outputBargainTask.demo = results

        //save results
        this.setState({
            outputBargainTask: outputBargainTask
        }, () => {
            //we simulate a space btn pressed because VisualPattern already finishes with a space btn pressed
            this._validateToNextPage()
        })
    }

    /**
     * 
     * @param {*} bargainResults 
     */
    bargainTaskHandler = (bargainResults) => {
        if (DEBUG) console.log("Bargain RESULTS")
        if (DEBUG) console.log(bargainResults)
        const { generalOutput, outputBargainTask, userID } = this.state;

        let resultsB = (outputBargainTask.task.results === undefined || outputBargainTask.task.results.length === 0) ? bargainResults.results : outputBargainTask.task.results.concat(bargainResults.results)
        outputBargainTask.task = { isTaskCompleted: bargainResults.isTaskCompleted, results: resultsB }

        generalOutput.push({
            userID: userID,
            task: constant.BARGAIN_SCREEN,
            data: bargainResults.results,
            sync: constant.STATE_NOT_SYNC
        })

        //save results
        this.setState({
            outputBargainTask: outputBargainTask,
            generalOutput: generalOutput
        }, () => {
            this._checkSyncGeneralData()
            //we simulate a space btn pressed because VisualPattern already finishes with a space btn pressed
            this._validateToNextPage()
        })
    }

    /**
 * 
 * @param {*} bargainResults 
 */
    multiAttributeHandler = (selectedOptionsResult) => {
        //we simulate a space btn pressed because multiAttribute already finishes with a space btn pressed
        this._validateToNextPage()
    }

    /**
     * 
     * @param {*} isValidToAdvance 
     */
    instructionHandler = (isValidToAdvance) => {
        if (isValidToAdvance) {
            this._validateToNextPage()
        }
    }

    /**
     * 
     * @param {*} isValidToAdvance 
     * @param {*} numberStepsBack 
     */
    instructionHandlerBack = (isValidToAdvance, numberStepsBack) => {
        if (DEBUG) console.log("Valid to advance")
        if (DEBUG) console.log(this.state.currentScreenNumber)
        if (DEBUG) console.log(numberStepsBack)
        if (isValidToAdvance) {
            this.setState({
                currentScreenNumber: this.state.currentScreenNumber - numberStepsBack
            }, () => {
                if (DEBUG) console.log(this.state.currentScreenNumber)
                //we simulate a space btn pressed because VisualPattern already finishes with a space btn pressed
                this._goToNextTaskInInputNavigation()
            })
        }
    }

    /*********************************************************
     * VALIDATE DATA OF EACH COMPONENT BEFORE GOING TO NEXT PAGE
     **********************************************************/

    /**
    * Validate user form results
    */
    validateForm() {
        const { outputFormData, inputParticipants } = this.state
        const { sex, age, yearsEduc, levelEduc } = outputFormData;
        const groups = constant.PARTICIPANTS_GROUPS
        const firstGroupAgeLimit = groups[0]
        const secondGroupAgeLimit = groups[1]
        const thirdGroupAgeLimit = groups[2]

        const participantsLimitPerSexPerGroup = inputParticipants.total / 2
        const yearsEducLimit = constant.YEARS_EDUCATION_LIMIT

        const femaleParticipants = inputParticipants.participants[0];
        const maleParticipants = inputParticipants.participants[1];

        const indexFirstGroup = 0
        const indexSecondGroup = 1
        const indexThirdGroup = 2

        if (DEBUG) console.log("validateForm")
        if (DEBUG) console.log(outputFormData)
        let data = {
            isValid: false,
            redirect: false
        }

        let amountParticipant = 0;
        let ageIncorrectIntervalFlag = false;

        // CONTROL OF AMOUNT OF PARTICIPANTS
        if (age >= parseInt(firstGroupAgeLimit.minAge) &&
            age <= parseInt(firstGroupAgeLimit.maxAge)) { //firstGroup
            amountParticipant = sex === constant.FEMALE_VALUE ? femaleParticipants[indexFirstGroup] : maleParticipants[indexFirstGroup];
        } else if (age >= parseInt(secondGroupAgeLimit.minAge) &&
            age <= parseInt(secondGroupAgeLimit.maxAge)) { //secondGroup
            amountParticipant = sex === constant.FEMALE_VALUE ? femaleParticipants[indexSecondGroup] : maleParticipants[indexSecondGroup];
        } else if (age >= parseInt(thirdGroupAgeLimit.minAge) &&
            age <= parseInt(thirdGroupAgeLimit.maxAge)) { //thirdGroup
            amountParticipant = sex === constant.FEMALE_VALUE ? femaleParticipants[indexThirdGroup] : maleParticipants[indexThirdGroup];
        } else {
            ageIncorrectIntervalFlag = true;
        }


        if (ageIncorrectIntervalFlag || parseInt(amountParticipant) >= participantsLimitPerSexPerGroup ||
            levelEduc === constant.FORM_LEVEL_EDUC_INITIAL || yearsEduc < yearsEducLimit) {
            data.redirect = true;
        }

        if (!data.redirect) data.isValid = true;


        return data;
    }

    /**
     * Validate PS Form questionaries results
     */
    validatePSForm() {
        const { inputPSForm, outputPSForm } = this.state

        return { isValid: (outputPSForm.length === inputPSForm.length) }
    }

    /**
     * Validate Visual Pattern task results
     */
    validateVisualPattern() {
        const { outputVisualPattern } = this.state;

        return { isValid: (outputVisualPattern.task.length > 0) }
    }

    /**
     * Validate Visual Pattern demo task results
     */
    validateVisualPatternDemo() {
        const { outputVisualPattern } = this.state;

        return { isValid: (outputVisualPattern.demo.length > 0) }
    }

    validateBargainDemo() {
        const { outputBargainTask } = this.state;

        return { isValid: (outputBargainTask.demo.isTaskCompleted) }
    }

    validateBargainTask() {
        const { outputBargainTask } = this.state;

        return { isValid: (outputBargainTask.task.isTaskCompleted) }
    }

    /**
     * Validate components before navigating between pages. Space key pressed
     */
    _validateToNextPage() {
        const { currentScreenNumber, inputNavigation, outputFormData } = this.state;
        const { screen, type } = inputNavigation[currentScreenNumber];

        let totalLength = inputNavigation.length;

        if (currentScreenNumber < totalLength) { //To prevent keep transition between pages
            if (type === constant.INSTRUCTION_SCREEN) {
                this._goToNextTaskInInputNavigation();
            } else if (screen === constant.PSFORM_SCREEN) {
                let data = this.validatePSForm();
                if (data.isValid) this._goToNextTaskInInputNavigation();
            } else if (screen === constant.VISUAL_PATTERN_SCREEN) {
                let data = this.validateVisualPattern();
                if (data.isValid) this._goToNextTaskInInputNavigation();
            } else if (screen === constant.VISUAL_PATTERN_DEMO_SCREEN) {
                let data = this.validateVisualPatternDemo();
                if (data.isValid) this._goToNextTaskInInputNavigation();
            } else if (screen === constant.BARGAIN_DEMO_SCREEN) {
                let data = this.validateBargainDemo();
                if (data.isValid) this._goToNextTaskInInputNavigation();
            } else if (screen === constant.BARGAIN_SCREEN) {
                let data = this.validateBargainTask();
                if (data.isValid) this._goToNextTaskInInputNavigation();
            } else if (screen === constant.MULTRIATTRIBUTE_SCREEN) {
                this._goToNextTaskInInputNavigation();
            } else if (screen === constant.MULTRIATTRIBUTE_DEMO_SCREEN) {
                this._goToNextTaskInInputNavigation();
            } else if (screen === constant.USER_FORM_SCREEN) {
                // let data = this.validateForm();

                // if (data.isValid) {
                //     this._randomUserScenarioAssignment()

                //     this._goToNextTaskInInputNavigation();
                // } else {
                //     if (data.redirect) {
                //         //we redirect to Ariadna
                //         alert(constant.PARTICIPANTS_QUOTA_FULL_ALERT_ERROR);
                //         this.setState({ showAlertWindowsClosing: false }, () => {
                //             window.location.replace(PROLIFIC_REDIRECT_REJECT);
                //         })
                //     }
                // }

                //Get texts per sex, and after, go to next page
                this.setState({ loading: true }, () => {
                    request.fetchAppText(outputFormData.sex, this._onLoadAppTextCallBack.bind(this))
                });
            }
        }
    }

    _randomUserScenarioAssignment() {
        const { inputParticipants, outputFormData } = this.state;
        const { sex, age } = outputFormData;
        const groups = constant.PARTICIPANTS_GROUPS
        const firstGroupAgeLimit = groups[0]
        const secondGroupAgeLimit = groups[1]
        const thirdGroupAgeLimit = groups[2]
        const scenarios = constant.SCENARIOS
        const participantsLimitPerScenarioPerSexPerGroup = inputParticipants.total / 4
        const scenariosSex = (sex === constant.FEMALE_VALUE) ? 0 : 2

        let randomNumberGenerated = []
        let scenarioNumber = 0
        let groupAge = 0

        if (age >= parseInt(firstGroupAgeLimit.minAge) &&
            age <= parseInt(firstGroupAgeLimit.maxAge)) { //firstGroup
            groupAge = 0
        } else if (age >= parseInt(secondGroupAgeLimit.minAge) &&
            age <= parseInt(secondGroupAgeLimit.maxAge)) { //secondGroup
            groupAge = 1
        } else if (age >= parseInt(thirdGroupAgeLimit.minAge) &&
            age <= parseInt(thirdGroupAgeLimit.maxAge)) { //thirdGroup
            groupAge = 2
        }


        //Logic to assign and check scenarios availability
        while (true) {
            scenarioNumber = randomNumber(0, (scenarios.length - 1))

            if (randomNumberGenerated.includes(scenarioNumber)) { //If we already have generated a certain number, we do not check again scenario availability, we only check if we have seen all number options availables
                if (randomNumberGenerated.length === scenarios.length) {
                    alert(constant.PARTICIPANTS_QUOTA_FULL_ALERT_ERROR);
                    this.setState({ showAlertWindowsClosing: false }, () => {
                        window.location.replace(PROLIFIC_REDIRECT_REJECT);
                    })
                    break;
                }
            } else { //if we generated a new number option, we add it to randomNumberGenerated and check that scenario availability 
                randomNumberGenerated.push(scenarioNumber)
                //Index in inputParticipant array are:
                // indexScenario1F = 2
                // indexScenario2F = 3
                // indexScenario1M = 4
                // indexScenario2M = 5
                //ScenarioNumber should be a random number between 0 and 1 (there are two scenarios),
                //so if we add 2, plus scenarioSex (0 if Female, 2 is Male), we have the correct table index with values for the scenario 

                let indexScenarioSex = scenarioNumber + 2 + scenariosSex

                if (DEBUG) console.log("scenarioNumber: " + scenarioNumber)
                if (DEBUG) console.log("indexScenarioSex: " + indexScenarioSex)
                if (DEBUG) console.log("participantsLimitPerScenarioPerSexPerGroup: " + participantsLimitPerScenarioPerSexPerGroup)
                if (DEBUG) console.log("groupAge: " + groupAge)
                if (DEBUG) console.log("scenarios: " + scenarios)
                if (DEBUG) console.log(inputParticipants.participants[indexScenarioSex][groupAge])

                if (inputParticipants.participants[indexScenarioSex][groupAge] < parseInt(participantsLimitPerScenarioPerSexPerGroup)) {
                    break;
                }
            }
        }


        //we update select hotel value
        this.setState({ typeTask: (scenarios[scenarioNumber] === constant.EXPERIMENT_TYPE_LONG ? constant.EXPERIMENT_TYPE_LONG : constant.EXPERIMENT_TYPE_SHORT) })
    }

    /**
     * We move to next page, according to inputNavigation input data
     */
    _goToNextTaskInInputNavigation() {
        const { currentScreenNumber, inputNavigation, logTimestamp, showAlertWindowsClosing } = this.state;
        const { screen, timestamp } = logTimestamp

        let currentScreen = inputNavigation[currentScreenNumber].screen;
        let loading = false
        let now = Date.now();
        let totalLength = inputNavigation.length;
        let nextScreenNumber = currentScreenNumber + 1;
        let showAlertWindowsClosingTmp = showAlertWindowsClosing;

        if (nextScreenNumber >= totalLength) return

        let nextScreen = inputNavigation[nextScreenNumber].screen;

        screen.push(nextScreen);//set timestamp
        timestamp.push(now);

        if (nextScreenNumber === (totalLength - 1)) { //Last screen!
            // SYNC DATA
            showAlertWindowsClosingTmp = false
            loading = true //Show Loading
        }


        this.setState({
            showAlertWindowsClosing: showAlertWindowsClosingTmp,
            currentScreenNumber: nextScreenNumber,
            logTimestamp: {
                screen: screen,
                timestamp: timestamp
            },
            loading: loading
        }, () => {
            if (DEBUG) console.log(this.state)

            if (nextScreenNumber === (totalLength - 1)) { //Last screen!
                this._syncData() //call syncdata after the experiment is completed and updated its value to true
            }

            this._checkSyncGeneralData()
        });
    }

    /**
     * 
     */
    _checkSyncGeneralData() {
        const { generalOutput } = this.state
        let itemsNotSyncedAmount = generalOutput.filter(item => item.sync === constant.STATE_NOT_SYNC).length

        if (itemsNotSyncedAmount >= constant.SYNC_AMOUN_ITEMS) {
            this._syncGeneralData()
        }
    }

    /**
     * Manage the state when the browser window is closing
     * @param {*} event 
     */
    handleWindowClose = (event) => {
        if (this.state.showAlertWindowsClosing) { //we redirect without showing closing window alert
            let message = "Alerted Browser Close";
            event.preventDefault()
            event.returnValue = message
        }
        if (DEBUG) console.log(event)

        //we syncdata before the windows closes
        this._asyncData();
    }

    componentDidMount() {
        // Scroll back at the top of the page
        document.documentElement.scrollTop = 0;
        document.scrollingElement.scrollTop = 0;
        // this.refs.main.scrollTop = 0;

        // HTML prevent space bar from scrolling page
        window.addEventListener(constant.EVENT_KEY_DOWN, function (e) {
            if (e.keyCode === constant.SPACE_KEY_CODE && e.target === document.body) {
                e.preventDefault();
            }
        });
        // listener for windows closes detection
        window.addEventListener(constant.EVENT_BEFORE_UNLOAD, this.handleWindowClose);

        this.setState({ loading: true }); //Show Loading

        //we start fetching all the necesary data for the experiment
        this._fetchExperimentInputData();
    }

    componentWillUnmount() {
        this._asyncData();

        window.removeEventListener(constant.EVENT_BEFORE_UNLOAD, this.handleWindowClose);
    }

    render() {
        const { loading, loadingSyncData } = this.state;
        const timeout = 1000 * 60 * (60 * 3); //3horas
        return (
            <DndProvider backend={HTML5Backend}>
                <section className="section-sm">
                    <div id="content" style={{ marginTop: "20px", marginBottom: "20px" }}>
                        {changePages(this.state, this)}
                    </div>
                    <div>
                        {isFooterShownInCurrentScreen(this.state)}
                    </div>
                </section>
                <div>
                    <IdleTimer
                        ref={ref => { this.idleTimer = ref }}
                        element={document}
                        onActive={this.onActive}
                        onIdle={this.onIdle}
                        onAction={this.onAction}
                        debounce={250}
                        timeout={timeout} />
                </div>
                <div className="fade-loader">
                    <FadeLoader
                        size={50}
                        color={constant.BLUE}
                        loading={loading}
                    />
                </div>
                <div className="sync-loader">
                    <SyncLoader
                        size={7}
                        margin={3}
                        color={constant.BLUE}
                        loading={loadingSyncData}
                    />
                </div>
            </DndProvider>
        )
    }
}

function isFooterShownInCurrentScreen(state) {
    if (state.inputNavigation.length === 0) return //not input data received yet

    const { currentScreenNumber, inputNavigation } = state;
    const { screen, type } = inputNavigation[currentScreenNumber];

    let isFooterShown = false
    let footerText = constant.TEXT_FOOTER

    if (type === constant.INSTRUCTION_SCREEN) {
        if (screen.includes(constant.VISUAL_PATTERN) || screen.includes(constant.MULTRIATTRIBUTE_SCREEN)) {
            isFooterShown = true;
        } else if (screen.includes("Bargain")) {
            if (!screen.includes("BeforeFinish")) {
                isFooterShown = true;
            }

            if (!screen.includes("Finish")) {
                footerText = constant.TEXT_FOOTER_ENTER
            }
        }
    } else if (screen === constant.PSFORM_SCREEN) {
        isFooterShown = true;
    } else if (screen === constant.USER_FORM_SCREEN) {
        isFooterShown = true;
        footerText = constant.TEXT_FOOTER_ENTER
    }

    return ((isFooterShown) ? <Footer text={footerText} /> : <></>)
}

/**
 * Call to a specific component. Prepare the input data for the component
 * @param {*} state
 * @param {*} context
 */
function changePages(state, context) {

    const { currentScreenNumber,
        inputNavigation,
        inputTextInstructions,
        inputPSForm, inputStores, typeTask } = state;
    const totalLength = inputNavigation.length;

    if (totalLength === 0 || currentScreenNumber >= totalLength) return //To prevent keep transition between pages

    const { screen, type } = inputNavigation[currentScreenNumber];

    document.body.style.backgroundColor = (type === constant.INSTRUCTION_SCREEN) ? constant.WHITE : constant.LIGHT_GRAY;

    if (type === constant.INSTRUCTION_SCREEN) {
        return <Instruction action={context.instructionHandler} typeTask={typeTask} actionBack={context.instructionHandlerBack} text={inputTextInstructions} name={screen} />;
    } else if (screen === constant.USER_FORM_SCREEN) {
        return <UserForm action={context.formHandler} />;
    } else if (screen === constant.VISUAL_PATTERN_SCREEN) {
        return <VisualPatternTask action={context.visualPatternTaskHandler} />;
    } else if (screen === constant.VISUAL_PATTERN_DEMO_SCREEN) {
        return <VisualPatternDemoTask action={context.visualPatternDemoTaskHandler} />;
    } else if (screen === constant.PSFORM_SCREEN) {
        return <PSForm action={context.psFormHandler} data={inputPSForm} />;
    } else if (screen === constant.BARGAIN_DEMO_SCREEN) {
        return <BargainDemoTask action={context.bargainTaskDemoTaskHandler} typeTask={typeTask} />;
    } else if (screen === constant.BARGAIN_SCREEN) {
        return <BargainTask action={context.bargainTaskHandler} data={inputStores} typeTask={typeTask} />;
    } else if (screen === constant.MULTRIATTRIBUTE_DEMO_SCREEN) {
        return <MultiAttributeDemo action={context.multiAttributeHandler} />;
    } else if (screen === constant.MULTRIATTRIBUTE_SCREEN) {
        return <MultiAttribute action={context.multiAttributeHandler} />;
    }
}

export default Index;