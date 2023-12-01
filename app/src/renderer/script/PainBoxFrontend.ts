import EventEmitter from "events";
import { IPCAction } from "../../shared/IPCAction";
import DeviceInfo from "../../shared/DeviceInfo";
import { Events } from "../../shared/Events";
import ConnectionStateDTO from "../../shared/ConnectionStateDTO";
import AmnesiaTheBunketStateDTO, { createEmptyAmnesiaTheBunketStateDTO } from "../../shared/AmnesiaTheBunkerStateDTO";
import AmnesiaTheBunkerSettingsDTO from "../../shared/AmnesiaTheBunkerSettingsDTO";
import MessageDTO from "../../shared/MessageDTO";
import { MessageType } from "../../shared/MessageType";
import toast from "react-hot-toast";

export default class PainBoxFrontend {
	private _devices: DeviceInfo[];
	private _events: EventEmitter;
	private _connectionStatus: ConnectionStateDTO;
	private _amnesiaTheBunkerState: AmnesiaTheBunketStateDTO;

	constructor() {
		this._devices = [];
		this._events = new EventEmitter();
		this._connectionStatus = {
			connected: false,
			connecting: false,
			error: null
		}
		this._amnesiaTheBunkerState = createEmptyAmnesiaTheBunketStateDTO();

		window.electron.ipcRenderer.on("ipc-main", (args: any) => {
			switch (args.action as IPCAction) {
				case IPCAction.BACKEND_DEVICE_LIST:
					this.devices = args.data as DeviceInfo[];
					console.log("Received device list: " + JSON.stringify(this.devices));
					break;

				case IPCAction.BACKEND_CONNECTION_STATUS:
					this.connectionStatus = args.data as ConnectionStateDTO;
					console.log("Received connection status: " + JSON.stringify(this.connectionStatus));
					break;

				case IPCAction.BACKEND_AMNESIA_THE_BUNKER_STATE:
					this.amnesiaTheBunkerState = args.data as AmnesiaTheBunketStateDTO;
					console.log("Received connection status: " + JSON.stringify(this.connectionStatus));
					break;

				case IPCAction.BACKEND_MESSAGE:
					const messageData = args.data as MessageDTO;
					switch (messageData.type) {
						case MessageType.SUCCESS:
							console.log(messageData.message);
							toast.success(messageData.message);
							break;

						case MessageType.ERROR:
							console.error(messageData.message);
							toast.error(messageData.message);
							break;

						default:
							console.error("Invalid message type: " + messageData.type);
							break;
					}
					break;

				default:
					console.log("Unknown action on ipc-main: " + args.action);
					break;
			}
		});
	}

	requestDeviceList() {
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_REQUEST_DEVICES
		});
	}

	requestConnectionStatus() {
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_REQUEST_CONNECTION_STATUS
		});
	}

	requestAmnesiaTheBunkerState() {
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_REQUEST_AMNESIA_THE_BUNKER_STATE
		});
	}

	connect(device: string) {
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_CONNECT,
			args: {
				device: device
			}
		});
	}

	disconnect() {
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_DISCONNECT
		});
	}

	shock() {
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_SHOCK
		});
	}

	setAmnesiaTheBunkerSettings(settings: AmnesiaTheBunkerSettingsDTO) {
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_SET_AMNESIA_THE_BUNKER_SETTINGS,
			args: settings
		});
	}

	async init() {
		this.requestDeviceList();
		this.requestConnectionStatus();
		this.requestAmnesiaTheBunkerState();
	}

	get connectionStatus() {
		return this._connectionStatus;
	}

	set connectionStatus(connectionStatus: ConnectionStateDTO) {
		this._connectionStatus = connectionStatus;
		this.events.emit(Events.CONNECTION_STATE_CHANGE, this.connectionStatus);
	}

	get amnesiaTheBunkerState() {
		return this._amnesiaTheBunkerState;
	}

	set amnesiaTheBunkerState(state: AmnesiaTheBunketStateDTO) {
		this._amnesiaTheBunkerState = state;
		this.events.emit(Events.AMNESIA_THE_BUNKER_CHANGE, this.amnesiaTheBunkerState);
	}

	set devices(devices: DeviceInfo[]) {
		this._devices = devices;
		this.events.emit(Events.DEVICE_LIST_UPDATE, this.devices);
	}

	get devices() {
		return this._devices;
	}

	get events() {
		return this._events;
	}
}