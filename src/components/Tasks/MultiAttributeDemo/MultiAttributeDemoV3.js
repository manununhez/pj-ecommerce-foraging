import React from 'react';

// reactstrap components
import { Card, Container, Row, Table, Modal, ModalHeader } from "reactstrap";

import ReactStars from "react-rating-stars-component";

// get our fontawesome imports
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faSmile, faFrown } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ImageMapperRating } from './verticalRateImage';
import { Box } from "./BoxV2";
import DemoContainer from './DemoContainerV2'
import "../style.css"

import {
    FIRST_TASK_PROPERTIES_TOTAL, FIRST_RADIO_VALUE, SECOND_RADIO_VALUE, WHITE, BLACK,
    THIRD_RADIO_VALUE, TEXT_FOOTER, SHOW_FEEDBACK_TRUE, SPACE_KEY_CODE, EVENT_KEY_DOWN,
    GREEN, modaltStyle, ItemTypes, attributeListsForDemo, ItemTypesID, INDEX_HEADER_TOP, INDEX_HEADER
} from '../../../helpers/constants';
import RateImage from './RateImage';


class MultiAttributeDemoV3 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOption: [],
            counter: 0,
            showMissingResultsIndicator: false,
            modalOpen: false,
            visibility: 0,
            coordinatesImage: { leftX: 0, leftY: 0, y: 0 },
            imageRating: 0,
            multiAttributeResults: { p1: [INDEX_HEADER_TOP], p2: [INDEX_HEADER_TOP], p3: [INDEX_HEADER_TOP] },
            multiAttributeResultsTmp: { p1: [INDEX_HEADER_TOP], p2: [INDEX_HEADER_TOP], p3: [INDEX_HEADER_TOP] }
        }
    }

    componentDidMount() {
        //for keyboard detection
        document.addEventListener(EVENT_KEY_DOWN, this.handleKeyDownEvent, false);

        // HTML prevent space bar from scrolling page
        window.addEventListener(EVENT_KEY_DOWN, function (e) {
            if (e.keyCode === SPACE_KEY_CODE && e.target === document.body) {
                e.preventDefault();
            }
        });
    }

    componentWillUnmount() {
        document.removeEventListener(EVENT_KEY_DOWN, this.handleKeyDownEvent, false);
    }

    handleKeyDownEvent = (event) => {
        if (event.keyCode === SPACE_KEY_CODE) {
            const { selectedOption, counter } = this.state
            const isOptionWasSelectedInThisRound = selectedOption.length === (counter + 1)
            const completedTask = this.controlIfAllOptionsAreSelected()

            if (isOptionWasSelectedInThisRound) {
                if (completedTask) {
                    if (attributeListsForDemo.length === selectedOption.length) {
                        this.props.action(selectedOption);
                    } else {
                        this.setState({
                            counter: (counter + 1),
                            showMissingResultsIndicator: false,
                            modalOpen: false,
                            visibility: 0,
                            coordinatesImage: { leftX: 0, leftY: 0, y: 0 },
                            imageRating: 0,
                            multiAttributeResults: { p1: [INDEX_HEADER_TOP], p2: [INDEX_HEADER_TOP], p3: [INDEX_HEADER_TOP] }
                        }, () => {
                            console.log("NEXT ROUND")
                        })
                    }
                }
            }
        }
    }

    controlIfAllOptionsAreSelected() {
        const { multiAttributeResults, counter } = this.state
        const data = attributeListsForDemo[counter]

        if (multiAttributeResults.length === 0) return false

        let rating = 0
        for (let i = 0; i < FIRST_TASK_PROPERTIES_TOTAL; i++) {
            rating = 6 - i
            let isAttributeP1Bold = data.attributes[i].p1 === 1
            let isAttributeP2Bold = data.attributes[i].p2 === 1
            let isAttributeP3Bold = data.attributes[i].p3 === 1

            let isCurrentValueP1NotDroppedYet = !multiAttributeResults.p1.includes(rating)
            let isCurrentValueP2NotDroppedYet = !multiAttributeResults.p2.includes(rating)
            let isCurrentValueP3NotDroppedYet = !multiAttributeResults.p3.includes(rating)

            if ((isAttributeP1Bold && isCurrentValueP1NotDroppedYet) || (isAttributeP2Bold && isCurrentValueP2NotDroppedYet)
                || (isAttributeP3Bold && isCurrentValueP3NotDroppedYet)) {
                return false
            }
        }

        return true
    }

    modalToggle = () => {
        const { selectedOption } = this.state
        const completedTask = this.controlIfAllOptionsAreSelected()

        if (completedTask) {
            this.setState({
                modalOpen: false
            });
        } else {
            selectedOption.pop() //removed button selection
            this.setState({
                modalOpen: false,
                showMissingResultsIndicator: true
            });
        }
    }

    optionClicked = (evt) => {
        const { selectedOption, counter } = this.state
        const isOptionWasSelectedInThisRound = selectedOption.length === (counter + 1)

        let selectedValue = evt.target.value

        evt.target.blur() //remove focus of selected button

        if (selectedOption.length === 0 || selectedOption.length < (counter + 1)) {
            selectedOption.push(selectedValue)
        } else if (isOptionWasSelectedInThisRound) {
            selectedOption[counter] = selectedValue
        }

        // this.props.action(selectedValue);

        this.setState({ selectedOption: selectedOption, modalOpen: true },
            () => {
                console.log(this.state)
            })
    }

    onDoubleClickImage = (rating, productType, evt) => {
        const { multiAttributeResults } = this.state
        let multiAttributeResultsLocal = {  //local results in order to wait until rate image animation ends to update the cointainer
            p1: [...multiAttributeResults.p1],
            p2: [...multiAttributeResults.p2],
            p3: [...multiAttributeResults.p3]
        }
        let coordsY = 0
        if (productType === ItemTypesID.PRODUCT_1) {
            multiAttributeResultsLocal.p1.pop()
            multiAttributeResultsLocal.p1.push(rating)
            multiAttributeResultsLocal.p1.push(INDEX_HEADER_TOP)

            coordsY = document.getElementById(INDEX_HEADER.PRODUCT_1).getBoundingClientRect().top - (rating * 25)
        } else if (productType === ItemTypesID.PRODUCT_2) {
            multiAttributeResultsLocal.p2.pop()
            multiAttributeResultsLocal.p2.push(rating)
            multiAttributeResultsLocal.p2.push(INDEX_HEADER_TOP)

            coordsY = document.getElementById(INDEX_HEADER.PRODUCT_2).getBoundingClientRect().top - (rating * 25)
        } else if (productType === ItemTypesID.PRODUCT_3) {
            multiAttributeResultsLocal.p3.pop()
            multiAttributeResultsLocal.p3.push(rating)
            multiAttributeResultsLocal.p3.push(INDEX_HEADER_TOP)

            coordsY = document.getElementById(INDEX_HEADER.PRODUCT_3).getBoundingClientRect().top - (rating * 25)
        }

        document.getElementById(productType).style.backgroundColor = GREEN

        this.setState({
            showMissingResultsIndicator: false,
            visibility: 1,
            imageRating: rating,
            coordinatesImage: { leftX: evt.clientX, leftY: evt.clientY, y: coordsY },
            multiAttributeResultsTmp: multiAttributeResultsLocal
        })
    }

    onAnimationRateImageEnd = () => {
        const { multiAttributeResultsTmp } = this.state

        document.getElementById(ItemTypesID.PRODUCT_1).style.backgroundColor = WHITE
        document.getElementById(ItemTypesID.PRODUCT_2).style.backgroundColor = WHITE
        document.getElementById(ItemTypesID.PRODUCT_3).style.backgroundColor = WHITE
        this.setState({
            visibility: 0,
            multiAttributeResults: multiAttributeResultsTmp //now we update the table after the animation ends
        })
    }

    multiAttributeResultsHandler = (attributeResults) => {
        this.setState({
            multiAttributeResults: attributeResults.results,
            showMissingResultsIndicator: false
        })
    }

    render() {
        const { counter, selectedOption, modalOpen, visibility, imageRating, coordinatesImage,
            multiAttributeResults, showMissingResultsIndicator } = this.state
        const data = attributeListsForDemo[counter]
        const showFeedback = data.showFeedback
        const showFeedbackCorrectAnswer = selectedOption[counter] === data.correctAnswer
        const completedTask = this.controlIfAllOptionsAreSelected()
        return (
            <Container key={"KEY_" + counter}>
                <Modal isOpen={modalOpen} toggle={this.modalToggle} style={modaltStyle}>
                    {getModalText(showFeedback, showFeedbackCorrectAnswer, completedTask)}
                </Modal>
                {/* Row style to avoid 'layout of all three panes should be fixed, not floating (when window is resized, panes change their layout)' */}
                <Row className="justify-content-center" style={{ display: 'inline-flex', position: 'fixed', flexWrap: 'nowrap' }}>
                    <Card body style={{ marginTop: "20px" }}>
                        <div>{getRatingStarBarTable(data)}</div>
                    </Card>
                    <Card body style={{ marginTop: "20px" }}>
                        <div>{getTable(selectedOption[counter], data, this.optionClicked,
                            this.onDoubleClickImage, showMissingResultsIndicator, multiAttributeResults)}</div>
                    </Card>
                    <Card id="cardStackVisual" body style={{ marginTop: "20px" }}>
                        <DemoContainer action={this.multiAttributeResultsHandler} currentResult={multiAttributeResults} />
                    </Card>
                </Row>
                <RateImage
                    image={ImageMapperRating(imageRating)}
                    visibility={visibility}
                    x1={coordinatesImage.leftX}
                    x2={coordinatesImage.leftX + 300}
                    y1={coordinatesImage.leftY}
                    y2={coordinatesImage.y}
                    style={{ position: "absolute", top: '0px', left: '0px' }}
                    action={this.onAnimationRateImageEnd} />
            </Container>
        );
    }
}

