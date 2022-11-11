import { createHash } from 'crypto';
import { $fetch } from 'ohmyfetch';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { BoxConfig } from './box';

interface AustinError {
    error: Record<string, unknown>;
}

export class AustinSession {
    requestIndex: number;
    sessionId: string;

    private _timeout?: NodeJS.Timeout;

    constructor (public boxConfig: BoxConfig) {
        this.requestIndex = 0;
        this.sessionId = '';
    }

    async connect() {
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
    
        const sessionRequest = await this.dispatchRequest<AustinSessionResponse>('', {
            client: {
                description: 'blingsox'
            }
        });
    
        if ('session' in sessionRequest) {
            this.sessionId = sessionRequest.session['@_xlink:href'];
        }
    }

    async deviceInfo() {
        interface DeviceResponse {
            device: {
                id: string;
                product: string;
                irblaster: string;
                hardware_version: string;
                firmware_version: string;
                firmware_date: string;
                mac: string;
                utf8_box_name: string;
                name: string;
                remote_config: string;
                remote_access: string;
                accounts: { account: [any] }
                ip: {
                    type: string;
                    address: string;
                    subnet_mask: string;
                    gateway: string;
                    port: number;
                    mtu: number;
                    dns_preferred: string;
                    dns_alternate: string;
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
                    }[]
                }
            }
        }
    
        type AustinDeviceResponse = DeviceResponse | AustinError;
    
        const deviceRequest = await this.dispatchRequest<AustinDeviceResponse>('/device?Method=GET', {});
    
        if ('device' in deviceRequest) return {
            name: deviceRequest.device.utf8_box_name,
            productId: deviceRequest.device.product,
            irblasterId: deviceRequest.device.irblaster,
            hwVersion: deviceRequest.device.hardware_version,
            fwVersion: deviceRequest.device.firmware_version,
            fwDate: deviceRequest.device.firmware_date,
            macAddress: deviceRequest.device.mac.replace(/ /g, '0'),
            inputs: deviceRequest.device.avinputs.avinput.map(v => {
                return {
                    id: v.id,
                    type: v.input_type
                };
            })
        };
    }

    startbeat() {
        this.pulse();
    }

    stopbeat() {
        clearTimeout(this._timeout);
        delete this._timeout;
    }

    private async pulse() {
        interface EventsResponse {
            events: Record<string, unknown>;
        }
    
        type AustinEventsResponse = EventsResponse | AustinError;
    
        const eventsRequest = await this.dispatchRequest<AustinEventsResponse>('/events?Method=GET&timeout=0', {});

        this._timeout = setTimeout(() => {
            this.pulse();
        }, 5000);
    }

    private async dispatchRequest<T>(path: string, body: any): Promise<T> {
        const cnonce = Date.now();
        const digest = createHash('md5')
            .update(`admin:${this.sessionId}:${cnonce}:${this.requestIndex}:${this.boxConfig.adminPassword}`)
            .digest('hex');
    
        const data = new XMLBuilder({ ignoreAttributes: false }).build(body);
    
        console.log(`admin:${this.sessionId}:${cnonce}:${this.requestIndex}:${this.boxConfig.adminPassword}`);
        console.log(`account=admin, counter=${this.requestIndex}, cnonce=${cnonce}, digest=${digest}`);
    
        const response = await $fetch(path, {
            baseURL: `http://${this.boxConfig.host}:${this.boxConfig.port}/slingbox${this.sessionId}`,
            headers: {
                'Accept': 'text/xml',
                'Content-Type': 'text/xml',
                'Content-Length': data.length,
                'Sling-Authorization': `account=admin, counter=${this.requestIndex}, cnonce=${cnonce}, digest=${digest}`,
            },
            method: 'POST',
            body: data,
            responseType: 'text',
            parseResponse: txt => new XMLParser({ ignoreAttributes: false }).parse(txt),
        });
    
        this.requestIndex++;
    
        console.log(response);
    
        return response as T;
    }
}