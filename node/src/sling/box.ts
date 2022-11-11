import { findSlingboxes } from './binary';
import { AustinSession } from './austin';

export interface BoxConfig {
    finderId: string;
    adminPassword: string;
    host?: string;
    port?: number;

    blingsox: {
        name: string;
    }

    deviceInfo?: {
        name: string;
        productId: string;
        irblasterId: string;
        hwVersion: string;
        fwVersion: string;
        fwDate: string;
        macAddress: string;

        inputs: {
            id: number;
            type: string;
        }[];
    }
}

const sessions: Record<string, AustinSession> = {};

export async function createSession(boxConfig: BoxConfig) {
    if (!('host' in boxConfig) || !('port' in boxConfig)) {
        const found = await findSlingboxes();
        const find = found.find(e => e.finderId === boxConfig.finderId);
        if (find) {
            boxConfig.host = find.host;
            boxConfig.port = find.port;
        }
    }

    if (!boxConfig.host || !boxConfig.port) return;

    if (boxConfig.port > 5200) {
        // safely assume it's a newer box that supports austin
        const session = new AustinSession(boxConfig);
        
        await session.connect();
        session.startbeat();

        if (!('deviceInfo' in boxConfig)) {
            boxConfig.deviceInfo = await session.deviceInfo();
        }

        sessions[boxConfig.finderId] = session;
    }

    return boxConfig;
}

export async function closeSession(boxConfig: BoxConfig) {
    sessions[boxConfig.finderId].stopbeat();
    delete sessions[boxConfig.finderId];
}

export { findSlingboxes };