/**
 * 
 * @param {*} showFeedback 
 * @param {*} showFeedbackCorrectAnswer 
 * @param {*} completedTask 
 * @returns 
 */
function getModalText(showFeedback, showFeedbackCorrectAnswer, completedTask) {
    return (<ModalHeader style={{ padding: "4em" }}>
        {completedTask ? getModalFeedback(showFeedback, showFeedbackCorrectAnswer) :
            <div><h4>You did not finished yet. Please complete the stacks.</h4></div>}
    </ModalHeader>)
}

/**
 * 
 * @param {*} showFeedback 
 * @param {*} showFeedbackCorrectAnswer 
 * @returns 
 */
function getModalFeedback(showFeedback, showFeedbackCorrectAnswer) {
    return (
        <>
            {(showFeedback === SHOW_FEEDBACK_TRUE) ?
                <div style={{ textAlign: "center" }}>
                    {showFeedbackCorrectAnswer ? <FontAwesomeIcon color="green" icon={faSmile} size="4x" />
                        : <FontAwesomeIcon color="red" icon={faFrown} size="4x" />}
                </div>
                : <></>}
            <br /><div><h4>{TEXT_FOOTER}</h4></div>
        </>
    )
}

/**
 * 
 * @param {*} selectedValue 
 * @param {*} data 
 * @param {*} onClick 
 * @param {*} onDoubleClick 
 * @param {*} showMissingResultsIndicator 
 * @param {*} multiAttributeResults 
 * @returns 
 */
