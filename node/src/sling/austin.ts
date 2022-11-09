import { createHash } from 'crypto';
import { $fetch } from 'ohmyfetch';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

interface AustinState {
    host: string;
    port: number;
    username: string;
    password: string;

    requestIndex: number;
    sessionId?: string;
}

interface AustinError {
    error: Record<string, unknown>;
}

function createState(host: string, password: string): AustinState {
    return {
        host,
        port: 5201,
        username: 'admin',
        password,
        requestIndex: 0,
    };
}

async function connect(state: AustinState) {
    interface SessionResponse {
        session: {
            events: { '@_xlink:href': string };
            events_v2: { '@_xlink:href': string };
            events_reg: { '@_xlink:href': string };
            caps: { '@_xlink:href': string };
            avinputs: { '@_xlink:href': string };
            current_avinput: { '@_xlink:href': string };
            streams: { '@_xlink:href': string };
            device: { '@_xlink:href': string };
            whatison: { '@_xlink:href': string };
            setup: { '@_xlink:href': string };
            host_app: { '@_xlink:href': string };
            '@_xlink:href': string;
        }
    }

    type AustinSessionResponse = SessionResponse | AustinError;

    const sessionRequest = await dispatchRequest<AustinSessionResponse>(state, '', {
        client: {
            description: 'blingsox'
        }
    });

    if ('session' in sessionRequest) {
        state.sessionId = sessionRequest.session['@_xlink:href'];
    }
}

async function deviceInfo(state: AustinState) {
    interface DeviceResponse {
        device: {
            id: string;
            product: string;
            irblaster: string;
            'hardware_version': string;
            'firmware_version': string;
            'firmware_date': string;
            mac: string;
            utf8_box_name: string;
            name: string;
            'remote_config': string;
            'remote_access': string;
            accounts: { account: [any] }
            ip: {
                type: string;
                address: string;
                subnet_mask: string;
                gateway: string;
                port: number;
                mtu: number;
                'dns_preferred': string;
                'dns_alternate': string;
            };
            upnp: {
                address: string;
                port: number;
                uri: string;
            }
            avinputs: {
                avinput: {
                    id: number;
                    is_current: boolean;
                    input_type: string;
                    '@_xlink:href': string;
                }
            }
        }
    }

    type AustinDeviceResponse = DeviceResponse | AustinError;

    const deviceRequest = await dispatchRequest<AustinDeviceResponse>(state, '/device?Method=GET', {});

    if ('device' in deviceRequest) {
        console.log(deviceRequest.device.avinputs);
    }
}

async function pulse(state: AustinState) {
    interface EventsResponse {
        events: Record<string, unknown>;
    }

    type AustinEventsResponse = EventsResponse | AustinError;

    const eventsRequest = await dispatchRequest<AustinEventsResponse>(state, '/events?Method=GET&timeout=0', {});
}

async function dispatchRequest<T>(state: AustinState, path: string, body: any): Promise<T> {
    const cnonce = Date.now();
    const digest = createHash('md5')
        .update(`${state.username}:${state.sessionId ?? ''}:${cnonce}:${state.requestIndex}:${state.password}`)
        .digest('hex');

    const data = new XMLBuilder({ ignoreAttributes: false }).build(body);

    // console.log(`${state.username}:${state.sessionId || ''}:${cnonce}:${state.requestIndex}:${state.password}`)
    // console.log(`account=${state.username}, counter=${state.requestIndex}, cnonce=${cnonce}, digest=${digest}`)

    const response = await $fetch(path, {
        baseURL: `http://${state.host}:${state.port}/slingbox${state.sessionId ?? ''}`,
        headers: {
            'Accept': 'text/xml',
            'Content-Type': 'text/xml',
            'Content-Length': data.length,
            'Sling-Authorization': `account=${state.username}, counter=${state.requestIndex}, cnonce=${cnonce}, digest=${digest}`,
        },
        method: 'POST',
        body: data,
        responseType: 'text',
        parseResponse: txt => new XMLParser({ ignoreAttributes: false }).parse(txt),
        // onRequestError: err => console.log(err),
        // onResponse: () => { state.requestIndex++ },
    });

    state.requestIndex++;

    console.log(response);

    return response as T;
}

// (async () => {
//     const state = createState('slingbox-500.lan', '')

//     await connect(state)
//     await deviceInfo(state)
//     await pulse(state)
// })();