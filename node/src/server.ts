import { createServer } from 'http';
import binary from './sling/box';
import { boxes, importBoxes, updateBox } from './storage';
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
    const boxes = await binary.findSlingboxes();
    return boxes;
}));

router.post('/api/boxes/new', eventHandler(async event => {
    const body = await readBody(event);
    if ('finderId' in body && 'adminPassword' in body) {
        updateBox(body);
        return body;
    }
}));

app.use(router);

importBoxes();

export default createServer(toNodeListener(app));