/*
Copyright © 2023 小兽兽/zhiyan114 (github.com/zhiyan114)
File is licensed respectively under the terms of the Apache License 2.0
or whichever license the project is using at the time https://github.com/Sayrix/Ticket-Bot/blob/main/LICENSE
*/

import path from "node:path";
import fs from "fs-extra";

export class Translation {
    private primaryData: {[k: string]: string | undefined};
    private backupData?: {[k: string]: string | undefined};

    /**
     * locale handler module
     * @param optName The locale file name (w/o extension)
     * @param dir The directory of the locale files
     */
    constructor(optName: string, dir?: string) {
        dir = dir ?? "./locale";
        const fullDir = path.join(dir, `${optName}.json`);
        if(!fs.existsSync(fullDir))
            throw new TranslationError("Translation file not found, check your config to verify if the name is correct or not");

        this.primaryData = JSON.parse(fullDir);
        if(optName !== "main")
            this.backupData = JSON.parse(path.join(dir, "main.json"));
    }

    /**
     * Get the translation value or backup value if it doesn't exist
     * @param key The object key the translation should pull
     * @returns the translation data or throw error if the translation data cannot be found at all
     */
    getValue(key: string): string {
        // Try return the data from the main translation file
        const main = this.primaryData[key];
        if(main) return main;

        // Pull backup and throw error if it doesn't exist
        const backup = this.backupData && this.backupData[key];
        if(!backup)
            throw new TranslationError(`TRANSLATION: Key '${key}' failed to pull backup translation. This indiciates this key data does not exist at all.`);
        
        // Return the backup translation
        console.warn(`TRANSLATION: Key '${key}' is missing translation. If you can, please help fill in the translation and make PR for it.`);
        return backup;
        

    }
}

export class TranslationError {
    name: string = "TranslationError";
    message: string;
    constructor(msg: string) {
        this.message = msg;
    }
}