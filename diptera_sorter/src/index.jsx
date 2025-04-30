import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {AppWindow} from "./screens/AppWindow";
// import { DataProvider } from "./communication/DataContext.jsx";
import {MqttProvider} from "./communication/MqttClientContext.jsx";
import {SelectedMachinesProvider} from "./components/SelectedMachinesContext/SelectedMachinesContext.jsx";


import React, {useContext, useState} from "react";
import {DataContext, DataProvider} from "./communication/DataContext.jsx";


import "./index.css"

createRoot(document.getElementById("app")).render(
    <StrictMode>
        <DataProvider>
            <SelectedMachinesProvider>
                <AppWindow/>
            </SelectedMachinesProvider>
        </DataProvider>
    </StrictMode>,
)
;

//
// import "./index.css"
// createRoot(document.getElementById("app")).render(
//     <DataProvider>
//         <Dashboard />
//     </DataProvider>
// );
//


// import { useEffect, useState } from "react";
// import mqtt from "mqtt";
//
// const brokerUrl = "ws://127.0.0.1:9001";
//
// function App() {
//     const [client, setClient] = useState(null);
//     const [status, setStatus] = useState("Disconnected");
//
//     useEffect(() => {
//         const mqttClient = mqtt.connect(brokerUrl);
//
//         mqttClient.on("connect", () => {
//             console.log("Connected to MQTT");
//             mqttClient.subscribe("machine/status");
//             setStatus("Connected");
//         });
//
//         mqttClient.on("message", (topic, message) => {
//             console.log(`Received: ${topic} -> ${message.toString()}`);
//         });
//
//         setClient(mqttClient);
//
//         return () => mqttClient.end();
//     }, []);
//
//     const sendCommand = (command) => {
//         if (client) {
//             client.publish("machine/control", command);
//         }
//     };
//
//     return (
//         <div>
//             <h2>Machine Control</h2>
//             <p>StatusIcon: {status} </p>
//             <button onClick={() => sendCommand("START")}>Start</button>
//             <button onClick={() => sendCommand("STOP")}>Stop</button>
//         </div>
//     );
// }
//
// export default App;
//
// createRoot(document.getElementById("app")).render(
//     <App></App>
// );