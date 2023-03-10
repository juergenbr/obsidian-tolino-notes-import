# Obsidian Plugin to import notes from a Tolino E-Reader

## Requirements
* Tolino E-Reader
* USB Cable

## Features
* Imports all notes stored on the Tolino. All notes for the same book are stored in a single Obsidian note
* Summorts bookmarks, notes and text markings
* Import notes into a specific folder
* Add tags to every imported note

## Usage
* Connect your Tolino to your Mac/PC via USB cable
* Copy the path to the root of your mounted Tolino (this is the place where you shoud see a notes.txt file).
Mac example: /Volumes/tolino, Windows example: W:\
* Open settings and set
	* local drive where Tolino is mounted
	* the Obsidian vault location where new notes should get imported
	* list of tags you want to apply to imported notes
* Open the command palette and execute **Tolino notes import Plugin: Load Tolino Notes** 

## Current restrictions
* Only supports Tolinos with language set to German

## Additional info
* Tested on Mac OS and Windows
