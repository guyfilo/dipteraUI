import React, { useState } from "react";
import {Checkbox} from "../Checkbox/index.jsx";

const MultiSelectDropdown = ({ label, options, selected, setSelected }) => {
    const [open, setOpen] = useState(false);

    const toggleOption = (option, checked) => {
        setSelected((prev) =>
            checked
                ? [...prev, option]               // Add
                : prev.filter((o) => o !== option) // Remove
        );
    };

    const displayLabel =`Select ${label}`;

    return (
        <div style={{ position: "relative", display: "inline-block", marginRight: "1rem" }}
             onMouseEnter={() => setOpen(true)}
             onMouseLeave={() => setOpen(false)}

        >
            <button
                style={{
                    padding: "6px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: selected.length > 0 ? "rgba(92, 178, 244, 0.1)": "white" ,
                    cursor: "pointer",
                    minWidth: "200px",
                    textAlign: "left",
                }}
            >
                {displayLabel}
            </button>

            {open && (
                <div

                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        background: "white",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "8px",
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                        minWidth: "200px",
                    }}
                >
                    {options.map((option) => (
                        <div
                            key={option}
                            style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}
                        >
                            <Checkbox
                                boolVar={selected.includes(option)}
                                setBoolVar={(checked) => toggleOption(option, checked)}
                            />
                            <span style={{ marginLeft: "0.3rem" }}>{option}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
