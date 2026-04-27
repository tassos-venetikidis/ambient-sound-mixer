import { PresetManager } from "./presetManager.js";
import { sounds, defaultPresets } from "./soundData.js";
import { SoundManager } from "./soundManager.js";
import { UI } from "./ui.js";
import { Timer } from "./timer.js";

class AmbientMixer {
  // Initialize dependencies and default state
  constructor() {
    this.soundManager = new SoundManager();
    this.ui = new UI();
    this.presetManager = new PresetManager();
    this.timer = new Timer(
      () => this.onTimerComplete(),
      (minutes, seconds) => this.ui.updateTimerDisplay(minutes, seconds),
    );
    this.currentSoundState = {};
    this.masterVolume = 50;
    this.isInitialized = false;
  }

  init() {
    try {
      // Initialize UI
      this.ui.init();
      // Render sound cards using our sound data
      this.ui.renderSoundCards(sounds);

      this.ui.renderCustomPresetButtons(this.presetManager.customPresets);

      this.setUpEventListeners();
      // Load all sound files
      this.loadAllSounds();

      // Initialize sound states after loading sounds
      sounds.forEach((sound) => {
        this.currentSoundState[sound.id] = 0;
      });
      this.isInitialized = true;
    } catch (error) {
      console.log("Failed to initialize app:", error);
    }
  }

