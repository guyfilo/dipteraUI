import React, { useContext } from 'react';
import { Checkbox } from "../Checkbox/index.jsx";
import "./style.css";
import { SelectedMachinesContext } from "../SelectedMachinesContext/SelectedMachinesContext.jsx";

export const MachineTableRow = ({ machineId }) => {
    const { selectedMachines, selectMachine } = useContext(SelectedMachinesContext);
    const isSelected = selectedMachines.includes(machineId);

    const toggleSelected = () => {
        selectMachine(machineId, !isSelected);
    };

    return (
        <div className="machine-checkbox">
            <Checkbox
                boolVar={isSelected}
                setBoolVar={toggleSelected}
                text={<b className={"machine-checkbox-text"}>{`Machine ${machineId}`}</b>}
                id={machineId}
                textClassName="machine-name-container"
                rectangleClassName="machine-checkbox-rectangle"
            />
        </div>
    );
};
