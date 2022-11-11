import { createServer } from 'http';
import { boxes, importBoxes, serialize } from './storage';
import { createSession, closeSession, findSlingboxes } from './sling/box';
import {
    createApp,
    createRouter,
    eventHandler,
    getQuery,
    getRouterParam,
    readBody,
    toNodeListener,
} from 'h3';

const app = createApp();
const router = createRouter();

router.get('/api/boxes/scan', eventHandler(async event => {
    const boxes = await findSlingboxes();
    return boxes;
}));

router.post('/api/boxes', eventHandler(async event => {
    const body = await readBody(event);
    if ('finderId' in body && 'adminPassword' in body && 'blingsox' in body) {
        serialize(body);
        return body;
    }
}));

router.get('/api/boxes/:id/info', eventHandler(async event => {
    const finderId = getFinderId(getRouterParam(event, 'id'));
    if (finderId) {
        const info = boxes[finderId].config.deviceInfo;
        if (!info) {
            const boxConfig = await createSession(boxes[finderId].config);
            closeSession(boxes[finderId].config);
            if (!boxConfig) return;
            serialize(boxConfig);
            return boxes[finderId].config.deviceInfo;
        } else return info;
    }
}));

app.use(router);

importBoxes();

export default createServer(toNodeListener(app));

function getFinderId(boxId: string) {
    for (const finderId in boxes)
        if (boxes[finderId].filename.replace('.box.json', '') === boxId)
            return finderId;
}