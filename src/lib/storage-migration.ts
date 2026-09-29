const legacyPrefix = "focura-";
const currentPrefix = "dev-cluster-";

export function migrateLegacyStorage() {
  const legacyKeys: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(legacyPrefix)) legacyKeys.push(key);
  }

  for (const legacyKey of legacyKeys) {
    const currentKey = `${currentPrefix}${legacyKey.slice(legacyPrefix.length)}`;
    if (window.localStorage.getItem(currentKey) !== null) continue;

    const value = window.localStorage.getItem(legacyKey);
    if (value === null) continue;

    window.localStorage.removeItem(legacyKey);
    try {
      window.localStorage.setItem(currentKey, value);
    } catch (error) {
      window.localStorage.setItem(legacyKey, value);
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        return;
      }
      throw error;
    }
  }
}