import { App, Modal, normalizePath } from "obsidian";
import * as os from "os";

import NoteCreationService from "./NoteCreationService";
import PluginSettings from "./PluginSettings";
import NoteParser from "./NoteParser";
import TolinoNoteModel from "./TolinoNoteModel";
import { normalizeFilename, checkAndCreateFolder } from "./FileUtils";
import * as _path from "path";

export default class ImportModal extends Modal {
	noteCreationService: NoteCreationService;
	tolinoPath: string;
	notesPath: string;
	noteTags : string
	settings: PluginSettings;
	noteParser: NoteParser;

	constructor(app: App, settings: PluginSettings) {
		super(app);
		this.noteCreationService = new NoteCreationService(app);
		this.settings = settings;
		console.log(this.settings.tolinoDriveSetting);
		this.tolinoPath = this.settings.tolinoDriveSetting;
		this.notesPath = this.settings.notesPathSetting;
		this.noteTags = this.settings.tagsSetting;
	}

	onOpen() {
		const file = this.noteCreationService.readFile(this.tolinoPath);
		const tolinoNotes = NoteParser.parseNoteFile(file, "de");

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
			console.log("Writing file " + fileName);
			fileName = normalizeFilename(fileName) + ".md";
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
}
