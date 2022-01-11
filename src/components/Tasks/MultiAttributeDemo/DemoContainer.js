import React, { useState, useCallback } from "react";

import { Table } from "reactstrap";

import { Dustbin } from "./Dustbin";
import { ItemTypes } from "./ItemTypes";
import update from "immutability-helper";

export default function Container() {
    const [dustbins, setDustbins] = useState([
        { accepts: [ItemTypes.PRODUCT_1], lastDroppedItem: [] },
        { accepts: [ItemTypes.PRODUCT_2], lastDroppedItem: [] },
        { accepts: [ItemTypes.PRODUCT_3], lastDroppedItem: [] }
    ]);

    const [droppedBoxNames, setDroppedBoxNames] = useState([]);
    function isDropped(boxName) {
        return droppedBoxNames.indexOf(boxName) > -1;
    }
    const handleDrop = useCallback(
        (index, item) => {
            const { name } = item;
            setDroppedBoxNames(
                update(droppedBoxNames, name ? { $push: [name] } : { $push: [] })
            );
            setDustbins(
                update(dustbins, {
                    [index]: {
                        lastDroppedItem: {
                            $push: [item]
                        }
                    }
                })
            );
        },
        [droppedBoxNames, dustbins]
    );
    return (
        <Table borderless responsive style={{ textAlign: 'center' }}>
            <thead>
                <tr>
                    <th><h5>Product 1</h5></th>
                    <th><h5>Product 2</h5></th>
                    <th><h5>Product 3</h5></th>
                </tr>

            </thead>
            <tbody>
                <tr>
                    {dustbins.map(({ accepts, lastDroppedItem }, index) => (
                        <td style={{ verticalAlign: 'bottom', height: '100%' }}>
                            <Dustbin
                                accept={accepts}
                                lastDroppedItem={lastDroppedItem}
                                onDrop={(item) => handleDrop(index, item)}
                                key={index}
                            />
                        </td>
                    ))}
                </tr>
            </tbody>
        </Table>
    );
}