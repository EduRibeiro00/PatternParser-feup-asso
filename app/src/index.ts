import { CommunicationManager } from './CommunicationManager';
import { RecoveryManager } from './RecoveryManager';
import { PaperParserDirector } from './parser/PaperParserDirector';
import mqtt from 'mqtt';

const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://test.mosquitto.org:1883');
client.on('message', (topic, message) => console.log(`Received from ${topic} this: ${message}`));

CommunicationManager.getInstance().addSubscriber(new PaperParserDirector());
RecoveryManager.getInstance().runRecovery();
