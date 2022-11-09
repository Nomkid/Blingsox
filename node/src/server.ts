import { createServer } from 'http';
import binary from './sling/box';
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

app.use(router);

export default createServer(toNodeListener(app));