import { normalizePath, TFolder, Vault } from 'obsidian';
import * as _path from 'path';

export function pathJoin(dir: string, subpath: string): string {
    const result = _path.join(dir, subpath);
    // it seems that obsidian do not understand paths with backslashes in Windows, so turn them into forward slashes
    return normalizePath(result.replace(/\\/g, '/'));
}

export async function checkAndCreateFolder(vault: Vault, folderpath: string) {
    folderpath = normalizePath(folderpath);
    const folder = vault.getAbstractFileByPath(folderpath);
    if (folder && folder instanceof TFolder) {
        return;
    }
    await vault.createFolder(folderpath);
}