  // Set up all event listeners
  setUpEventListeners() {
    // Handle all clicks with event delegation
    document.addEventListener("click", async (e) => {
      // Handle clicks on play buttons
      if (e.target.closest(".play-btn")) {
        const soundId = e.target.closest(".play-btn").dataset.sound;
        await this.toggleSound(soundId);
      }
      // Handle clicks on preset buttons
      if (e.target.closest(".preset-btn")) {
        this.playPreset(e.target.closest(".preset-btn").dataset.preset);
      }

      // Handle clicks of the modal blurred background or the cancel button of the modal
      if (e.target.id === "savePresetModal" || e.target.id === "cancelSave") {
        this.ui.hideModal();
      }

      // Handle clicks of the save button of the modal
      if (e.target.id === "confirmSave") {
        this.saveNewCustomPreset();
      }

      // Handle clicks on delete custom preset buttons and general custom preset buttons
      if (e.target.closest(".delete-preset")) {
        this.removeCustomPreset(
          e.target.closest(".delete-preset").dataset.preset,
        );
      } else if (e.target.closest(".custom-preset-btn")) {
        this.playPreset(
          e.target.closest(".custom-preset-btn").dataset.preset,
          true,
        );
      }
      // Handle clicks on the theme toggle button
      if (e.target.closest("#themeToggle")) {
        this.ui.toggleTheme();
      }
    });

    // Handle volume slider changes
    document.addEventListener("input", (e) => {
      if (e.target.classList.contains("volume-slider")) {
        const soundId = e.target.dataset.sound;
        const volume = +e.target.value;
        this.setSoundVolume(soundId, volume);
      }
    });

    // Handle master volume slider
    this.ui.masterVolumeSlider.addEventListener("input", (e) => {
      const volume = parseInt(e.target.value);
      this.setMasterVolume(volume);
    });

    // Handle play/pause of all sounds
    this.ui.playPauseButton?.addEventListener("click", () => {
      this.toggleAllSounds();
    });

    // Handle reset of all sounds to default state
    this.ui.resetButton.addEventListener("click", () => {
      this.resetAll();
    });

    // Handle clicks on the save new preset button
    this.ui.savePresetButton.addEventListener("click", (e) => {
      this.showSavePresetModal();
    });

    // Handle changes on the timer select
    this.ui.timerSelect.addEventListener("change", (e) => {
      const minutes = parseInt(e.target.value);
      if (minutes > 0) {
        this.timer.start(minutes);
      } else {
        this.timer.stop();
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
    const slider = document.querySelector(
      `[data-sound="${soundId}"] .volume-slider`,
    );
    const volume = +slider.value;
    if (audio.paused) {
      this.setSoundVolume(soundId, volume === 0 ? 50 : volume);
      await this.soundManager.playSound(soundId);
      this.ui.updateSoundPlayButton(soundId, true);
      this.ui.updateVolumeDisplay(soundId, volume === 0 ? 50 : volume);
    } else {
      this.soundManager.pauseSound(soundId);
      this.ui.updateSoundPlayButton(soundId, false);
      this.currentSoundState[soundId] = 0;
    }
  }

  // Set sound volume
  setSoundVolume(soundId, volume) {
    // Set sound volume in state
    this.currentSoundState[soundId] = volume;
    // Calculate effective volume with master volume
    const effectiveVolume = (volume * this.masterVolume) / 100;
    // Update sound volume in manager
    this.soundManager.setVolume(soundId, effectiveVolume);
    // Update visual display
    this.ui.updateVolumeDisplay(soundId, volume);
  }

  // Set master volume
  setMasterVolume(volume) {
    this.masterVolume = volume;

    // Update display of master volume value
    document.getElementById("masterVolumeValue").textContent =
      this.masterVolume;

    // Apply master volume to all currently playing sounds
    this.applyMasterVolumeToAll();
  }

  // Apply master volume to all playing sounds without affecting their individual volume displays
  applyMasterVolumeToAll() {
    for (const [soundId, audio] of this.soundManager.audioElements) {
      if (!audio.paused) {
        const card = document.querySelector(`[data-sound="${soundId}"]`);
        const slider = card?.querySelector(".volume-slider");
        if (slider) {
          const individualVolume = parseInt(slider.value);
          const effectiveVolume = (individualVolume * this.masterVolume) / 100;

          // Apply to the actual audio element
          audio.volume = effectiveVolume / 100;
        }
      }
    }
  }

  async toggleAllSounds() {
    const icon = this.ui.playPauseButton.querySelector("i");
    if (icon.classList.contains("fa-play")) {
      let anyPlaying = false;
      this.ui.soundCardsContainer
        .querySelectorAll(".sound-card")
        .forEach((card) => {
          if (card.classList.contains("playing")) {
            anyPlaying = true;
          }
        });
      if (anyPlaying) this.resetAll();
    }
    if (icon.classList.contains("fa-pause")) {
      const soundCards =
        this.ui.soundCardsContainer.querySelectorAll(".sound-card");
      let numOfPlaying = 0;
      soundCards.forEach((card) => {
        if (card.classList.contains("playing")) {
          numOfPlaying++;
        }
      });
      if (numOfPlaying < soundCards.length) {
        soundCards.forEach((card) => {
          if (!card.classList.contains("playing")) {
            this.toggleSound(card.dataset.sound);
          }
        });
        this.ui.renderAllButtonsAsInactive();
      }
    }
    for (const [soundId] of this.soundManager.audioElements) {
      await this.toggleSound(soundId);
    }
    this.ui.updatePlayPauseAllButton();
  }

  // Reset everything to default state
  resetAll() {
    this.soundManager.stopAllSounds();
    this.ui.resetUI();
    for (const soundId of Object.keys(this.currentSoundState)) {
      this.currentSoundState[soundId] = 0;
    }
    this.masterVolume = 50;
    this.timer.stop();
    this.ui.timerSelect.value = "0";
  }

  // Play preset according to button clicked
  async playPreset(presetKey, custom = false) {
    let preset;
    if (custom) {
      preset = this.presetManager.customPresets[presetKey];
    } else {
      preset = defaultPresets[presetKey];
    }
    this.resetAll();
    for (const [soundId, volume] of Object.entries(preset.sounds)) {
      this.setSoundVolume(soundId, volume);
      await this.soundManager.playSound(soundId);
      this.ui.updateSoundPlayButton(soundId, true);
      this.ui.updateVolumeDisplay(soundId, volume);
    }
    this.ui.renderPresetButtonActive(presetKey);
    this.ui.updatePlayPauseAllButton();
  }

  showSavePresetModal() {
    if (Object.values(this.currentSoundState).every((volume) => volume === 0)) {
      return alert("No active sounds for preset!");
    }
    this.ui.showModal();
  }

  saveNewCustomPreset() {
    const name = document.getElementById("presetName").value.trim();
    if (!name)
      return alert("You need to provide a name for your custom preset!");
    if (this.presetManager.presetNameExists(name))
      return alert("This preset name already exists. Choose a different one!");
    const presetId = this.presetManager.savePreset(
      name,
      this.currentSoundState,
    );
    this.ui.hideModal();
    // Add custom preset to UI
    this.ui.addCustomPreset(name, presetId);
  }

  removeCustomPreset(presetId) {
    this.resetAll();
    this.presetManager.deletePreset(presetId);
    this.ui.removeCustomPresetButton(presetId);
  }

  // Timer complete callback
  onTimerComplete() {
    this.resetAll();

    // Reset timer select dropdown
    this.ui.timerSelect.value = "0";

    // Clear and hide timer display
    this.ui.timerDisplay.textContent = "";
    this.ui.timerDisplay.classList.add("hidden");
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new AmbientMixer();
  app.init();
});
