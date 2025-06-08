import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(token) {
        if (this.isConnected) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                this.socket = io('http://localhost:12000/tracking', {
                    auth: {
                        token: token,
                    },
                    transports: ['websocket'],
                    autoConnect: true,
                    reconnection: true,
                    reconnectionAttempts: this.maxReconnectAttempts,
                    reconnectionDelay: 1000,
                    timeout: 10000,
                });

                this.socket.on('connect', () => {
                    console.log('✅ Connected to tracking socket');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve();
                });

                this.socket.on('connected', (data) => {
                    console.log('🔗 Tracking service connected:', data);
                });

                this.socket.on('disconnect', (reason) => {
                    console.log('❌ Disconnected from tracking socket:', reason);
                    this.isConnected = false;

                    if (reason === 'io server disconnect') {
                        this.socket.connect();
                    }
                });

                this.socket.on('error', (error) => {
                    console.error('🚨 Socket error:', error);
                    this.emit('error', error);
                });

                this.socket.on('connect_error', (error) => {
                    console.error('🚨 Connection error:', error);
                    this.isConnected = false;
                    this.reconnectAttempts++;

                    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                        reject(error);
                    }
                });

                this.socket.on('reconnect', (attemptNumber) => {
                    console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
                    this.isConnected = true;
                });

                this.socket.on('reconnect_failed', () => {
                    console.error('❌ Failed to reconnect after maximum attempts');
                    this.emit('connectionFailed', 'Failed to reconnect');
                });

                this.setupEventListeners();
            } catch (error) {
                console.error('🚨 Failed to create socket connection:', error);
                reject(error);
            }
        });
    }

    setupEventListeners() {
        this.socket.on('order_status_updated', (data) => {
            console.log('📦 Order status updated:', data);
            this.emit('orderStatusUpdated', data);
        });

        this.socket.on('order_created', (data) => {
            console.log('🆕 Order created:', data);
            this.emit('orderCreated', data);
        });

        this.socket.on('order_cancelled', (data) => {
            console.log('❌ Order cancelled:', data);
            this.emit('orderCancelled', data);
        });

        this.socket.on('order_delivered', (data) => {
            console.log('✅ Order delivered:', data);
            this.emit('orderDelivered', data);
        });

        this.socket.on('subscribed', (data) => {
            console.log('✅ Subscribed to order:', data);
            this.emit('subscribed', data);
        });

        this.socket.on('unsubscribed', (data) => {
            console.log('❌ Unsubscribed from order:', data);
            this.emit('unsubscribed', data);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.listeners.clear();
            console.log('👋 Socket disconnected manually');
        }
    }

    subscribeToOrder(orderId) {
        if (this.isConnected && this.socket) {
            console.log(`📻 Subscribing to order: ${orderId}`);
            this.socket.emit('subscribe_order', { orderId });
        } else {
            console.warn('⚠️ Cannot subscribe - socket not connected');
        }
    }

    unsubscribeFromOrder(orderId) {
        if (this.isConnected && this.socket) {
            console.log(`📻 Unsubscribing from order: ${orderId}`);
            this.socket.emit('unsubscribe_order', { orderId });
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('🚨 Error in socket listener:', error);
                }
            });
        }
    }

    isSocketConnected() {
        return this.isConnected && this.socket && this.socket.connected;
    }

    getConnectionState() {
        if (!this.socket) return 'disconnected';
        if (this.socket.connected) return 'connected';
        if (this.socket.connecting) return 'connecting';
        return 'disconnected';
    }
}

export const socketService = new SocketService();
