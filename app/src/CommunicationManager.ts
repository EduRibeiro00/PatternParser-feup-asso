import { IObserver } from './IObserver';
import mqtt, { MqttClient } from 'mqtt';
import { RecoveryManager } from './RecoveryManager';

class CommunicationManager {
    private static INSTANCE : CommunicationManager;

    private subscribers: Array<IObserver>;
    private queueURL: string;
    private mqtt: MqttClient;

    public static getInstance() : CommunicationManager {
        if (!CommunicationManager.INSTANCE) {
            CommunicationManager.INSTANCE = new CommunicationManager();
        }
        return CommunicationManager.INSTANCE;
    }

    private constructor() {
        this.subscribers = [];
        this.queueURL = process.env.MQTT_URL || 'mqtt://test.mosquitto.org:1883';
        this.mqtt = mqtt.connect(this.queueURL);

        this.mqtt.on('connect', () => {
            console.log(`Established connect to MQTT queue ${this.queueURL}`);
            this.listenToTopics();
        });
    }

    public listenToTopics() : void {
        const topics = process.env.INPUT_TOPICS?.split(',') || [];
        topics.forEach(topic => {
            this.mqtt.subscribe(topic, err => {
                const msg = err ?
                    `Error connecting to topic "${topic}"`
                    :
                    `Subscribed to topic "${topic}"`
                console.log(msg);
            });
        });

        this.mqtt.on('message', this.onReceive.bind(this));
    }

    public onReceive(topic: string, message: string) {
        console.log(`Received from topic ${topic} the following message: ${message}`);
        const parsedMessage = JSON.parse(message);
        if (!('url' in parsedMessage)) {
            console.error('Invalid message; does not contain a valid URL');
            return;
        }
        RecoveryManager.getInstance().storeNewPaper(parsedMessage.url);
        this.notifySubscribers(parsedMessage.url);
    }
    
    public notifySubscribers(url: string) {
        this.subscribers.forEach(sub => sub.notify(url));
    }

    public addSubscriber(subscriber: IObserver) : void {
        this.subscribers.push(subscriber);
    }

    public publish(topic: string, data: object) : void {
        this.mqtt.publish(topic, JSON.stringify(data));
    }
}

// export singleton instance
export { CommunicationManager }