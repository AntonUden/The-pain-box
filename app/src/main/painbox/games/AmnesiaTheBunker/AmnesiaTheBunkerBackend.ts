import AmnesiaTheBunketStateDTO from "../../../../shared/AmnesiaTheBunkerStateDTO";
import { IPCAction } from "../../../../shared/IPCAction";
import { arraysHaveSameContent } from "../../../util";
import PainBox from "../../PainBox";
import { AmnesiaTheBunkerSave } from "./save_parser/AmnesiaTheBunkerSave";
import AmnesiaTheBunkerSaveParser from "./save_parser/AmnesiaTheBunkerSaveParser";
import _ from 'lodash';

export default class AmnesiaTheBunkerBackend {
	private _painBox: PainBox;
	private _enabled: boolean;
	private _lastSaveData?: AmnesiaTheBunkerSave;
	private _saveName: string;
	private _saveSlot: string;
	private _availableSaves: string[];
	private _avaiableSlots: string[];
	private _lastDeathCount: number;

	constructor(painBox: PainBox) {
		this._painBox = painBox;

		this._enabled = false;
		this._lastSaveData = null;
		this._saveName = "";
		this._saveSlot = "";
		this._lastDeathCount = Number.MAX_SAFE_INTEGER;
		this._availableSaves = [];
		this._avaiableSlots = [];
	}

	tick() {
		let changed = false;

		const newAvailableSaves = AmnesiaTheBunkerSaveParser.getSaveFiles();

		if (!arraysHaveSameContent(newAvailableSaves, this._availableSaves)) {
			this._availableSaves = newAvailableSaves;
			changed = true;
		}

		if (this._saveName.trim() != "") {
			if (this._availableSaves.includes(this._saveName)) {
				const slots = AmnesiaTheBunkerSaveParser.getSaveSlots(this._saveName);
				if (slots != null) {
					if (!arraysHaveSameContent(slots, this._avaiableSlots)) {
						if (!slots.includes(this._saveSlot)) {
							this._saveSlot = "";
						}
						this._avaiableSlots = slots;
						changed = true;
					}
				}
			}
		}

		if (this.enabled) {
			if (this._saveName.trim() != "" && this._saveSlot.trim() != "") {
				if (this._availableSaves.includes(this._saveName)) {
					if (this._avaiableSlots.includes(this._saveSlot)) {
						const data = AmnesiaTheBunkerSaveParser.getSaveSlotData(this._saveName, this._saveSlot);
						if (this._lastSaveData == null || !_.isEqual(data, this._lastSaveData)) {
							this._lastSaveData = data;
							//console.log(data);
							changed = true;
						}
					}
				}
			}

			if(this._lastSaveData != null) {
				const lastDeaths = this._lastDeathCount;
				if(lastDeaths != this._lastSaveData.NumberOfDeaths) {
					this._lastDeathCount = this._lastSaveData.NumberOfDeaths;
					if(lastDeaths < this._lastDeathCount) {
						// RIP o7
						this._painBox.shock();
					}
				}
			}


		}

		if (changed) {
			console.log("Amnesia the bunker manager state changed during tick");
			this.sendState();
		}
	}

	get activeSave() {
		return this._saveName;
	}

	set activeSave(save: string) {
		if (this._saveName != save) {
			this._lastSaveData = null;
			this._saveName = save;
			this._lastDeathCount = Number.MAX_SAFE_INTEGER;
			this.sendState();
		}
	}

	get activeSlot() {
		return this._saveSlot;
	}

	set activeSlot(slot: string) {
		if (this._saveSlot != slot) {
			this._lastSaveData = null;
			this._saveSlot = slot;
			this._lastDeathCount = Number.MAX_SAFE_INTEGER;
			this.sendState();
		}
	}

	get enabled() {
		return this._enabled;
	}

	set enabled(enabled: boolean) {
		if (this._enabled != enabled) {
			console.log("Changing amnesia the bunker status to " + enabled);
			this._lastDeathCount = Number.MAX_SAFE_INTEGER;
			this._enabled = enabled;
			if(!enabled) {
				this._lastSaveData = null;
			}
			this.sendState();
		}
	}

	get state(): AmnesiaTheBunketStateDTO {
		return {
			enabled: this._enabled,
			saves: this._availableSaves,
			slots: this._avaiableSlots,
			active_save: this._saveName,
			active_slot: this._saveSlot,
			data: this._lastSaveData,
		}
	}

	public sendState() {
		const data = this.state;
		this._painBox.sendIPCAction(IPCAction.BACKEND_AMNESIA_THE_BUNKER_STATE, data);
	}
}