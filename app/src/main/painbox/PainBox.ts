import { SerialPort } from "serialport";
import DeviceInfo from "../../shared/DeviceInfo";
import { ipcMain } from "electron";
import { IPCAction } from "../../shared/IPCAction";
import SerialConnection from "./SerialConnection";
import EventEmitter from "events";
import { BackendEvents } from "./BackendEvents";
import ConnectionStateDTO from "../../shared/ConnectionStateDTO";
import express, { Express, Request, Response } from 'express';
import * as HTTP from 'http';
import * as Cors from "cors";
import AmnesiaTheBunkerSettingsDTO from "../../shared/AmnesiaTheBunkerSettingsDTO";
import AmnesiaTheBunkerBackend from "./games/AmnesiaTheBunker/AmnesiaTheBunkerBackend";
import { MessageType } from "../../shared/MessageType";
import MessageDTO from "../../shared/MessageDTO";

export default class PainBox {
	private _mainWindow?: Electron.BrowserWindow;
	private _devices: DeviceInfo[];
	private _connection: SerialConnection | null;
	private _events: EventEmitter;
	private _express: Express;
	private _http: HTTP.Server;
	private _amnesiaTheBunker: AmnesiaTheBunkerBackend;

	constructor() {
		const webServerPort = 8123;

		this._mainWindow = null;
		this._devices = [];
		this._connection = null;
		this._events = new EventEmitter();

		this._express = express();
		this._express.set("port", webServerPort);
		this._http = new HTTP.Server(this._express);

		this._amnesiaTheBunker = new AmnesiaTheBunkerBackend(this);

		this._express.use(Cors.default());

		this._express.post("/shock", async (req: Request, res: Response) => {
			if (this.shock()) {
				res.json({});
			} else {
				res.status(418).json({ message: "Serial connection not ready" });
			}
		});

		this._http.listen(webServerPort, (): void => {
			console.log("Web server listening on port " + webServerPort);
		});

		ipcMain.on('ipc-main', async (event, args) => {
			switch (args.action as IPCAction) {
				case IPCAction.FRONTEND_REQUEST_DEVICES:
					console.debug("Client request device list");
					event.reply('ipc-main', {
						action: IPCAction.BACKEND_DEVICE_LIST,
						data: this.devices
					});
					break;

				case IPCAction.FRONTEND_REQUEST_CONNECTION_STATUS:
					console.debug("Client request connection state");
					this.sendConnectionState();
					break;

				case IPCAction.FRONTEND_DISCONNECT:
					console.debug("Client request disconnect");
					if (this.connection != null) {
						this.connection.disconnect();
					}
					break;

				case IPCAction.FRONTEND_REQUEST_AMNESIA_THE_BUNKER_STATE:
					console.debug("Client request amnesia the bunker state");
					this._amnesiaTheBunker.sendState();
					break;

				case IPCAction.FRONTEND_SET_AMNESIA_THE_BUNKER_SETTINGS:
					const atbSettings = args.args as AmnesiaTheBunkerSettingsDTO;
					this._amnesiaTheBunker.enabled = atbSettings.enabled;
					this._amnesiaTheBunker.activeSave = atbSettings.save;
					this._amnesiaTheBunker.activeSlot = atbSettings.slot;

					break;

				case IPCAction.FRONTEND_CONNECT:
					const device = args.args.device as string;
					console.debug("Client request connection to " + device);

					if (this.connection != null) {
						if (this.connection.connecting || this.connection.connected) {
							console.error("Already connected");
							return;
						}
					}

					this._connection = new SerialConnection(this, device, 9600);
					this.events.emit(BackendEvents.CONNECTION_CHANGE);
					break;


				case IPCAction.FRONTEND_SHOCK:
					this.shock();
					break;

				default:
					console.log("Unknown action on ipc-main: " + args.action);
					break;
			}
		});

		this.events.on(BackendEvents.CONNECTION_CHANGE, () => { this.sendConnectionState() });

		setInterval(() => {
			this.tick();
		}, 500);
	}

	sendMessage(type: MessageType, message: string) {
		const data: MessageDTO = {
			message: message,
			type: type
		}
		this.sendIPCAction(IPCAction.BACKEND_MESSAGE, data);
	}

	shock(): boolean {
		if (this.connection != null) {
			if (this.connection.connected) {
				this.connection.shock();
				this.sendMessage(MessageType.SUCCESS, "Shocking user");
				return true;
			}
		}
		this.sendMessage(MessageType.ERROR, "Could not shock user since the serial connection is not ready");
		return false;
	}

	private sendConnectionState() {
		let connectionState: ConnectionStateDTO = {
			connecting: false,
			connected: false,
			error: null
		}
		if (this.connection != null) {
			connectionState = {
				connecting: this.connection.connecting,
				connected: this.connection.connected,
				error: this.connection.error,
			}
		}
		this.sendIPCAction(IPCAction.BACKEND_CONNECTION_STATUS, connectionState);
	}

	async tick() {
		if (this._connection != null) {
			this._connection.heartbeat();
		}

		this._amnesiaTheBunker.tick();
	}

	sendIPCAction(action: IPCAction, data: any = null) {
		if (this.mainWindow != null) {
			this.mainWindow.webContents.send("ipc-main", {
				action: action,
				data: data
			});
		}
	}

	async init() {
		await this.scanDeviceList();

		setInterval(() => {
			this.scanDeviceList();
		}, 500)
	}

	async scanDeviceList() {
		const ports = await SerialPort.list();
		const devices: DeviceInfo[] = [];
		ports.forEach(p => {
			let description = p.manufacturer;
			if ((p as any).friendlyName != null) {
				description = p.manufacturer + " - " + (p as any).friendlyName;
			}

			devices.push({
				name: p.path,
				description: description
			});
		});

		let changed = false;

		if (devices.length != this.devices.length) {
			changed = true;
		} else {
			devices.forEach(d => {
				if (this.devices.find(d2 => d2.description == d.description && d2.name == d.name) == null) {
					changed = true;
				}
			});
		}

		if (changed) {
			console.log("Device list changed");
			this.devices = devices;
		}
	}

	sendDeviceList() {
		this.sendIPCAction(IPCAction.BACKEND_DEVICE_LIST, this.devices);
	}

	get events() {
		return this._events;
	}

	get connection() {
		return this._connection;
	}

	get devices() {
		return this._devices;
	}

	set devices(devices: DeviceInfo[]) {
		this._devices = devices;
		this.sendDeviceList();
	}

	get mainWindow() {
		return this._mainWindow;
	}

	set mainWindow(mainWindow: Electron.BrowserWindow) {
		this._mainWindow = mainWindow;
	}
}