export enum IPCAction {
	FRONTEND_REQUEST_DEVICES = "f:req_devices",
	BACKEND_DEVICE_LIST = "b:devices_resp",
	FRONTEND_CONNECT = "f:connect",
	FRONTEND_DISCONNECT = "d:disconnect",
	FRONTEND_REQUEST_CONNECTION_STATUS = "f_req_connection_stat",
	BACKEND_CONNECTION_STATUS = "b:connection_stat",
	FRONTEND_SHOCK = "f:shock",
	BACKEND_AMNESIA_THE_BUNKER_STATE = "b:atb:state",
	FRONTEND_REQUEST_AMNESIA_THE_BUNKER_STATE = "f:atb:req_state",
	FRONTEND_SET_AMNESIA_THE_BUNKER_SETTINGS = "f:atb:set_settings",
	BACKEND_MESSAGE = "b:message"
}