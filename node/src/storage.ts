import jetpack from 'fs-jetpack';

export const boxesDir = jetpack.dir('./.blingsox/boxes');
export const streamsDir = jetpack.dir('./.blingsox/.streams');
export const cacheDir = jetpack.dir('./.blingsox/.cache');

interface BoxConfig {
    finderId: string;
    adminPassword: string;
    host?: string;
    port?: number;

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

export const boxes: Record<string, BoxConfig> = {};

export function importBoxes() {
    const filenames = boxesDir.list();
    if (!filenames) return;

    for (const filename of filenames) {
        if (filename.endsWith('.box.json')) {
            const config = boxesDir.read(filename, 'json');
            boxes[config.finderId] = config;
        }
    }
}

export function updateBox(config: BoxConfig) {
    boxes[config.finderId] = config;
}