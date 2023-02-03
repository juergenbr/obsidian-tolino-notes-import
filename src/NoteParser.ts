import TolinoNoteModel from "./TolinoNoteModel";
import * as os from "os";

export default class NoteParser {
	static parseNoteFile(file: string): TolinoNoteModel[] {
		// init result array
		const tolinoNotes: TolinoNoteModel[] = [];
		const lines = file.split("-----------------------------------");
		for (const line of lines) {
				tolinoNotes.push(this.parseNote(line));
		}
		return tolinoNotes;
	}

	static parseNote(note: string): TolinoNoteModel {
		const language = NoteParser.checkLanguage(note);
		if(language === "de"){
			return NoteParser.parseGermanNote(note);
		}
		else{
			return new TolinoNoteModel();
		}
	}

	static checkLanguage(note: string): string {
		if (note.includes("Markierung auf Seite") || note.includes("Lesezeichen auf Seite") || note.includes("Notiz auf Seite")) {
			return "de";
		}
		else {
			return "en";
		}
	}

	static parseGermanNote(note: string): TolinoNoteModel {
		const tolinoNote = new TolinoNoteModel();
		tolinoNote.noteText = "";
		const lines = note.split(/\r?\n/);
		let lineNumber = 0;
		const cleanedLines = this.cleanEmptyLines(lines);
		for (const line of cleanedLines) {
			if (lineNumber === 0) {
				tolinoNote.bookName = this.parseBookName(line);
			} else if (lineNumber > 0 && lineNumber < cleanedLines.length - 1) {
				// extract page number based on format: "Markierung auf Seite 51:"
				const tempNote = this.parseNoteLine(line.trim());
				if (tempNote.page) {
					tolinoNote.page = tempNote.page;
				}
				tolinoNote.noteText += tempNote.noteText + os.EOL;
			} else if (lineNumber === cleanedLines.length - 1) {
				// parse date and time based on the format: "Hinzugefügt am 16.01.2019 | 22:52"
				const dateTimeString = line.substring(15);
				const dateTime = dateTimeString.split("|");
				tolinoNote.date = dateTime[0].trim();
				tolinoNote.time = dateTime[1].trim();
			}
			lineNumber++;
		}
		return tolinoNote;
	}

	static cleanEmptyLines(lines: string[]): string[] {
		const cleanedLines: string[] = [];
		for (const line of lines) {
			if (line.length > 0) {
				cleanedLines.push(line);
			}
		}
		return cleanedLines;
	}

	static parseBookName(line: string): string {
		// return the line
		return line;
	}

	static parseNoteLine(line: string): TolinoNoteModel {
		// check if line starts with "Markierung auf Seite" or "Lesezeichen auf Seite 210", split by ':' if true and return the second part. Otherwise return the line
		const tolinoNote = new TolinoNoteModel();
		if (
			line.startsWith("Markierung auf Seite") ||
			line.startsWith("Lesezeichen auf Seite") ||
			line.startsWith("Notiz auf Seite")
		) {
			tolinoNote.page = this.extractPageNumber(line);
			tolinoNote.noteText = line.split(":")[1];
		} else {
			tolinoNote.noteText = line;
		}
		return tolinoNote;
	}

	static extractPageNumber(line: string): string {
		// extract page number based on format: "Markierung auf Seite 51:" or "Lesezeichen auf Seite 210", page number can be up to 4 digits
		const pageString = line.split(":")[0];
		const page = pageString.split(" ")[3];
		//convert string page to number
		return page;
	}
}
