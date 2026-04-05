import { sounds, defaultPresets } from "./soundData.js";
import { SoundManager } from "./soundManager.js";

class AmbientMixer {
  // Initialize dependencies and default state
  constructor() {
    this.soundManager = new SoundManager();
    this.ui = null;
    this.presetManager = null;
    this.timer = null;
    this.currentSoundState = {};
    this.isInitialized = false;
  }

  init() {
    try {
      // Load all sound files
      this.loadAllSounds();
      this.isInitialized = true;
    } catch (error) {
      console.log("Failed to initialize app:", error);
    }
  }

  // Load all sound files from the sounds array
  loadAllSounds() {
    sounds.forEach((sound) => {
      const success = this.soundManager.loadSound(
        sound.id,
        `audio/${sound.file}`,
      );
      if (!success) {
        console.warn(
          `Could not load sound: ${sound.name} from audio/${sound.file}`,
        );
      }
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new AmbientMixer();
  app.init();
});
