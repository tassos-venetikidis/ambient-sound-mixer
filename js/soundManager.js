export class SoundManager {
  constructor() {
    this.audioElements = new Map();
    this.isPlaying = false;
  }

  // Load a sound file
  loadSound(soundId, filePath) {
    try {
      const audio = new Audio();
      audio.src = filePath;
      audio.loop = true;
      audio.preload = "metadata";

      // Add sound to audio elements map
      this.audioElements.set(soundId, audio);
      return true;
    } catch (error) {
      console.error(`Failed to load sound ${soundId}: ${error}`);
      return false;
    }
  }

  // Play a specific sound
  async playSound(soundId) {
    const audio = this.audioElements.get(soundId);
    if (audio) {
      try {
        await audio.play();
        return true;
      } catch (error) {
        console.error(`Failed to play sound: ${soundId}. ${error}`);
        return false;
      }
    }
  }

  // Pause a specific sound
  pauseSound(soundId) {
    const audio = this.audioElements.get(soundId);
    if (audio && !audio.paused) {
      audio.pause();
    }
  }

  // Set volume for a specific sound (0-100)
  setVolume(soundId, volume) {
    const audio = this.audioElements.get(soundId);
    if (!audio) {
      console.error(`Sound: ${soundId} not found...`);
      return false;
    }
    // Convert 0-100 to 0-1
    audio.volume = volume / 100;
    return true;
  }

  // Stop all sounds
  stopAllSounds() {
    for (const audio of this.audioElements.values()) {
      if (!audio.paused) {
        audio.pause();
      }
      audio.currentTime = 0;
      this.isPlaying = false;
    }
  }
}
