import {
	App,
	FileSystemAdapter
} from "obsidian";

import * as _path from 'path';
import * as fs from 'fs';

export default class NoteCreationService {
	app: App
	fileSystem: FileSystemAdapter

	//create constructor
	constructor( app: App) {
		this.app = app
	}

	//method to read a file from a provides path using NoteParser
	readFile(path: string) {
		console.error(path)
		let osPathString = '';
		//check if path is a valid path
		osPathString = _path.join(path, 'notes.txt');
		const file = fs.readFileSync(osPathString, 'utf8')
		//replace unicode character U+00a0 with a space
		return file.replace(/\u00a0/g, ' ');
	}

}
