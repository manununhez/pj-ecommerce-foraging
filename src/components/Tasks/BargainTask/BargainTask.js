import React, { useState, useEffect } from 'react';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import {
    BARGAIN_ERROR_SELECTED_ALERT_MESSAGE,
    BARGAIN_MISSED_SELECTED_ALERT_MESSAGE,
    STORES_NOT_AVAILABLE,
    MIDDLE_EXPERIMENT_ALERT,
    ONE_SECOND_MS,
    EXPERIMENT_TYPE_LONG,
    EXPERIMENT_TYPE_SHORT,
    EXPERIMENT_TYPE_LONG_NT,
    EXPERIMENT_TYPE_SHORT_NT,
    ENTER_KEY_CODE,
    EVENT_KEY_DOWN,
    TEXT_FOOTER_ENTER,
    MODAL_TITLE,
    MODAL_TYPE_STORE
} from '../../../helpers/constants';
import { randomNumber } from '../../../helpers/utils';
import StickmanLoading from './StickmanLoading';
import ProductsMenu from './ProductsMenu';
import Footer from "../../Footers/Footer";
import "../style.css";

const DEBUG = (process.env.REACT_APP_DEBUG_LOG === "true") ? true : false;

export default function BargainTask(props) {
    const [typeTask, setTypeTask] = useState({ name: props.typeTask })
    const DEBUG_TEST = typeTask.name.includes("TEST")
    const PRODUCTS_PER_ROW = 5
    const DURATION_IN_MINS = (DEBUG_TEST) ? 2 : 30
    const EXPERIMENT_DURATION_SECS = DURATION_IN_MINS * 60

    const testList = [{
        storeNumber: 1, bargainsNumber: 2, delay: 15, showFeedback: true, products: [
            { productNumber: 1, isBargain: false, oldPrice: 258, newPrice: 167.7, discount: 0.35, numOfStars: 5, img: "https://api.swps-pjatk-experiment.pl/v3/img/2picture.jpg" },
            { productNumber: 2, isBargain: true, oldPrice: 282, newPrice: 126.9, discount: 0.55, numOfStars: 3, img: "https://api.swps-pjatk-experiment.pl/v3/img/17picture.jpg" },
            { productNumber: 3, isBargain: false, oldPrice: 165, newPrice: 84.15, discount: 0.49, numOfStars: 1, img: "https://api.swps-pjatk-experiment.pl/v3/img/11picture.jpg" },
            { productNumber: 4, isBargain: false, oldPrice: 131, newPrice: 73.36, discount: 0.44, numOfStars: 2, img: "https://api.swps-pjatk-experiment.pl/v3/img/27picture.jpg" },
            { productNumber: 5, isBargain: false, oldPrice: 226, newPrice: 167.24, discount: 0.26, numOfStars: 4, img: "https://api.swps-pjatk-experiment.pl/v3/img/20picture.jpg" },
            { productNumber: 6, isBargain: true, oldPrice: 123, newPrice: 83.64, discount: 0.32, numOfStars: 5, img: "https://api.swps-pjatk-experiment.pl/v3/img/7picture.jpg" },
            { productNumber: 7, isBargain: false, oldPrice: 220, newPrice: 169.4, discount: 0.23, numOfStars: 3, img: "https://api.swps-pjatk-experiment.pl/v3/img/14picture.jpg" },
            { productNumber: 8, isBargain: false, oldPrice: 273, newPrice: 171.99, discount: 0.37, numOfStars: 4, img: "https://api.swps-pjatk-experiment.pl/v3/img/46jewelry_picture.jpg" },
            { productNumber: 9, isBargain: false, oldPrice: 209, newPrice: 137.94, discount: 0.34, numOfStars: 1, img: "https://api.swps-pjatk-experiment.pl/v3/img/16electron_picture.jpg" },
            { productNumber: 10, isBargain: false, oldPrice: 206, newPrice: 131.84, discount: 0.36, numOfStars: 1, img: "https://api.swps-pjatk-experiment.pl/v3/img/23electron_picture.jpg" }
        ]
    }, {
        storeNumber: 2, bargainsNumber: 4, delay: 15, showFeedback: false, products: [
            { productNumber: 1, isBargain: false, oldPrice: 269, newPrice: 201.75, discount: 0.25, numOfStars: 5, img: "https://api.swps-pjatk-experiment.pl/v3/img/62jewelry_picture.jpg" },
            { productNumber: 2, isBargain: false, oldPrice: 109, newPrice: 85.02, discount: 0.22, numOfStars: 4, img: "https://api.swps-pjatk-experiment.pl/v3/img/68jewelry_picture.jpg" },
            { productNumber: 3, isBargain: false, oldPrice: 127, newPrice: 85.09, discount: 0.33, numOfStars: 4, img: "https://api.swps-pjatk-experiment.pl/v3/img/8picture.jpg" },
            { productNumber: 4, isBargain: true, oldPrice: 282, newPrice: 126.9, discount: 0.55, numOfStars: 6, img: "https://api.swps-pjatk-experiment.pl/v3/img/40jewelry_picture.jpg" },
            { productNumber: 5, isBargain: false, oldPrice: 134, newPrice: 101.84, discount: 0.24, numOfStars: 6, img: "https://api.swps-pjatk-experiment.pl/v3/img/62jewelry_picture.jpg" },
            { productNumber: 6, isBargain: true, oldPrice: 176, newPrice: 126.72, discount: 0.60, numOfStars: 5, img: "https://api.swps-pjatk-experiment.pl/v3/img/21electron_picture.jpg" },
            { productNumber: 7, isBargain: true, oldPrice: 166, newPrice: 59.76, discount: 0.64, numOfStars: 6, img: "https://api.swps-pjatk-experiment.pl/v3/img/17electron_picture.jpg" },
            { productNumber: 8, isBargain: false, oldPrice: 169, newPrice: 87.88, discount: 0.48, numOfStars: 3, img: "https://api.swps-pjatk-experiment.pl/v3/img/39jewelry_picture.jpg" },
            { productNumber: 9, isBargain: false, oldPrice: 127, newPrice: 71.12, discount: 0.44, numOfStars: 4, img: "https://api.swps-pjatk-experiment.pl/v3/img/67jewelry_picture.jpg" },
            { productNumber: 10, isBargain: true, oldPrice: 226, newPrice: 122.04, discount: 0.70, numOfStars: 5, img: "https://api.swps-pjatk-experiment.pl/v3/img/70jewelry_picture.jpg" }
        ]
    }]

    const setConditionalList = () => {
        if (DEBUG) {
            return props.data.storesLong
        } else if (typeTask.name === EXPERIMENT_TYPE_LONG || typeTask.name === EXPERIMENT_TYPE_LONG_NT) {
            return props.data.storesLong
        } else if (typeTask.name === EXPERIMENT_TYPE_SHORT || typeTask.name === EXPERIMENT_TYPE_SHORT_NT) {
            return props.data.storesShort
        }
    }

    const initializeProducts = (store) => {
        return store.products.slice(0, PRODUCTS_PER_ROW * 2)
    }

    const initNewStoreResult = (_store, _typeTask, _round) => {
        const from = 0
        const to = from + PRODUCTS_PER_ROW
        const productListInThisIteration = _store.products.slice(from, to)
        const bargainNumberInThisIteration = productListInThisIteration.filter(product => product.isBargain === true).length
        const lastProductNumber = _store.products[PRODUCTS_PER_ROW - 1].productNumber
        const initializedResultValue = {
            typeTask: _typeTask,
            storeNumber: _store.storeNumber,
            enterStoreTimestamp: Date.now(),
            leaveStoreTimestamp: Date.now(),
            productsSeen: PRODUCTS_PER_ROW,
            lastProductDisplayed: lastProductNumber,
            bargainTakenNumber: 0,
            bargainWronglyTakenNumber: 0,
            bargainShownNumber: bargainNumberInThisIteration,
            round: _round
        }

        return initializedResultValue
    }

    const setInitialDelayDuringTestingOnly = () => {
        if (typeTask.name.includes("-NT")) {
            return null;
        } else {
            return ONE_SECOND_MS;
        }
    }

    const [storeLists, setStoreLists] = useState(setConditionalList())
    const [round, setRound] = useState(1)
    const [currentBeltIteration, setCurrentBeltIteration] = useState(1) //Initially, the user already see 5 products = currentBeltIteration * 5 = 1 * 5 = 5 
    const [currentStoreIndex, setCurrentStoreIndex] = useState(0)
    const [currentProducts, setCurrentProducts] = useState(initializeProducts(storeLists[currentStoreIndex]))
    const [currentProductListWithoutBargains, setCurrentProductListWithoutBargains] = useState([])
    const [delay, setDelay] = useState(setInitialDelayDuringTestingOnly())
    const [modalAlertConfig, setModalAlertConfig] = useState({ isVisible: false, text: "", type: "", title: "" })
    const [results, setResults] = useState([initNewStoreResult(storeLists[currentStoreIndex], typeTask.name, round)])
    const [showFeedback, setShowFeedback] = useState(storeLists[currentStoreIndex].showFeedback)
    const [bargainsTotalNumber, setBargainsTotalNumber] = useState(storeLists[currentStoreIndex].bargainsNumber)
    const [showInstruction, setShowInstruction] = useState(false)
    const [showProducts, setShowProducts] = useState(true)
    const [selectedProducts, setSelectedProducts] = useState([])
    const [timer, setTimer] = useState({ counter: EXPERIMENT_DURATION_SECS })
    // USAMOS PRODUCTS_PER_ROW * 2 o simplement PRODUCTS_PER_ROW ??? Verificar donde USAMOS
    // En generateRandomProductList() generamos ahora PRODUCTS_PER_ROW.Deberia ser PRODUCTS_PER_ROW * 2?
    // VERIFICAR


    /**
     * MENU ITEM CALLBACKS
     */
    const onFirstItemVisible = () => {
        // if (DEBUG) console.log("first item is visible")
    }

    const onLastItemVisible = () => {
        if (DEBUG) console.log("last item is visible")
        generateNewProductListToDisplay()
    }

    const onUpdate = () => showNextBeltIterationProducts()

    const onSelect = key => {
        if (DEBUG) console.log(`onProductSelected: ${key}`)
        productSelected(key)
    }


    /**
     * Helper Functions
     */
    const onShowNextStore = () => {
        if (DEBUG) console.log("onGoStoreBtnClick")
        if (showFeedback) {
            let missedBargains = countMissedBargains()
            if (missedBargains > 0) {
                modalAlert(MODAL_TITLE, BARGAIN_MISSED_SELECTED_ALERT_MESSAGE(missedBargains), MODAL_TYPE_STORE)
                return //we return without calling showNextStoreActions() here. This function is later called in the modale onClosed
            }
        }

        showNextStoreActions()
    }

    const showNextStoreActions = () => {
        saveResultsBeforeLeavingStore()
        showLoadingAnimation()
    }

    const productSelected = key => {
        const productIndex = parseInt(key)

        if (!selectedProducts.includes(productIndex)) {
            const productSelected = storeLists[currentStoreIndex].products[productIndex]
            let selected = [...selectedProducts]

            selected.push(productIndex)

            setSelectedProducts(selected)

            //Check BARGAIN selection
            if (productSelected.isBargain) {
                const newBargainCounter = results[results.length - 1].bargainTakenNumber + 1

                saveResultsNewBargainTaken(newBargainCounter)
            } else {
                const wrongBargainCounter = results[results.length - 1].bargainWronglyTakenNumber + 1

                saveResultsWronglyBargainTaken(wrongBargainCounter)

                if (showFeedback) {
                    modalAlert(MODAL_TITLE, BARGAIN_ERROR_SELECTED_ALERT_MESSAGE)
                }
            }
        }
    }

    /**
     * 
     * @returns 
     */
    const displayNewStore = () => {
        //check is there are stores available
        if (results.length >= storeLists.length) {
            modalAlert(MODAL_TITLE, STORES_NOT_AVAILABLE)
            return
        }

        const newCurrentStoreIndex = currentStoreIndex + 1
        const newStore = storeLists[newCurrentStoreIndex]

        //update results
        results.push(initNewStoreResult(newStore, typeTask.name, round))

        setCurrentBeltIteration(1)
        setCurrentProducts(initializeProducts(newStore))
        setShowFeedback(newStore.showFeedback)
        setBargainsTotalNumber(newStore.bargainsNumber)
        setCurrentStoreIndex(newCurrentStoreIndex)
        setSelectedProducts([])
        setCurrentProductListWithoutBargains([])
    }

    /**
     * 
     */
    const showLoadingAnimation = () => {
        setShowProducts(false)
        setShowInstruction(false)
    }


    /**
     * 
     */
    const showProductsPage = () => {
        setShowProducts(true)
        setShowInstruction(false)
    }

    /**
     * 
     */
    const showMiddleInstructionPage = () => {
        setShowProducts(false)
        setShowInstruction(true)
    }

    /**
     * 
     */
    const showNextBeltIterationProducts = () => {
        if (showFeedback) {
            let missedBargains = countMissedBargains()
            if (missedBargains > 0) {
                modalAlert(MODAL_TITLE, BARGAIN_MISSED_SELECTED_ALERT_MESSAGE(missedBargains), "")
            }
        }
        //we called saveResultsBeforeChangingBelt() even if we have shown the alert (it does not affect the animation of the belt transitioning)
        saveResultsBeforeChangingBelt()
    }

    /**
     * 
     */
    const generateNewProductListToDisplay = () => {
        const from = currentBeltIteration * PRODUCTS_PER_ROW
        const to = from + (PRODUCTS_PER_ROW * 2)
        const isNeededGenerateNewProducts = currentProducts.length === storeLists[currentStoreIndex].products.length

        let tmp = []

        if (!isNeededGenerateNewProducts) {
            tmp = storeLists[currentStoreIndex].products.slice(from, to)
        } else {
            // Update menu belt products with new random generated products when we reached the end of the product list
            let filteredNotBargainList = currentProductListWithoutBargains

            if (currentProductListWithoutBargains.length === 0) {
                filteredNotBargainList = storeLists[currentStoreIndex].products.filter(item => item.isBargain === false)

                setCurrentProductListWithoutBargains(filteredNotBargainList)
            }

            tmp = generateRandomProductList(filteredNotBargainList)

            //we update the original list with the new generated products
            storeLists[currentStoreIndex].products = currentProducts.concat(tmp)
            setStoreLists(storeLists)
        }

        //update current product list
        setCurrentProducts(currentProducts.concat(tmp))
    }

    const generateRandomProductList = (filteredNotBargainList) => {
        let count = 0
        let newList = []
        let randomNumbersList = []

        //TODO what happened in case of an infinite loop here => there are not enough not bargain product lists
        while (count < PRODUCTS_PER_ROW) {
            const randomProduct = filteredNotBargainList[randomNumber(0, filteredNotBargainList.length - 1)]
            const randomProductNumber = randomProduct.productNumber

            if (!randomNumbersList.includes(randomProductNumber)) {
                randomNumbersList.push(randomProductNumber)
                newList.push(randomProduct)
                count += 1
            }
        }

        return newList
    }

    const countMissedBargains = () => {
        const from = (currentBeltIteration - 1) * PRODUCTS_PER_ROW
        const to = from + PRODUCTS_PER_ROW
        const productListInThisIteration = storeLists[currentStoreIndex].products.slice(from, to)
        const bargainNumberInThisIteration = productListInThisIteration.filter(product => product.isBargain === true).length

        let selectedBargainsCounter = 0

        for (let i = from; i <= to; i++) {
            if (selectedProducts.includes(i)) {
                const product = storeLists[currentStoreIndex].products[i]

                if (product.isBargain) {
                    selectedBargainsCounter += 1
                }
            }
        }

        let missedBargains = bargainNumberInThisIteration - selectedBargainsCounter
        return missedBargains
    }

    const onLoadingFinished = () => {
        showProductsPage()
        displayNewStore()
    }

    const onMiddleExperimentResume = () => {
        setDelay(ONE_SECOND_MS)
        showProductsPage()
        setNewExperimentType()//change store list (short - long)
    }

    const onMiddleExperimentPause = () => {
        setDelay(null)
        showMiddleInstructionPage()
    }

    const saveResultsBeforeLeavingStore = () => {
        if (DEBUG) console.log("saveResultsBeforeLeavingStore")
        results[results.length - 1] = {
            ...results[results.length - 1],
            leaveStoreTimestamp: Date.now()
        }

        if (DEBUG) console.log(results)
    }

    const saveResultsBeforeChangingBelt = () => {
        const store = storeLists[currentStoreIndex]
        const from = (currentBeltIteration - 1) * PRODUCTS_PER_ROW
        const to = from + PRODUCTS_PER_ROW
        const productListInThisIteration = store.products.slice(0, to) //every iteration, we took al the products from start to the current iteration. IMPROVE THIS!
        const totalShownBargainsSoFar = productListInThisIteration.filter(product => product.isBargain === true).length //we count the bargains numbers
        const lastProductNumberDisplayed = store.products[to - 1].productNumber

        if (DEBUG) console.log("From: " + from + " to: " + to)
        if (DEBUG) console.log(productListInThisIteration)
        if (DEBUG) console.log("totalShownBargainsSoFar: " + totalShownBargainsSoFar)
        if (DEBUG) console.log("lastProductDisplayed: " + lastProductNumberDisplayed)

        results[results.length - 1] = {
            ...results[results.length - 1],
            productsSeen: to,
            lastProductDisplayed: lastProductNumberDisplayed,
            bargainShownNumber: totalShownBargainsSoFar
        }

        setCurrentBeltIteration(currentBeltIteration => currentBeltIteration + 1)

        if (DEBUG) console.log(results)
    }

    const saveResultsNewBargainTaken = (newBargainCounter) => {
        if (DEBUG) console.log("saveResultsNewBargainTaken===")

        results[results.length - 1] = {
            ...results[results.length - 1],
            bargainTakenNumber: newBargainCounter
        }

        if (DEBUG) console.log(results)
    }

    const saveResultsWronglyBargainTaken = (wrongBargainCounter) => {
        if (DEBUG) console.log("saveResultsWronglyBargainTaken===")

        results[results.length - 1] = {
            ...results[results.length - 1],
            bargainWronglyTakenNumber: wrongBargainCounter
        }

        if (DEBUG) console.log(results)
    }

    const setNewExperimentType = () => {
        if (DEBUG) console.log("setNewExperimentType")
        const newTypeTask = (typeTask.name === EXPERIMENT_TYPE_LONG || typeTask.name === EXPERIMENT_TYPE_LONG_NT || DEBUG_TEST) ? EXPERIMENT_TYPE_SHORT : EXPERIMENT_TYPE_LONG
        const newListToDisplay = newTypeTask === EXPERIMENT_TYPE_LONG ? props.data.storesLong : props.data.storesShort
        const newStoresVisited = newListToDisplay[0]
        const newRound = round + 1

        results.push(initNewStoreResult(newStoresVisited, newTypeTask, newRound))
        typeTask.name = newTypeTask
        if (DEBUG) console.log(results)
        if (DEBUG) console.log(typeTask.name)

        setRound(newRound)
        setCurrentStoreIndex(0)
        setSelectedProducts([])
        setCurrentProductListWithoutBargains([])
        setCurrentBeltIteration(1)
        setStoreLists(newListToDisplay)//we change the stores lists by Conditions (Long/short)
        setCurrentProducts(initializeProducts(newStoresVisited))
        setShowFeedback(newStoresVisited.showFeedback)
        setBargainsTotalNumber(newStoresVisited.bargainsNumber)
    }

    const updateTime = () => {
        timer.counter -= 1
        if (DEBUG) console.log(timer.counter)
    }

    const syncResults = (_isTaskCompleted) => {
        saveResultsBeforeLeavingStore()

        props.action({
            isTaskCompleted: _isTaskCompleted,
            results: (results.filter((item) => item.typeTask === typeTask.name))
        })
    }

    useEffect(() => {//component didmount
        let id = null
        function tick() {

            updateTime()

            if (timer.counter === 0) {//When timer 0, the experiment finishes
                clearInterval(id)

                syncResults(true)

            } else if (timer.counter === (EXPERIMENT_DURATION_SECS / 2)) {
                if (DEBUG) console.log("Middle of the experiments")

                syncResults(false)

                onMiddleExperimentPause()
            }
        }

        if (delay !== null) {
            id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])

    useEffect(() => {
        const handleKeyDownEvent = event => {
            const { key, keyCode } = event
            if (keyCode === ENTER_KEY_CODE && delay === null) { //If we are on pause in the middle of the experiment, we press enter to go to next part
                onMiddleExperimentResume()
            }
        }

        document.addEventListener(EVENT_KEY_DOWN, handleKeyDownEvent);
        return () => {
            document.removeEventListener(EVENT_KEY_DOWN, handleKeyDownEvent);
        };
    });

    const displayBodyConfig = (showProducts, showInstruction) => {
        if (showProducts) {
            return (<div><ProductsMenu
                store={currentStoreIndex}
                products={currentProducts}
                selected={selectedProducts}
                onFirstItemVisible={onFirstItemVisible}
                onLastItemVisible={onLastItemVisible}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onGoStoreBtnClick={onShowNextStore}
                bargainsTaken={results[results.length - 1].bargainTakenNumber}
                bargainsTotal={bargainsTotalNumber}
                debug={DEBUG_TEST} /></div>)
        } else if (showInstruction) {
            return (<div className="centered" style={{ textAlign: "center" }}>
                <h3>{MIDDLE_EXPERIMENT_ALERT}</h3>
                <br />
                <br />
                <Footer text={TEXT_FOOTER_ENTER} /></div>)
        } else {
            return (<div className="centered">
                <StickmanLoading
                    currentStore={storeLists[currentStoreIndex]}
                    onLoadingFinished={onLoadingFinished} /></div>)
        }
    }

    const showModal = () => {
        if (modalAlertConfig.isVisible) {
            if (modalAlertConfig.type === MODAL_TYPE_STORE) {
                return <ModalAlert
                    title={modalAlertConfig.title}
                    text={modalAlertConfig.text}
                    onOpened={() => { if (DEBUG) console.log("With STORE callback") }}
                    onClosed={onModalStoreClosed} />
            } else {
                return <ModalAlert
                    title={modalAlertConfig.title}
                    text={modalAlertConfig.text}
                    onOpened={() => { if (DEBUG) console.log("Without callback") }}
                    onClosed={() => { closeModal() }} />
            }
        } else return <></>
    }

    const modalAlert = (title, text, type = "", isVisible = true) => setModalAlertConfig({ isVisible: isVisible, text: text, type: type, title: title })


    const onModalStoreClosed = () => {
        if (DEBUG) console.log("onModalStoreClosed")
        closeModal()

        showNextStoreActions()
    }

    const closeModal = () => modalAlert("", "", "", false)


    return (<>
        {DEBUG_TEST ? `Store#:${storeLists[currentStoreIndex].storeNumber} CurrentBelt:${currentBeltIteration}` : ""}

        {showModal()}

        {displayBodyConfig(showProducts, showInstruction)}
    </>)
}

function ModalAlert(props) {
    const { text, title } = props
    const [modal, setModal] = useState(true)

    const toggle = () => setModal(modal => !modal)

    return (
        <div>
            <Modal
                isOpen={modal}
                className="modal-alert"
                toggle={toggle}
                size='sm'
                keyboard={false}
                onOpened={props.onOpened}
                onClosed={props.onClosed}>
                <ModalHeader>{title}</ModalHeader>
                <ModalBody>{text}</ModalBody>
            </Modal>
        </div>
    )
}