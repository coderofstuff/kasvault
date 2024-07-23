class SettingsStore {
    storageKey: string;
    settings: Object;
    constructor(storageKey: string) {
        this.storageKey = `kasvault:${storageKey}`;

        const storedSettings: string = localStorage.getItem(this.storageKey);

        if (storedSettings) {
            this.settings = JSON.parse(storedSettings);
        } else {
            this.settings = {
                receiveAddresses: {},
                lastReceiveIndex: -1,
                changeAddresses: {},
                lastChangeIndex: -1,
                version: 0,
            };
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        }
    }

    setSetting(property, value) {
        this.settings[property] = value;
        localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    }

    getSetting(property) {
        return this.settings[property];
    }
}

export default SettingsStore;
