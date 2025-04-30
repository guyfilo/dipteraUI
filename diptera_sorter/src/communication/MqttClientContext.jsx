import React, { createContext, useContext, useEffect, useState } from 'react';
import mqtt from 'mqtt';

// Create a context for the MQTT client
const MqttContext = createContext();

// MQTT client provider
export const MqttProvider = ({ children }) => {
    const [client, setClient] = useState(null);

    useEffect(() => {
        const mqttClient = mqtt.connect('mqtt://127.0.0.1:9001');

        mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');
        });

        mqttClient.on('error', (err) => {
            console.error('MQTT Error:', err);
        });

        setClient(mqttClient);

        return () => {
            mqttClient.end();
        };
    }, []);

    // Function to subscribe to a topic and log messages
    const subscribeToTopic = (topic, messageHandler) => {
        if (!client) return;

        client.subscribe(topic, (err) => {
            if (err) {
                console.log(`Subscription error on ${topic}:`, err);
            } else {
                console.log(`Subscribed to ${topic}`);
            }
        });

        const handleMessage = (receivedTopic, message) => {
            if (receivedTopic === topic) {
                console.log(`Message on ${topic}:`, message.toString());
                if (messageHandler) {
                    messageHandler(message.toString());
                }
            }
        };

        client.on('message', handleMessage);

        return () => {
            client.unsubscribe(topic, (err) => {
                if (err) {
                    console.log(`Unsubscription error on ${topic}:`, err);
                } else {
                    console.log(`Unsubscribed from ${topic}`);
                }
            });
            client.removeListener('message', handleMessage);
        };
    };

    return (
        <MqttContext.Provider value={{ client, subscribeToTopic }}>
            {children}
        </MqttContext.Provider>
    );
};

// Custom hook to access the MQTT client and subscription function
export const useMqtt = () => {
    return useContext(MqttContext);
};
