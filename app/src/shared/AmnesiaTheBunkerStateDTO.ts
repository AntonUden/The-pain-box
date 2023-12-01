import { AmnesiaTheBunkerSave } from "../main/painbox/games/AmnesiaTheBunker/save_parser/AmnesiaTheBunkerSave";

export default interface AmnesiaTheBunketStateDTO {
	enabled: boolean,
	saves: string[],
	slots: string[],
	active_save: string,
	active_slot: string,
	data?: AmnesiaTheBunkerSave
}

export function createEmptyAmnesiaTheBunketStateDTO(): AmnesiaTheBunketStateDTO {
	return {
		active_save: "",
		active_slot: "",
		saves: [],
		slots: [],
		enabled: false,
		data: null
	}
}