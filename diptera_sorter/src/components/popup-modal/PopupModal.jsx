import React from "react";
import "./PopupModal.css"; // Create a CSS file for styling
import {StartNewSession} from "../../screens/StartSessionWindow/index.jsx";
import { useState } from 'react';
import {SessionSetupIn} from "../../screens/sessionSetupWindow/sessionSetupWindow.jsx";

export const PopupModal = ({ isOpen, onClose,children }) => {
    if (!isOpen) return null; // Don't render if modal is closed
    const [showNewElement, setShowNewElement] = useState(false);

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

