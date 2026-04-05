import { sounds, defaultPresets } from "./soundData.js";
import { SoundManager } from "./soundManager.js";
import { UI } from "./ui.js";

class AmbientMixer {
  // Initialize dependencies and default state
  constructor() {
    this.soundManager = new SoundManager();
    this.ui = new UI();
    this.presetManager = null;
    this.timer = null;
    this.currentSoundState = {};
    this.isInitialized = false;
  }

  init() {
    try {
      // Initialize UI
      this.ui.init();
      // Render sound cards using our sound data
      this.ui.renderSoundCards(sounds);

      this.setUpEventListeners();
      // Load all sound files
      this.loadAllSounds();
      this.isInitialized = true;
    } catch (error) {
      console.log("Failed to initialize app:", error);
    }
  }

  // Set up all event listeners
  setUpEventListeners() {
    // Handle all clicks with event delegation
    document.addEventListener("click", async (e) => {
      if (e.target.closest(".play-btn")) {
        const soundId = e.target.closest(".play-btn").dataset.sound;
        await this.toggleSound(soundId);
      }
    });
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

  // Toggle individual sound
  async toggleSound(soundId) {
    const audio = this.soundManager.audioElements.get(soundId);
    if (!audio) {
      console.error(`Sound ${soundId} not found...`);
      return false;
    }
    if (audio.paused) {
      this.soundManager.setVolume(soundId, 50);
      await this.soundManager.playSound(soundId);
      this.ui.updateSoundPlayButton(soundId, true);
    } else {
      this.soundManager.pauseSound(soundId);
      this.ui.updateSoundPlayButton(soundId, false);
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new AmbientMixer();
  app.init();
});
