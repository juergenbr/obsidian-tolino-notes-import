import { App, Modal, normalizePath } from "obsidian";
import * as os from "os";
import PluginSettings from "./TolinoNoteImportPluginSettings";
import NoteParser from "./NoteParser";
import TolinoNoteModel from "./TolinoNoteModel";
import { checkAndCreateFolder } from "./FileUtils";
import * as _path from "path";
import * as fs from 'fs';

export default class ImportModal extends Modal {
	tolinoPath: string;
	notesPath: string;
	noteTags : string
	settings: PluginSettings;
	noteParser: NoteParser;

	constructor(app: App, settings: PluginSettings) {
		super(app);
		this.settings = settings;
		console.log("Parsing notes now...")
		this.tolinoPath = this.settings.tolinoDriveSetting;
		this.notesPath = this.settings.notesPathSetting;
		this.noteTags = this.settings.tagsSetting;
	}

	onOpen() {
		const file = this.readFile(this.tolinoPath);
		const tolinoNotes = NoteParser.parseNoteFile(file);
		// create a new array containing one element for each book
		const uniqueBooks = this.removeDuplicates(tolinoNotes);
		// create new notes in vault
		uniqueBooks.forEach(async (note) => {
			// create book files
			this.writeFile(note.bookName, note.noteText);
		});
		const {contentEl} = this;
		contentEl.setText('Tolino Notes loaded!');
	}

	removeDuplicates(notes: TolinoNoteModel[]) {
		const uniqueTitles = new Set();
		const uniqueBooks: TolinoNoteModel[] = [];

		notes.forEach((note) => {
			if (!uniqueTitles.has(note.bookName)) {
				uniqueTitles.add(note.bookName);
				const newNote : TolinoNoteModel = new TolinoNoteModel();
				newNote.bookName = note.bookName;
				newNote.noteText = "Tags: " + this.noteTags + os.EOL + os.EOL +  "---" + os.EOL;
				newNote.noteText += "**Seite " + note.page + "**" + ", Erstellt am " + note.date + " " + note.time + os.EOL + note.noteText + os.EOL + "---" + os.EOL;
				uniqueBooks.push(newNote);
			}
			else{
				const bookNote = uniqueBooks.find((existingNote) => existingNote.bookName === note.bookName)
				if(bookNote){
					bookNote.noteText += "**Seite " + note.page + "**" + ", Erstellt am " + note.date + " " + note.time + os.EOL + note.noteText + os.EOL + "---" + os.EOL;
					uniqueBooks.push(bookNote)
				}
			}
		});
		return uniqueBooks;
	}

	async writeFile(fileName: string, content: string): Promise<void> {
		let filePath: string;
		if (fileName !== null && fileName !== undefined) {
			fileName = normalizePath(fileName) + ".md";
			await checkAndCreateFolder(this.app.vault, this.notesPath);

			if (this.notesPath) {
				filePath = normalizePath(_path.join(this.notesPath, fileName));
			} else {
				filePath = normalizePath(
					_path.join(this.app.vault.getRoot().path, fileName)
				);
			}

			await this.app.vault.create(filePath, content);
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
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
