import { normalizePath, TFolder, Vault } from 'obsidian';
import * as _path from 'path';

export function normalizeFilename(fileName: string): string {
    const illegalSymbols = [':', '#', '/', '\\', '|', '?', '*', '<', '>', '"'];
    if (illegalSymbols.some((el) => fileName.contains(el))) {
        illegalSymbols.forEach((ilSymbol) => {
            fileName = fileName.replace(ilSymbol, '');
        });

        return fileName;
    } else {
        return fileName;
    }
}

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
