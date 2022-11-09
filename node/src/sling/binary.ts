import { createSocket } from 'dgram';

interface BinaryBoxInfo {
    host: string;
    port: number;
    name: string;
    finderId: string;
}

export function findSlingboxes(timeout = 2000) {
    return new Promise((resolve, reject) => {
        const message = new Uint8Array([0x01, 0x01, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    
        const socket = createSocket('udp4');

        const boxes: BinaryBoxInfo[] = [];
        
        socket.on('message', (msg, rinfo) => {
            const sig = Buffer.from(message);
            sig[16] = 0x5c;
            if (msg.length === 124 && msg.subarray(0, sig.length).equals(sig)) {
                const str = msg.subarray(40, 56).toString('hex');
                boxes.push({
                    finderId: `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(20)}`,
                    // eslint-disable-next-line no-control-regex
                    name: msg.subarray(56, 120).toString('utf16le').replace(/\x00/g, ''),
                    port: msg.readUInt16LE(120),
                    host: rinfo.address
                });
            }
        });
        
        socket.on('listening', () => {
            socket.setBroadcast(true);
            socket.send(message, 0, message.length, 5004, '255.255.255.255');
            setTimeout(() => resolve(boxes), timeout);
        });

        socket.on('error', reject);
    
        socket.bind(0);

    });
}