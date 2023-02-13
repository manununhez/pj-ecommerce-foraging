import React from 'react';
import { Row, Col, Input, Button } from "reactstrap";

import PropTypes from "prop-types";
import ScrollMenu from "react-horizontal-scrolling-menu";
import StarRatings from 'react-star-ratings';

import { PRODUCT_MENU_BG_COLORS, ALLEGRO_ORANGE } from "../../../helpers/constants";

const DEBUG = (process.env.REACT_APP_DEBUG_LOG === "true") ? true : false;

export default function ProductsMenu(props) {
    const backgroundColorItem = PRODUCT_MENU_BG_COLORS[props.store % PRODUCT_MENU_BG_COLORS.length]
    const menu = Menu(props.products, props.selected)
    const ArrowRight = Arrow({ text: "", className: "arrow-next" });

    return (<div className="scroll-menu" style={{ backgroundColor: backgroundColorItem }}>
        <Row style={{ backgroundColor: "white", height: "60px", padding: "15px", marginBottom: "20px", marginRight: "auto", marginLeft: "auto" }}>
            <Col xs="2"></Col>
            <Col xs="6">
                <Row>
                    <Col xs="10"><Input placeholder="what are you looking for?" style={{ backgroundColor: "white" }} type="search" disabled /></Col>
                    <Col xs="2"><button style={{ backgroundColor: ALLEGRO_ORANGE, paddingTop: "5px", paddingBottom: "5px", paddingLeft: "10px", paddingRight: "10px", color: "white" }} disabled> SEARCH</button></Col>
                </Row>
            </Col>
            <Col xs="2" style={{ textAlign: "center" }}>
                <img src="https://assets.allegrostatic.com/metrum/icon/bag-c9f42da6df.svg" alt="" />
                <img src="https://assets.allegrostatic.com/metrum/icon/user-0135502fa4.svg" alt="" />
            </Col>
            <Col xs="2" style={{ alignSelf: "center" }}>Bargains: {props.bargainsTaken}</Col>
        </Row>
        <h4 style={{ paddingTop: "15px", paddingBottom: "5px", paddingLeft: "10px" }}>Local offers!</h4>
        <div data-tut="reactour__product_belt" style={{ backgroundColor: "white", paddingTop: "40px", paddingBottom: "40px", paddingLeft: "5px" }}>
            <ScrollMenu
                alignCenter={false}
                arrowRight={ArrowRight}
                clickWhenDrag={false}
                data={menu}
                scrollBy={5}
                dragging={false}
                leftArrowVisible={false}
                hideArrows={true}
                hideSingleArrow={true}
                onFirstItemVisible={props.onFirstItemVisible}
                onLastItemVisible={props.onLastItemVisible}
                onSelect={props.onSelect}
                onUpdate={props.onUpdate}
                // ref={el => (this.menu = el)}
                scrollToSelected={false}
                // selected={selected}
                transition={0.3}
                translate={0}
                wheel={false}
            />
        </div>

        <div className="text-center store-btn">
            <Button id="reactour__button" data-tut="reactour__button" color="primary" size="lg" style={{ fontSize: "x-large" }} onClick={props.onGoStoreBtnClick}> Go to new store</Button > {' '}
        </div>

        <div style={{ backgroundColor: "#3a4e58", height: "70px", lineHeight: "70px", textAlign: "center", color: "white", fontSize: "small" }}>
            <p>By using the website, you accept the regulations</p>
        </div>
    </div>)
};

const RatingBar = (value) => {
    return (<StarRatings
        rating={value}
        starRatedColor="#f7cb4d"
        starEmptyColor="white"
        starDimension="16px"
        isSelectable={false}
        starSpacing="-1px"
        numberOfStars={value}
    />);
}

const Menu = (list, selected) =>
    list.map((item, index) => {
        const isSelected = selected.includes(index)

        return MenuItem(item, index, isSelected);
    });

const MenuItem = (item, productIndex, isSelected) => {
    const discountPercentage = (item.discount * 100).toFixed()
    return (
        <div key={productIndex} id={"reactour__product_" + productIndex} data-tut={"reactour__product_" + productIndex}>
            <ProductItem
                productIndex={productIndex}
                item={item}
                isSelected={isSelected}
                discountPercentage={discountPercentage} />
        </div>
    );
};

function ProductItem(props) {
    const productIndex = props.productIndex
    const item = props.item
    const isSelected = props.isSelected
    const discountPercentage = props.discountPercentage

    return (
        <div className="card product-card"
            style={{ backgroundColor: isSelected ? "grey" : ((item.isBargain && DEBUG) ? "#e6ffcc" : "white") }}>
            {DEBUG ? <div>product#:{item.productNumber}</div> : <></>}
            <h5>{discountPercentage}% OFF!!</h5>
            <img className="responsive-images product-image"
                src={item.img}
                alt={item.productNumber} />
            <div style={{ position: "relative" }}>
                <div>
                    <h5 className="strikethrough">${item.oldPrice}</h5>
                    <h5>${item.newPrice}</h5>
                </div>
                <div style={{ bottom: 0, right: 0, position: "absolute", marginBottom: "10px" }}>{RatingBar(item.numOfStars)}</div>
            </div>
        </div>
    )
}

const Arrow = ({ text, className }) => {
    return <div data-tut="reactour__more_products" className={className}>{text}</div>;
};

Arrow.propTypes = {
    text: PropTypes.string,
    className: PropTypes.string
};