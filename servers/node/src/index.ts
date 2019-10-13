import { SimpleQueueServer } from './simple-queue-server';

const server = new SimpleQueueServer();
try {
    server.init();
    console.log('Listening');
} catch (e) {
    console.error(`Failed to start ${e.message}`);
}