function getTable(selectedValue, data, onClick, onDoubleClick, showMissingResultsIndicator, multiAttributeResults) {
    return (
        <Table responsive style={{ textAlign: 'center' }}>
            <thead>
                <tr>
                    <th>
                        <button color="primary" id={"btn_" + FIRST_RADIO_VALUE}
                            className={selectedValue === FIRST_RADIO_VALUE ? "btn btn-warning" : "btn btn-primary"} //Values from 1 to length
                            style={{ marginTop: "0px", marginBottom: "0px", fontSize: "0.9em" }}
                            onClick={onClick} value={FIRST_RADIO_VALUE}>
                            Pralka 1
                        </button>
                    </th>
                    <th>
                        <button color="primary" id={"btn_" + SECOND_RADIO_VALUE}
                            className={selectedValue === SECOND_RADIO_VALUE ? "btn btn-warning" : "btn btn-primary"} //Values from 1 to length style={{ marginTop: "0px", marginBottom: "0px", fontSize: "0.9em" }}
                            onClick={onClick} value={SECOND_RADIO_VALUE}>
                            Pralka 2
                        </button>
                    </th>
                    <th>
                        <button color="primary" id={"btn_" + THIRD_RADIO_VALUE}
                            className={selectedValue === THIRD_RADIO_VALUE ? "btn btn-warning" : "btn btn-primary"} //Values from 1 to length style={{ marginTop: "0px", marginBottom: "0px", fontSize: "0.9em" }}
                            onClick={onClick} value={THIRD_RADIO_VALUE}>
                            Pralka 3
                        </button>
                    </th>
                </tr>
            </thead>
            <tbody>
                {getTableBody(data, onDoubleClick, showMissingResultsIndicator, multiAttributeResults)}
            </tbody>
        </Table>
    );
}


/**
 * 
 * @param {*} data 
 * @param {*} onDoubleClick 
 * @param {*} showMissingResultsIndicator 
 * @param {*} multiAttributeResults 
 * @returns 
 */
