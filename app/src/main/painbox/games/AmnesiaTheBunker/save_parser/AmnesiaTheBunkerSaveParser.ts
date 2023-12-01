import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as xml2js from 'xml2js';
import { XMLParser } from "fast-xml-parser";
import { stringToSHA256 } from "../../../../util";
import { AmnesiaTheBunkerSave } from "./AmnesiaTheBunkerSave";

export default class AmnesiaTheBunkerSaveParser {
	private static STATS_SUFFIX = "_user_stats.cfg";

	public static getGameDataFolder(): string {
		const documents = path.join(os.homedir(), 'Documents');
		const gameFolder = 'My Games/Amnesia The Bunker/Main';

		const gamePath = path.join(documents, gameFolder);

		return gamePath;
	}

	public static getSaveFiles(): string[] | null {
		const dataFolder = AmnesiaTheBunkerSaveParser.getGameDataFolder();
		//console.log(dataFolder);
		if (!fs.existsSync(dataFolder)) {
			return null;
		}

		const files = fs.readdirSync(dataFolder);

		return files.filter(f => f.toLowerCase().endsWith(AmnesiaTheBunkerSaveParser.STATS_SUFFIX)).map(f => path.join(dataFolder, f))
	}

	public static getSaveSlots(saveFile: string): string[] | null {
		if (!fs.existsSync(saveFile)) {
			return null;
		}

		const data = fs.readFileSync(saveFile, 'utf-8')

		const parser = new XMLParser({ ignoreAttributes: false });
		const parsed = parser.parse(data);

		return Object.keys(parsed).filter(k => k.startsWith("slot"));
	}

	public static getSaveSlotData(saveFile: string, saveSlot: string): AmnesiaTheBunkerSave | null {
		if (!fs.existsSync(saveFile)) {
			return null;
		}

		const textData = fs.readFileSync(saveFile, 'utf-8')

		const parser = new XMLParser({ ignoreAttributes: false });
		const parsed = parser.parse(textData);

		const saveData = parsed[saveSlot];

		if (saveData == null) {
			return null;
		}

		const hash = stringToSHA256(textData);

		const result: AmnesiaTheBunkerSave = {
			SaveFileHash: hash,
			LongestTimeBetweenSaves: parseFloat(saveData["@_LongestTimeBetweenSaves"]),
			NumberOfDeaths: parseInt(saveData["@_NumberOfDeaths"]),
			StalkerHitCount: parseInt(saveData["@_StalkerHitCount"]),
			TimePlayed: parseFloat(saveData["@_TimePlayed"]),
			TimesSaved: parseInt(saveData["@_TimesSaved"]),
			TimesSpottedByStalker: parseInt(saveData["@_TimesSpottedByStalker"]),
			Blackouts: parseInt(saveData["@_Blackouts"]),
			TrapsTriggered: parseInt(saveData["@_TrapsTriggered"])
		}

		return result;
	}
}