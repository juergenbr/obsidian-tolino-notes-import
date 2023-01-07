import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

import ImportModal from "src/ImportModal";
import TolinoNoteImportPluginSettings from "src/TolinoNoteImportPluginSettings";

// Remember to rename these classes and interfaces!

const DEFAULT_SETTINGS: TolinoNoteImportPluginSettings = {
	tolinoDriveSetting: "/Volumes/tolino",
	notesPathSetting: "/",
	tagsSetting: "#readinglist/read"
};

export default class TolinoNoteImportPlugin extends Plugin {
	settings: TolinoNoteImportPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Tolino notes importer loaded!");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "load-notes",
			name: "Load Tolino Notes",
			callback: () => {
				new ImportModal(this.app, this.settings).open();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TolinoNotesImportSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class TolinoNotesImportSettingTab extends PluginSettingTab {
	plugin: TolinoNoteImportPlugin;

	constructor(app: App, plugin: TolinoNoteImportPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", {
			text: "Settings for importing Tolino notes.",
		});

		new Setting(containerEl)
			.setName("Tolino drive path")
			.setDesc("Drive where Tolino USB Drive is mounted")
			.addText((text) =>
				text
					.setPlaceholder(
						"Enter Tolino drive path (MacOS: /Volumes/tolino, Windows: X:\\)"
					)
					.setValue(this.plugin.settings.tolinoDriveSetting)
					.onChange(async (value) => {
						this.plugin.settings.tolinoDriveSetting = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Obsidian notes folder")
			.setDesc("Folder into which new Book notes will be created")
			.addText((text) =>
				text
					.setPlaceholder("Enter Notes folder path")
					.setValue(this.plugin.settings.notesPathSetting)
					.onChange(async (value) => {
						this.plugin.settings.notesPathSetting = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Tags for imported notes")
			.setDesc("Tags to add at the top of each book note file")
			.addText((text) =>
				text
					.setPlaceholder("Enter tags separated by comma")
					.setValue(this.plugin.settings.tagsSetting)
					.onChange(async (value) => {
						this.plugin.settings.tagsSetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