function getTableBody(data, onDoubleClick, showMissingResultsIndicator, multiAttributeResults) {
    let children = []
    let attributes = FIRST_TASK_PROPERTIES_TOTAL
    let rating = 0
    for (let i = 0; i < attributes; i++) {
        rating = 6 - i
        let showIndicatorP1 = false
        let showIndicatorP2 = false
        let showIndicatorP3 = false
        let isAttributeP1Bold = data.attributes[i].p1 === 1
        let isAttributeP2Bold = data.attributes[i].p2 === 1
        let isAttributeP3Bold = data.attributes[i].p3 === 1
        let isCurrentValueP1NotDroppedYet = true
        let isCurrentValueP2NotDroppedYet = true
        let isCurrentValueP3NotDroppedYet = true


        if (multiAttributeResults.p1.length > 0 || multiAttributeResults.p2.length > 0 || multiAttributeResults.p3.length > 0) {
            isCurrentValueP1NotDroppedYet = !multiAttributeResults.p1.includes(rating)
            isCurrentValueP2NotDroppedYet = !multiAttributeResults.p2.includes(rating)
            isCurrentValueP3NotDroppedYet = !multiAttributeResults.p3.includes(rating)

            showIndicatorP1 = showMissingResultsIndicator && isAttributeP1Bold && isCurrentValueP1NotDroppedYet
            showIndicatorP2 = showMissingResultsIndicator && isAttributeP2Bold && isCurrentValueP2NotDroppedYet
            showIndicatorP3 = showMissingResultsIndicator && isAttributeP3Bold && isCurrentValueP3NotDroppedYet
        }

        children.push(
            <tr key={i}>
                <td style={{ fontSize: '1.3em' }}>{boldStyle(isAttributeP1Bold, data.attributes[i].valueP1,
                    ItemTypes.PRODUCT_1, rating, showIndicatorP1, isCurrentValueP1NotDroppedYet, onDoubleClick, ItemTypesID.PRODUCT_1)}</td>
                <td style={{ fontSize: '1.3em' }}>{boldStyle(isAttributeP2Bold, data.attributes[i].valueP2,
                    ItemTypes.PRODUCT_2, rating, showIndicatorP2, isCurrentValueP2NotDroppedYet, onDoubleClick, ItemTypesID.PRODUCT_2)}</td>
                <td style={{ fontSize: '1.3em' }}>{boldStyle(isAttributeP3Bold, data.attributes[i].valueP3,
                    ItemTypes.PRODUCT_3, rating, showIndicatorP3, isCurrentValueP3NotDroppedYet, onDoubleClick, ItemTypesID.PRODUCT_3)}</td>
            </tr>
        );
    }

    return children;
}

/**
 * 
 * @param {*} isBold 
 * @param {*} data 
 * @param {*} productType 
 * @param {*} rating 
 * @param {*} showIndicator 
 * @param {*} isDragActive 
 * @param {*} onDoubleClick 
 * @returns 
 */
function boldStyle(isBold, data, productType, rating, showIndicator, isDragActive, onDoubleClick, columnType) {
    if (isBold && isDragActive)
        return (<Box name={data} type={productType} key={rating} index={rating} showIndicator={showIndicator}
            onDoubleClick={onDoubleClick} columnType={columnType} />)
    else if (!isDragActive)
        return <strong className='cursor-normal-text'>{data}</strong>
    else return <div className='cursor-normal-text'>{data}</div>
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
function getPropertiesTableBody(data) {
    let children = []
    let rating = 6; //6 stars
    for (let i = 0; i < 6; i++) {
        children.push(
            <tr key={i}>
                <td style={{ textAlign: 'left', fontSize: '1.0em', padding: '1.0em', verticalAlign: 'middle' }}>{data.attributes[i].name}</td>
                <td style={{ border: '1px solid black', padding: '0' }} className="align-middle">{RatingBar(rating)}</td>
            </tr>
        );
        rating--;
    }

    return children;
}

/**
 * 
 * @param {*} value 
 */
function RatingBar(value) {
    return (<ReactStars
        edit={false}
        size={20}
        count={value}
        value={value}
        color={WHITE}
        activeColor={BLACK}
        emptyIcon={<FontAwesomeIcon icon={faPlus} style={{ marginLeft: "5px" }} />}
        filledIcon={<FontAwesomeIcon icon={faPlus} style={{ marginLeft: "5px" }} />}
    />
    );
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
function getRatingStarBarTable(data) {
    return (
        <Table responsive borderless style={{ borderCollapse: 'separate' }}>
            <thead>
                <tr>
                    <th><h5>Właściwość</h5></th>
                    <th><h5>Ważność</h5></th>
                </tr>
            </thead>
            <tbody>
                {getPropertiesTableBody(data)}
            </tbody>
        </Table>
    );
}

export default MultiAttributeDemoV3;