import TolinoNoteModel from "./TolinoNoteModel";
import * as os from "os";

export default class NoteParser {

	// array constant with 3 strings
	static readonly languages = ["de", "en", "fr"];

	// array constant with 3 strings containing the beginning of the strings for notes, marks and bookmarks
	static readonly noteTypes_de = ["Notiz", "Markierung", "Lesezeichen"];
	static readonly noteTypes_en = ["Note", "Highlight", "Bookmark"];
	static readonly prefix_de = " auf Seite";
	static readonly prefix_en = " on page";
	// extract page number based on format: start with one of the words in NoteTypes_de, followed by prefix_de, followed by a number or two numbers separated by "-"
	static readonly pagenumber_regex_de = new RegExp(
		"^(" +
		this.noteTypes_de.join("|") +
		")" +
		this.prefix_de +
		"\\s(\\d+(-\\d+)?)"
	);
	static readonly pagenumber_regex_en = new RegExp(
		"^(" +
		this.noteTypes_en.join("|") +
		")" +
		this.prefix_en +
		"\\s(\\d+(-\\d+)?)"
	);
	static parseNoteFile(file: string): TolinoNoteModel[] {
		// init result array
		console.log("parseNoteFile")
		const tolinoNotes: TolinoNoteModel[] = [];
		const lines = file.split("-----------------------------------");
		for (const line of lines) {
			tolinoNotes.push(this.parseNote(line));
		}
		return tolinoNotes;
	}


	static parseNote(note: string): TolinoNoteModel {
		console.log("parseNote")
		const language = NoteParser.checkLanguage(note);
		if (language === "de") {
			console.log("Parsing German note");
			return NoteParser.parseGermanNote(note);
		}
		else if (language === "en") {
			console.log("Parsing English note");
			return NoteParser.parseEnglishNote(note);
		}
		else {
			return new TolinoNoteModel();
		}
	}

	static checkLanguage(note: string): string {
		console.log("checkLanguage")
		// if note string starts with one of the entries in noteTypes_de
		if (note.contains(this.noteTypes_de[0] + this.prefix_de) || note.contains(this.noteTypes_de[1] + this.prefix_de) || note.contains(this.noteTypes_de[2] + this.prefix_de)) {
			console.log("German note detected");
			return "de";
		}
		//same for english
		else if (note.contains(this.noteTypes_en[0] + this.prefix_en) || note.contains(this.noteTypes_en[1] + this.prefix_en) || note.contains(this.noteTypes_en[2] + this.prefix_en)) {
			console.log("English note detected");
			return "en";
		}
		else {
			console.warn("Unknown language");
			console.log(note);
			return "-";
		}
	}

