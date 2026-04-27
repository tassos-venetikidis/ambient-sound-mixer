export class UI {
  constructor() {
    this.soundCardsContainer = null;
    this.masterVolumeSlider = null;
    this.masterVolumeValue = null;
    this.playPauseButton = null;
    this.resetButton = null;
    this.savePresetButton = null;
    this.modal = null;
    this.customPresetsContainer = null;
    this.timerDisplay = null;
    this.timerSelect = null;
    this.themeToggle = null;
  }

  init() {
    this.soundCardsContainer = document.querySelector(".grid");
    this.masterVolumeSlider = document.getElementById("masterVolume");
    this.masterVolumeValue = document.getElementById("masterVolumeValue");
    this.playPauseButton = document.getElementById("playPauseAll");
    this.resetButton = document.getElementById("resetAll");
    this.savePresetButton = document.getElementById("savePreset");
    this.modal = document.getElementById("savePresetModal");
    this.customPresetsContainer = document.getElementById("customPresets");
    this.timerDisplay = document.getElementById("timerDisplay");
    this.timerSelect = document.getElementById("timerSelect");
    this.themeToggle = document.getElementById("themeToggle");
  }

  // Create sound card HTML
  createSoundCard(sound) {
    const card = document.createElement("div");
    card.className =
      "sound-card bg-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden transition-all duration-300";
    card.dataset.sound = sound.id;
    card.innerHTML = `<div class="flex flex-col h-full">
      <!-- Sound Icon and Name -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="sound-icon-wrapper w-12 h-12 rounded-full bg-gradient-to-br ${sound.color} flex items-center justify-center">
            <i class="fas ${sound.icon} text-white text-xl"></i>
          </div>
          <div>
            <h3 class="font-semibold text-lg">${sound.name}</h3>
            <p class="text-xs opacity-70">${sound.description}</p>
          </div>
        </div>
        <button type="button" class="play-btn w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center" data-sound="${sound.id}">
          <i class="fas fa-play text-sm"></i>
        </button>
      </div>

      <!-- Volume Control -->
      <div class="flex-1 flex flex-col justify-center">
        <div class="flex items-center space-x-3">
          <i class="fas fa-volume-low opacity-50"></i>
          <input type="range" class="volume-slider flex-1" min="0" max="100" value="0" data-sound="${sound.id}">
          <span class="volume-value text-sm w-8 text-right">0</span>
        </div>

        <!-- Volume Bar Visualization -->
        <div class="volume-bar mt-3">
          <div class="volume-bar-fill" style="width: 0%"></div>
        </div>
      </div>
    </div>`;

    return card;
  }

  // Render all sound cards
  renderSoundCards(sounds) {
    this.soundCardsContainer.innerHTML = "";
    sounds.forEach((sound) => {
      this.soundCardsContainer.append(this.createSoundCard(sound));
    });
  }

  // Create custom preset button HTML
  createCustomPresetButton(name, presetId) {
    const button = document.createElement("button");
    button.className =
      "custom-preset-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 relative group";
    button.dataset.preset = presetId;
    button.innerHTML = `<i class="fas fa-star mr-2 text-yellow-400"></i>
    ${name}
    <button type="button" class="delete-preset absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-preset="${presetId}">
      <i class="fas fa-times text-xs text-white"></i>
    </button>`;
    return button;
  }

  // Render all custom preset buttons
  renderCustomPresetButtons(customPresets) {
    for (const [presetId, preset] of Object.entries(customPresets)) {
      this.addCustomPreset(preset.name, presetId);
    }
  }

  // Show button as active
  renderPresetButtonActive(presetId) {
    this.renderAllButtonsAsInactive();
    document
      .querySelector(`[data-preset="${presetId}"]`)
      .classList.add("preset-active");
  }

  // Update the UI to show all buttons as inactive
  renderAllButtonsAsInactive() {
    document
      .querySelectorAll(".preset-btn, .custom-preset-btn")
      .forEach((button) => button.classList.remove("preset-active"));
  }

  // Update play/pause button for individual sound
  updateSoundPlayButton(soundId, isPlaying) {
    const card = document.querySelector(`[data-sound="${soundId}"]`);

    if (card) {
      const playBtn = card.querySelector(".play-btn");
      const icon = playBtn.querySelector("i");
      if (isPlaying) {
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
        card.classList.add("playing");
      } else {
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
        card.classList.remove("playing");
      }
    }
  }

  // Update volume display for a sound
  updateVolumeDisplay(soundId, volume) {
    const card = document.querySelector(`[data-sound="${soundId}"]`);

    if (card) {
      // Update slider position
      card.querySelector(".volume-slider").value = volume;
      // Update volume bar visual
      card.querySelector(".volume-bar-fill").style = `width: ${volume}%`;
      // Update number display
      card.querySelector(".volume-value").textContent = volume;
    }
  }

  updatePlayPauseAllButton() {
    const icon = this.playPauseButton.querySelector("i");
    const buttonSpan = this.playPauseButton.querySelector("span");

    icon.classList.remove("fa-pause");
    icon.classList.add("fa-play");
    buttonSpan.textContent = "Play All";

    if (this.soundCardsContainer.querySelectorAll(".playing").length > 0) {
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
      buttonSpan.textContent = "Pause All";
    }
  }

  // Reset all UI elements to default state
  resetUI() {
    this.soundCardsContainer.querySelectorAll(".sound-card").forEach((card) => {
      this.updateVolumeDisplay(card.dataset.sound, 0);
      this.updateSoundPlayButton(card.dataset.sound, false);
      card.classList.remove("playing");
    });
    this.updatePlayPauseAllButton();
    this.masterVolumeSlider.value = 50;
    this.masterVolumeValue.textContent = "50";
    this.renderAllButtonsAsInactive();
  }

  // Show the save new preset modal
  showModal() {
    this.modal.classList.replace("hidden", "flex");
    document.getElementById("presetName").focus();
  }
  // Hide the save new preset modal
  hideModal() {
    this.modal.classList.replace("flex", "hidden");
    document.getElementById("presetName").value = "";
  }

  addCustomPreset(name, presetId) {
    this.customPresetsContainer.append(
      this.createCustomPresetButton(name, presetId),
    );
  }

  // Remove custom preset button from UI
  removeCustomPresetButton(presetId) {
    document
      .querySelector(`.custom-preset-btn[data-preset="${presetId}"]`)
      ?.remove();
  }

  // Update timer display
  updateTimerDisplay(minutes, seconds) {
    if (minutes > 0 || seconds > 0) {
      this.timerDisplay.textContent = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
      this.timerDisplay.classList.remove("hidden");
    } else {
      this.timerDisplay.classList.add("hidden");
    }
  }

  // Toggle theme
  toggleTheme() {
    const body = document.body;
    const icon = this.themeToggle.querySelector("i");
    if (body.classList.contains("light-theme")) {
      body.classList.replace("light-theme", "dark-theme");
      icon.classList.replace("fa-moon", "fa-sun");
    } else {
      body.classList.replace("dark-theme", "light-theme");
      icon.classList.replace("fa-sun", "fa-moon");
    }
  }
}
