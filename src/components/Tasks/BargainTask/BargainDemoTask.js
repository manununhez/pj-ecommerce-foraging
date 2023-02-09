import React, { useState, useEffect } from 'react';
import Tour from "reactour";
import { Button } from "reactstrap";

import StickmanLoading from './StickmanLoading';
import ProductsMenu from './ProductsMenu';

import {
    TOUR_BARGAIN,
    TOUR_BARGAIN_CRITERIA,
    TOUR_BARGAIN_SELECTION,
    TOUR_NOT_BARGAIN,
    TOUR_PRODUCT_BELT,
    accentColor
} from '../../../helpers/constants';

import "../style.css";

const DEBUG = (process.env.REACT_APP_DEBUG_LOG === "true") ? true : false;

export default function BargainDemoTask(props) {

    useEffect(() => {
        //initially, the go to store btn is disabled.
        document.getElementById('reactour__button').disabled = true
        //initially, the go to moreProductsbtn is disabled.
        document.getElementsByClassName('scroll-menu-arrow')[0].style.pointerEvents = "none"
    }, []);

    const currentStoreIndex = 0

    const storeLists = [{
        storeNumber: 1, bargainsNumber: 4, delay: 10, showFeedback: false, products: [
            { productNumber: 1, isBargain: false, oldPrice: 227, newPrice: 140.74, discount: 0.38, numOfStars: 5, img: "https://api.swps-pjatk-experiment.co/v3/img/12picture.jpg" },
            { productNumber: 2, isBargain: true, oldPrice: 113, newPrice: 36.16, discount: 0.68, numOfStars: 5, img: "https://api.swps-pjatk-experiment.co/v3/img/71jewelry_picture.jpg" },
            { productNumber: 3, isBargain: false, oldPrice: 125, newPrice: 63.75, discount: 0.49, numOfStars: 5, img: "https://api.swps-pjatk-experiment.co/v3/img/31jewelry_picture.jpg" },
            { productNumber: 4, isBargain: false, oldPrice: 113, newPrice: 82.49, discount: 0.27, numOfStars: 5, img: "https://api.swps-pjatk-experiment.co/v3/img/39jewelry_picture.jpg" },
            { productNumber: 5, isBargain: false, oldPrice: 257, newPrice: 131.07, discount: 0.49, numOfStars: 3, img: "https://api.swps-pjatk-experiment.co/v3/img/3electron_picture.jpg" },
            { productNumber: 6, isBargain: false, oldPrice: 142, newPrice: 21.3, discount: 0.85, numOfStars: 1, img: "https://api.swps-pjatk-experiment.co/v3/img/57jewelry_picture.jpg" },
            { productNumber: 7, isBargain: false, oldPrice: 266, newPrice: 135.66, discount: 0.49, numOfStars: 2, img: "https://api.swps-pjatk-experiment.co/v3/img/28jewelry_picture.jpg" },
            { productNumber: 8, isBargain: false, oldPrice: 188, newPrice: 142.88, discount: 0.24, numOfStars: 3, img: "https://api.swps-pjatk-experiment.co/v3/img/46jewelry_picture.jpg" },
            { productNumber: 9, isBargain: false, oldPrice: 275, newPrice: 206.25, discount: 0.25, numOfStars: 6, img: "https://api.swps-pjatk-experiment.co/v3/img/20electron_picture.jpg" },
            { productNumber: 10, isBargain: false, oldPrice: 275, newPrice: 176, discount: 0.36, numOfStars: 2, img: "https://api.swps-pjatk-experiment.co/v3/img/6picture.jpg" }
        ]
    }];

    const [isTourOpen, setIsTourOpen] = useState(true)
    const [selectedProducts, setSelectedProducts] = useState([])
    const [showProducts, setShowProducts] = useState(true)
    const [storesVisitedCounter, setStoresVisitedCounter] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)

    const onFirstItemVisible = () => {
        if (DEBUG) console.log("first item is visible");
    };

    const onLastItemVisible = () => {
        if (DEBUG) console.log("last item is visible");
    };

    const onShowNextProducts = ({ translate }) => {
        if (DEBUG) console.log(`onShowNextProducts`);
        setCurrentStep(currentStep + 1)
    };

    const onProductSelected = key => {
        if (DEBUG) console.log(`onProductSelected: ${key}`);
        const keySelected = parseInt(key)

        if (keySelected !== 1 || currentStep !== 3) return; //we enabled clicking only one bargain product in the training state

        setCurrentStep(currentStep + 1) //go to next step

        if (!selectedProducts.includes(keySelected)) {
            let selected = [...selectedProducts]

            selected.push(keySelected)

            setSelectedProducts(selected)
        }
    };

    const onShowNextStore = () => {
        if (DEBUG) console.log("onGoStoreBtnClick")

        const newStoresVisitedCounter = storesVisitedCounter + 1

        setCurrentStep(currentStep + 1)
        setIsTourOpen(false)
        setShowProducts(false)
        setStoresVisitedCounter(newStoresVisitedCounter)
    }

    const onLoadingFinished = () => {
        setSelectedProducts([])

        props.action({ isTaskCompleted: true, results: [] })
    }

    const gotToNextStep = () => {
        if (DEBUG) console.log("currentStep:")
        if (DEBUG) console.log(currentStep)

        if (currentStep === 1) {
            //border color to bargain product
            document.getElementById('reactour__product_1').style.border = "2px solid rgb(0 0 0)"
        } else if (currentStep === 4) {
            //enable click
            document.getElementsByClassName('scroll-menu-arrow')[0].style.pointerEvents = "auto"

            //border color to bargain product
            document.getElementsByClassName('scroll-menu-arrow')[0].style.border = "2px solid rgb(0 0 0)"

            //disable previous highlight
            document.getElementById('reactour__product_1').style.border = "2px solid rgb(255 255 255)"
        } else if (currentStep === 5) {
            //disable moreProductsBtn click
            document.getElementsByClassName('scroll-menu-arrow')[0].style.pointerEvents = "none"

            //border color to not bargain product
            document.getElementById('reactour__product_5').style.border = "2px solid rgb(0 0 0)"

            //disable previous highlight
            document.getElementsByClassName('scroll-menu-arrow')[0].style.border = "2px solid rgb(255 255 255)"
        } else if (currentStep === 7) {
            //when the footer overlap the body, whe make a scroll top to see the hidden "Go to store" button
            //Scroll the content section defined in Index.js
            document.getElementById('content').scrollTop = 400

            //In this step, Re-enabled go to store button
            document.getElementById('reactour__button').disabled = false
            //highlitght with border color
            document.getElementById('reactour__button').style.border = "2px solid rgb(0 0 0)"
            //disable previous highlight
            document.getElementById('reactour__product_5').style.border = "2px solid rgb(255 255 255)"
        }

        return currentStep
    }
    const tourConfig = [
        {
            selector: `[data-tut="reactour__product_belt"]`,
            content: () => {
                return (<div>
                    <h6> {"(" + (currentStep + 1) + "/" + 8 + ")"}</h6>
                    <h5>{TOUR_PRODUCT_BELT}</h5>
                    <br /><br />
                    <div style={{ textAlign: "end" }}>
                        <Button onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>
                    </div>
                </div>)
            },
            position: 'center',
            stepInteraction: false,
        },
        {
            selector: `[data-tut="reactour__product_1"]`,
            content: () => {
                return (<div>
                    <h6> {"(" + (currentStep + 1) + "/" + 8 + ")"}</h6>
                    <h5> {TOUR_BARGAIN}</h5>
                    <br /><br />
                    <div style={{ textAlign: "end" }}>
                        <Button onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>
                    </div>
                </div>)
            },
            position: 'right',
            stepInteraction: false
        },
        {
            selector: `[data-tut="reactour__product_1"]`,
            content: () => {
                return (<div>
                    <h6> {"(" + (currentStep + 1) + "/" + 8 + ")"}</h6>
                    <h5>{TOUR_BARGAIN_CRITERIA}</h5>
                    <br /><br />
                    <div style={{ textAlign: "end" }}>
                        <Button onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>
                    </div>
                </div>)
            },
            position: 'right',
            stepInteraction: false,
        },
        {
            selector: `[data-tut="reactour__product_1"]`,
            content: () => {
                return (<div>
                    <h6> {"(" + (currentStep + 1) + "/" + 8 + ")"}</h6>
                    <h5>{TOUR_BARGAIN_SELECTION}</h5>
                    <br /><br />
                </div>)
            },
            position: 'right',
            stepInteraction: false
        },
        {
            selector: '[data-tut="reactour__more_products"]',
            content: () => {
                return (<div>
                    <h6> {"(" + (currentStep + 1) + "/" + 8 + ")"}</h6>
                    <h5>When there are no more bargains, you can move the belt.</h5>
                    <br /><br />
                    Press the arrow on the right.
                </div>)
            },
            position: 'left'
        },
        {
            selector: `[data-tut="reactour__product_0"]`,
            content: () => {
                return (<div>
                    <h6> {"(" + (currentStep + 1) + "/" + 8 + ")"}</h6>
                    <h5>{TOUR_NOT_BARGAIN}</h5>
                    <br /><br />
                    <div style={{ textAlign: "end" }}>
                        <Button onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>
                    </div>
                </div>)
            },
            stepInteraction: false,
            position: 'right'
        },
        {
            selector: `[data-tut="reactour__product_5"]`,
            content: () => {
                return (<div>
                    <h6> {"(" + (currentStep + 1) + "/" + 8 + ")"}</h6>
                    <h5>{TOUR_BARGAIN_CRITERIA}</h5>
                    <br /><br />
                    <div style={{ textAlign: "end" }}>
                        <Button onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>
                    </div>
                </div>)
            },
            stepInteraction: false,
            position: 'right'
        },
        {
            selector: '[data-tut="reactour__button"]',
            content: () => {
                return (<div>
                    <h6> {"(" + (currentStep + 1) + "/" + 8 + ")"}</h6>
                    <h5>If you feel that there are no more bargains in this store, you can change the store.</h5>
                    <br />
                    <h5>Press this button.</h5>
                </div>)
            },
            position: 'right'
        }]

    const maskClassName = () => {
        if (DEBUG) console.log(props.typeTask)
        // if (props.typeTask === EXPERIMENT_TYPE_SHORT_NT)
        //     return "mask-hidden"
        // else return "mask"

        return "mask-hidden"
    }

    return (<>
        {DEBUG ? `Store#:${storeLists[currentStoreIndex].storeNumber}` : ""}

        {showProducts ?
            <div /*className="top-quarter"*/>
                <ProductsMenu
                    products={storeLists[currentStoreIndex].products}
                    selected={selectedProducts}
                    onFirstItemVisible={onFirstItemVisible}
                    onLastItemVisible={onLastItemVisible}
                    onSelect={onProductSelected}
                    onUpdate={onShowNextProducts}
                    onGoStoreBtnClick={onShowNextStore}
                    bargainsTaken={0}
                /></div> :
            <div className="centered">
                <StickmanLoading
                    currentStore={storeLists[currentStoreIndex]}
                    onLoadingFinished={onLoadingFinished} /></div>

        }
        <Tour
            steps={tourConfig}
            isOpen={isTourOpen}
            maskClassName={maskClassName()}
            className="helper"
            rounded={5}
            disableKeyboardNavigation={true}
            accentColor={accentColor}
            closeWithMask={false}
            showCloseButton={false}
            showNumber={false}
            showNavigation={false}
            prevButton={<></>}
            showButtons={false}
            goToStep={gotToNextStep()}
            onRequestClose={() => setIsTourOpen(false)}
        />
    </>);
}