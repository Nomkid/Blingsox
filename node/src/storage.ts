import jetpack from 'fs-jetpack';
import { BoxConfig } from './sling/box';

export const boxesDir = jetpack.dir('./.blingsox/boxes');
export const streamsDir = jetpack.dir('./.blingsox/.streams');
export const cacheDir = jetpack.dir('./.blingsox/.cache');

interface ConfigList {
    [key: string]: {
        filename: string;
        config: BoxConfig;
    }
}

export const boxes: ConfigList = {};

export function importBoxes() {
    const filenames = boxesDir.list();
    if (!filenames) return;

    for (const filename of filenames) {
        if (filename.endsWith('.box.json')) {
            const config = boxesDir.read(filename, 'json');
            boxes[config.finderId] = { filename, config };
        }
    }
}

export function serialize(config: BoxConfig) {
    if (config.finderId in boxes) {
        boxes[config.finderId].config = config;
    } else {
        boxes[config.finderId] = {
            config,
            filename: `${config.blingsox.name.replace(/ /g, '-')}.box.json`
        };
    }
    boxesDir.write(boxes[config.finderId].filename, config);
}