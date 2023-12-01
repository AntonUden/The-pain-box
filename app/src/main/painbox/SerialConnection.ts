import { SerialPort } from "serialport";
import PainBox from "./PainBox";
import { BackendEvents } from "./BackendEvents";
import { MessageType } from "../../shared/MessageType";

export default class SerialConnection {
	private _painBox: PainBox;
	private _device: string;
	private _baudRate: number;
	private _serialConnection: SerialPort;
	private _connected: boolean;
	private _connecting: boolean;
	private _error: string | null;

	constructor(painBox: PainBox, device: string, baudRate: number) {
		this._painBox = painBox;
		this._device = device;
		this._baudRate = baudRate;
		this._connecting = true;
		this._connected = false;
		this._error = null;

		this._serialConnection = new SerialPort({
			path: device,
			baudRate: baudRate
		});

		this._serialConnection.on('open', () => {
			console.log(`Connected to ${this._device}`);
			this._connecting = false;
			this._connected = true;
			this._painBox.events.emit(BackendEvents.CONNECTION_CHANGE);
			this.heartbeat();
			this._painBox.sendMessage(MessageType.SUCCESS, "Serial connection open");
		});

		this._serialConnection.on('close', () => {
			console.log('Serial port closed.');
			this._connecting = false;
			this._connected = false;
			this._painBox.events.emit(BackendEvents.CONNECTION_CHANGE);
			this._painBox.sendMessage(MessageType.ERROR, "Serial connection closed");
		});

		this._serialConnection.on('error', (error) => {
			console.error('Serial port error:', error);
			this._connecting = false;
			this._connected = false;
			this._error = error.message;
			this._painBox.events.emit(BackendEvents.CONNECTION_CHANGE);
			this._painBox.sendMessage(MessageType.ERROR, "Error occured in serial connection. " + error.message);
		});
	}

	disconnect() {
		if (!this.connected) {
			return;
		}

		this._serialConnection.close((err) => {
			if (err) {
				console.error('Error closing serial port:', err);
				this._connecting = false;
				this._connected = false;
				this._error = err.message;
				this._painBox.events.emit(BackendEvents.CONNECTION_CHANGE);
				this._painBox.sendMessage(MessageType.ERROR, "Error occured while closing connection. " + err.message);
			} else {
				console.log('Serial port closed.');
				this._connecting = false;
				this._connected = false;
				this._error = null;
				this._painBox.events.emit(BackendEvents.CONNECTION_CHANGE);
			}
		});
	}

	heartbeat() {
		if (!this.connected) {
			return;
		}

		this._serialConnection.write("HEARTBEAT\n", (error) => {
			if (error) {
				console.error('Error writing to serial port:', error);
			}
		});
	}

	shock() {
		if (!this.connected) {
			return;
		}

		this._serialConnection.write("SHOCK\n", (error) => {
			if (error) {
				console.error('Error writing to serial port:', error);
			}
		});
	}

	setDuration(duration: number) {
		if (!this.connected) {
			return;
		}

		this._serialConnection.write("SHOCK_DURATION\n" + duration, (error) => {
			if (error) {
				console.error('Error writing to serial port:', error);
			}
		});
	}

	get device() {
		return this._device;
	}

	get baudRate() {
		return this._baudRate;
	}

	get connected() {
		return this._connected;
	}

	get connecting() {
		return this._connecting;
	}

	get error() {
		return this._error;
	}
}