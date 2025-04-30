import React from "react";
import subtractBack from "../SessionSetup/Subtract-back.svg";
import "./style.css";
import subtract from "../SessionSetup/Subtract.svg";
import { useState, useEffect } from "react";
import mqtt from "mqtt";
import {Button} from "../../components/Button/index.js";

export const SessionSetupIn = ({onClose}) => {
    const [angle, setAngle] = useState(0);
    const [message, setMessage] = useState(""); // State to store MQTT messages
    const [finishSetup, setFinishSetup] = useState(false); // State to store MQTT messages


    useEffect(() => {
        const interval = setInterval(() => {
            setAngle(prevAngle => prevAngle + 1); // Increase rotation by 1 degree
        }, 10); // Adjust interval speed as needed

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    useEffect(() => {
        // MQTT CONNECTION
        const client = mqtt.connect("ws://127.0.0.1:9001"); // Replace with your broker

        client.on("connect", () => {
            console.log("Connected to MQTT");
            client.subscribe("set-up"); // Replace with your topic
        });

        client.on("message", (topic, payload) => {
            console.log("Message received:", payload.toString());
            setMessage(payload.toString()); // Update message state
            if (payload.toString() === "finish-setup") {
                setFinishSetup(true);
            }
        });

        return () => {
            client.end(); // Cleanup on unmount
        };
    }, []);


    return (
        <div className="session-setup-in">
            {finishSetup ? (<div>
                    <div className="div">
                        <div className="text-wrapper-start">Setup successful</div>
                        <div className="ellipse-11" />
                        <div className="ellipse-12" />
                        <div className="ellipse-13" />
                        <Button
                            className="button-instance-start"
                            divClassName="design-component-instance-node-start"
                            text="START"
                            onClick={onClose}
                        />
                    </div>
            </div>) :
                (
            <div className="div">
                <div className="ellipse" />

                <div className="ellipse-2" />

                <div className="ellipse-3" />

                <div className="overlap-group"       style={{
                    transform: `rotate(${angle}deg)`,
                    transition: "transform 0.1s linear" // Smooth transition
                }}>
                    <img className="subtract" alt="Subtract" src={subtract} />

                    <img className="subtract" alt="Subtract" src={subtractBack} />
                </div>

                <div className="text-wrapper">
                    {message || "Waiting for MQTT message..."}
                </div>
            </div>
                )}
        </div>
    );
};