	static parseGermanNote(note: string): TolinoNoteModel {
		console.log("parseGermanNote:" + note)
		const tolinoNote = new TolinoNoteModel();
		tolinoNote.noteText = "";
		// split note string into lines
		const lines = note.split(/\r?\n/);
		let lineNumber = 0;
		const cleanedLines = this.cleanEmptyLines(lines);
		for (const line of cleanedLines) {
			// parse book name based on the first line
			if (lineNumber === 0) {
				tolinoNote.bookName = this.parseBookName(line);
				// parse note information
			} else if (lineNumber > 0 && lineNumber < cleanedLines.length - 1) {
				const tempNote = this.parseGermanNoteLine(line.trim());
				if (tempNote.page) {
					tolinoNote.page = tempNote.page;
				}
				tolinoNote.noteText += tempNote.noteText + os.EOL;
				// parse date and time
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

	// parse english note
	static parseEnglishNote(note: string): TolinoNoteModel {
		console.log("parseEnglishNote:" + note)
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
				const tempNote = this.parseEnglishNoteLine(line.trim());
				if (tempNote.page) {
					tolinoNote.page = tempNote.page;
				}
				tolinoNote.noteText += tempNote.noteText + os.EOL;
			} else if (lineNumber === cleanedLines.length - 1) {
				const dateTimeString = line.substring(9);
				const dateTime = dateTimeString.split("|");
				tolinoNote.date = dateTime[0].trim();
				// transform date into german format
				const dateArray = tolinoNote.date.split("/");
				tolinoNote.date = dateArray[1] + "." + dateArray[0] + "." + dateArray[2];
				tolinoNote.time = dateTime[1].trim();
			}
			lineNumber++;
		}
		return tolinoNote;
	}

	static cleanEmptyLines(lines: string[]): string[] {
		console.log("cleanEmptyLines")
		const cleanedLines: string[] = [];
		for (const line of lines) {
			if (line.length > 0) {
				cleanedLines.push(line);
			}
		}
		return cleanedLines;
	}

	static parseBookName(line: string): string {
		console.log("parseBookName: " + line)
		// return the line
		return line;
	}

	static parseGermanNoteLine(line: string): TolinoNoteModel {
		console.log("parseGermanNoteLine: " + line)
		// check if line starts with "Markierung auf Seite" or "Lesezeichen auf Seite 210", split by ':' if true and return the second part. Otherwise return the line
		const tolinoNote = new TolinoNoteModel();
		const regex = /:\s/;
		if ( //if line starts with one of the entries in noteTypes_de
			line.startsWith(this.noteTypes_de[0]) ||
			line.startsWith(this.noteTypes_de[1]) ||
			line.startsWith(this.noteTypes_de[2])
		) {
			tolinoNote.page = this.extractGermanPageNumber(line);
			const matchArray = line.split(regex);
			// if the array has more than 2 elements, join the array from the second element on
			if (matchArray.length > 2) {
				tolinoNote.noteText = matchArray.slice(1).join(": ");
			}
			else
				tolinoNote.noteText = line.split(regex)[1];
		} else {
			tolinoNote.noteText = line;
		}
		return tolinoNote;
	}

	// parse english note line
	static parseEnglishNoteLine(line: string): TolinoNoteModel {
		console.log("parseEnglishNoteLine: " + line)
		// check if line starts with "Markierung auf Seite" or "Lesezeichen auf Seite 210", split by ':' if true and return the second part. Otherwise return the line
		const tolinoNote = new TolinoNoteModel();
		// regex that extracts the "Test: das ist ein Test" from a string exmaple like this "Note on page 119: Test: das ist ein test" 
		const regex = /:\s/;
		if (
			line.startsWith(this.noteTypes_en[0]) ||
			line.startsWith(this.noteTypes_en[1]) ||
			line.startsWith(this.noteTypes_en[2])
		) {
			tolinoNote.page = this.extractEnglishPageNumber(line);
			const matchArray = line.split(regex);
			// if the array has more than 2 elements, join the array from the second element on
			if (matchArray.length > 2) {
				tolinoNote.noteText = matchArray.slice(1).join(": ");
			}
			else
				tolinoNote.noteText = line.split(regex)[1];
		} else {
			tolinoNote.noteText = line;
		}
		return tolinoNote;
	}

	static extractGermanNoteText(line: string): string {
		console.log("extractNoteText: " + line)
		// check if line starts with "Markierung auf Seite 1" or "Lesezeichen auf Seite 210", split by ':' if true and return the second part. Otherwise return the line, and consider that the notetext can contain ':' as well
		const regex = /:\s/;
		if (
			line.startsWith(this.noteTypes_de[0]) ||
			line.startsWith(this.noteTypes_de[1]) ||
			line.startsWith(this.noteTypes_de[2])
		) {
			return line.split(regex)[1];
		} else {
			return line;
		}
	}

	// extract english note text
	static extractEnglishNoteText(line: string): string {
		console.log("extractNoteText: " + line)
		// check if line starts with "Highlight on page 1" or "Bookmark on page 23", split by ':' if true and return the second part. Otherwise return the line, and consider that the notetext can contain ':' as well
		const regex = /:\s/;
		if (
			line.startsWith(this.noteTypes_en[0]) ||
			line.startsWith(this.noteTypes_en[1]) ||
			line.startsWith(this.noteTypes_en[2])
		) {
			return line.split(regex)[1];
		} else {
			return line;
		}
	}


	static extractGermanPageNumber(line: string): string {
		console.log("extractGermanPageNumber: " + line)
		const match = this.pagenumber_regex_de.exec(line);
		if (match && match[2]) {
			// convert string page to number and return
			return match[2];
		} else {
			// return some default value or throw an error if no page number is found
			console.warn("No page number found");
			return "?";
		}
	}

	// extract english page number
	static extractEnglishPageNumber(line: string): string {
		console.log("extractEnglishPageNumber: " + line)
		const match = this.pagenumber_regex_en.exec(line);
		console.log(match);
		if (match && match[2]) {
			// convert string page to number and return
			return match[2];
		} else {
			// return some default value or throw an error if no page number is found
			console.warn("No page number found");
			return "?";
		}
	}

}
