export class PresetManager {
  constructor() {
    this.customPresets = this.loadPresets();
  }

  // Load custom presets from local storage
  loadCustomPresets() {
    const stored = localStorage.getItem("ambientSoundMixerPresets");
    return stored ? JSON.parse(stored) : {};
  }

  // Save custom presets to local storage
  saveCustomPresets() {
    localStorage.setItem(
      "ambientSoundMixerPresets",
      JSON.stringify(this.customPresets),
    );
  }

  // Save a new custom preset
  savePreset(name, soundState) {
    const presetId = `custom-${Date.now()}`;
    const preset = {
      name,
      sounds: {},
    };
    // Include only the active sounds of the soundState
    for (const [soundId, volume] of Object.entries(soundState)) {
      if (volume > 0) {
        preset.sounds[soundId] = volume;
      }
    }
    this.customPresets[presetId] = preset;
    this.saveCustomPresets();

    return presetId;
  }

  // Check to see if a name for a preset already exists
  presetNameExists(name) {
    return Object.values(this.customPresets).some(
      (preset) => preset.name === name,
    );
  }
}
