/**
 * AudioManager - Comprehensive Audio System for Battletech Mercenary Command
 * Professional audio management with Battletech atmospheric theming
 */
import { Logger } from '../../utils/Logger.js';

export class AudioManager {
  constructor(eventBus) {
    this.logger = new Logger('AudioManager');
    this.eventBus = eventBus;
    
    // Audio Context Setup
    this.audioContext = null;
    this.masterGain = null;
    this.musicGain = null;
    this.uiGain = null;
    this.ambientGain = null;
    
    // Audio State
    this.isInitialized = false;
    this.isEnabled = true;
    this.isMuted = false;
    
    // Volume Settings (0-1)
    this.volumes = {
      master: 0.7,
      music: 0.6,
      ui: 0.8,
      ambient: 0.5
    };
    
    // Audio Assets
    this.audioAssets = new Map();
    this.musicTracks = new Map();
    this.currentMusic = null;
    this.musicFadeTimeout = null;
    
    // Audio State Management
    this.audioBuffers = new Map();
    this.activeAudioSources = new Map();
    this.loadingPromises = new Map();
    
    // Browser Compatibility
    this.supportsWebAudio = false;
    this.supportsAudioContext = false;
    this.audioUnlocked = false;
    
    // Performance Optimization
    this.preloadQueue = [];
    this.maxConcurrentSounds = 8;
    this.soundPool = new Map();
    
    // Mobile Optimization
    this.isMobile = this.detectMobile();
    this.touchStarted = false;
    
    // Audio Categories for organization
    this.audioCategories = {
      music: {
        mainMenu: '/web/src/assets/audio/music/main-menu.mp3',
        mechBay: '/web/src/assets/audio/music/mech-bay.mp3',
        starMap: '/web/src/assets/audio/music/star-map.mp3',
        combat: '/web/src/assets/audio/music/combat.mp3',
        victory: '/web/src/assets/audio/music/victory.mp3'
      },
      ui: {
        buttonClick: '/web/src/assets/audio/ui/button-click.wav',
        buttonHover: '/web/src/assets/audio/ui/button-hover.wav',
        menuSelect: '/web/src/assets/audio/ui/menu-select.wav',
        notification: '/web/src/assets/audio/ui/notification.wav',
        error: '/web/src/assets/audio/ui/error.wav',
        success: '/web/src/assets/audio/ui/success.wav',
        typing: '/web/src/assets/audio/ui/typing.wav'
      },
      ambient: {
        mechBayHum: '/web/src/assets/audio/ambient/mech-bay-hum.mp3',
        spaceStation: '/web/src/assets/audio/ambient/space-station.mp3',
        briefingRoom: '/web/src/assets/audio/ambient/briefing-room.mp3',
        hangarAmbient: '/web/src/assets/audio/ambient/hangar-ambient.mp3'
      },
      effects: {
        mechStartup: '/web/src/assets/audio/effects/mech-startup.wav',
        weaponLock: '/web/src/assets/audio/effects/weapon-lock.wav',
        systemAlert: '/web/src/assets/audio/effects/system-alert.wav',
        creditSound: '/web/src/assets/audio/effects/credit-sound.wav'
      }
    };
  }

  /**
   * Initialize the audio system
   */
  async initialize() {
    try {
      this.logger.info('Initializing AudioManager...');
      
      // Check browser support
      this.checkBrowserSupport();
      
      // Initialize Web Audio API
      if (this.supportsWebAudio) {
        await this.initializeWebAudio();
      }
      
      // Load user preferences
      await this.loadAudioSettings();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Preload critical audio files
      await this.preloadCriticalAudio();
      
      // Setup mobile audio unlock
      if (this.isMobile) {
        this.setupMobileAudioUnlock();
      }
      
      this.isInitialized = true;
      this.logger.info('AudioManager initialized successfully');
      
      this.eventBus.emit('audio:initialized');
      
    } catch (error) {
      this.logger.error('Failed to initialize AudioManager:', error);
      // Fallback to HTML5 audio
      this.initializeHTML5Audio();
    }
  }

  /**
   * Check browser audio capabilities
   */
  checkBrowserSupport() {
    // Check for Web Audio API support
    this.supportsAudioContext = !!(
      window.AudioContext || 
      window.webkitAudioContext || 
      window.mozAudioContext || 
      window.msAudioContext
    );
    
    this.supportsWebAudio = this.supportsAudioContext;
    
    this.logger.info(`Audio support - Web Audio: ${this.supportsWebAudio}`);
  }

  /**
   * Initialize Web Audio API
   */
  async initializeWebAudio() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      // Create gain nodes for volume control
      this.masterGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.uiGain = this.audioContext.createGain();
      this.ambientGain = this.audioContext.createGain();
      
      // Connect gain nodes
      this.musicGain.connect(this.masterGain);
      this.uiGain.connect(this.masterGain);
      this.ambientGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);
      
      // Set initial volumes
      this.updateGainValues();
      
      // Handle audio context state
      if (this.audioContext.state === 'suspended') {
        this.logger.info('Audio context suspended, waiting for user interaction');
      }
      
    } catch (error) {
      this.logger.error('Failed to initialize Web Audio API:', error);
      throw error;
    }
  }

  /**
   * Initialize HTML5 Audio fallback
   */
  initializeHTML5Audio() {
    this.logger.info('Falling back to HTML5 Audio');
    this.supportsWebAudio = false;
    
    // Create HTML5 audio elements for different categories
    this.html5Audio = {
      music: new Audio(),
      ui: new Audio(),
      ambient: new Audio()
    };
    
    // Configure HTML5 audio elements
    Object.values(this.html5Audio).forEach(audio => {
      audio.preload = 'none';
      audio.volume = 0.5;
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Game engine events
    this.eventBus.on('screen:change', this.handleScreenChange.bind(this));
    this.eventBus.on('game:paused', this.handleGamePaused.bind(this));
    this.eventBus.on('game:resumed', this.handleGameResumed.bind(this));
    
    // UI events
    this.eventBus.on('ui:buttonClick', () => this.playUI('buttonClick'));
    this.eventBus.on('ui:buttonHover', () => this.playUI('buttonHover'));
    this.eventBus.on('ui:menuSelect', () => this.playUI('menuSelect'));
    this.eventBus.on('ui:notification', () => this.playUI('notification'));
    this.eventBus.on('ui:error', () => this.playUI('error'));
    this.eventBus.on('ui:success', () => this.playUI('success'));
    
    // Tutorial events
    this.eventBus.on('tutorial:stepComplete', () => this.playUI('success'));
    this.eventBus.on('tutorial:started', () => this.playUI('menuSelect'));
    
    // System events
    this.eventBus.on('notification:show', (data) => {
      if (data.type === 'error') this.playUI('error');
      else if (data.type === 'success') this.playUI('success');
      else this.playUI('notification');
    });
    
    // Audio control events
    this.eventBus.on('audio:setVolume', this.setVolume.bind(this));
    this.eventBus.on('audio:mute', this.mute.bind(this));
    this.eventBus.on('audio:unmute', this.unmute.bind(this));
    this.eventBus.on('audio:playMusic', this.playMusic.bind(this));
    this.eventBus.on('audio:stopMusic', this.stopMusic.bind(this));
    
    // Browser events
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Setup mobile audio unlock mechanism
   */
  setupMobileAudioUnlock() {
    const unlockAudio = () => {
      if (this.audioUnlocked) return;
      
      if (this.supportsWebAudio && this.audioContext) {
        this.audioContext.resume().then(() => {
          this.audioUnlocked = true;
          this.logger.info('Mobile audio unlocked');
        });
      }
      
      this.touchStarted = true;
      
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('touchend', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
    
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('touchend', unlockAudio);
    document.addEventListener('click', unlockAudio);
  }

  /**
   * Preload critical audio assets
   */
  async preloadCriticalAudio() {
    const criticalSounds = [
      'ui/buttonClick',
      'ui/buttonHover',
      'ui/menuSelect',
      'ui/notification',
      'music/mainMenu'
    ];
    
    const loadPromises = criticalSounds.map(sound => this.preloadAudio(sound));
    
    try {
      await Promise.all(loadPromises);
      this.logger.info('Critical audio assets preloaded');
    } catch (error) {
      this.logger.warn('Some critical audio assets failed to preload:', error);
    }
  }

  /**
   * Preload an audio file
   */
  async preloadAudio(audioPath) {
    if (this.audioBuffers.has(audioPath)) {
      return this.audioBuffers.get(audioPath);
    }
    
    if (this.loadingPromises.has(audioPath)) {
      return this.loadingPromises.get(audioPath);
    }
    
    const loadPromise = this.loadAudioFile(audioPath);
    this.loadingPromises.set(audioPath, loadPromise);
    
    try {
      const buffer = await loadPromise;
      this.audioBuffers.set(audioPath, buffer);
      this.loadingPromises.delete(audioPath);
      return buffer;
    } catch (error) {
      this.loadingPromises.delete(audioPath);
      throw error;
    }
  }

  /**
   * Load audio file and decode it
   */
  async loadAudioFile(audioPath) {
    const fullPath = this.resolveAudioPath(audioPath);
    
    try {
      const response = await fetch(fullPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      if (this.supportsWebAudio && this.audioContext) {
        return await this.audioContext.decodeAudioData(arrayBuffer);
      } else {
        // For HTML5 audio, return the URL
        return URL.createObjectURL(new Blob([arrayBuffer]));
      }
    } catch (error) {
      this.logger.error(`Failed to load audio file: ${audioPath}`, error);
      throw error;
    }
  }

  /**
   * Resolve audio path from category/name format
   */
  resolveAudioPath(audioPath) {
    const [category, name] = audioPath.split('/');
    
    if (this.audioCategories[category] && this.audioCategories[category][name]) {
      return this.audioCategories[category][name];
    }
    
    // Fallback to direct path
    return audioPath;
  }

  /**
   * Play UI sound effect
   */
  async playUI(soundName, options = {}) {
    if (!this.isEnabled || this.isMuted) return null;
    
    const audioPath = `ui/${soundName}`;
    return this.playAudio(audioPath, 'ui', options);
  }

  /**
   * Play ambient sound
   */
  async playAmbient(soundName, options = {}) {
    if (!this.isEnabled || this.isMuted) return null;
    
    const audioPath = `ambient/${soundName}`;
    return this.playAudio(audioPath, 'ambient', { loop: true, ...options });
  }

  /**
   * Play music track
   */
  async playMusic(trackName, options = {}) {
    if (!this.isEnabled || this.isMuted) return null;
    
    // Stop current music if playing
    if (this.currentMusic) {
      this.stopMusic();
    }
    
    const audioPath = `music/${trackName}`;
    const audioSource = await this.playAudio(audioPath, 'music', { 
      loop: true, 
      fade: true,
      ...options 
    });
    
    if (audioSource) {
      this.currentMusic = audioSource;
    }
    
    return audioSource;
  }

  /**
   * Stop current music
   */
  stopMusic(fadeOut = true) {
    if (this.currentMusic) {
      if (fadeOut) {
        this.fadeOut(this.currentMusic, 1000);
      } else {
        this.stopAudio(this.currentMusic);
      }
      this.currentMusic = null;
    }
  }

  /**
   * Play audio with Web Audio API or HTML5 fallback
   */
  async playAudio(audioPath, category = 'ui', options = {}) {
    try {
      // Ensure audio context is resumed (mobile requirement)
      if (this.supportsWebAudio && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      if (this.supportsWebAudio) {
        return await this.playWebAudio(audioPath, category, options);
      } else {
        return await this.playHTML5Audio(audioPath, category, options);
      }
    } catch (error) {
      this.logger.error(`Failed to play audio: ${audioPath}`, error);
      return null;
    }
  }

  /**
   * Play audio using Web Audio API
   */
  async playWebAudio(audioPath, category, options = {}) {
    const buffer = await this.preloadAudio(audioPath);
    if (!buffer) return null;
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    source.loop = options.loop || false;
    
    // Connect to appropriate gain node
    let categoryGain = this.uiGain;
    if (category === 'music') categoryGain = this.musicGain;
    else if (category === 'ambient') categoryGain = this.ambientGain;
    
    source.connect(gainNode);
    gainNode.connect(categoryGain);
    
    // Set volume
    const volume = options.volume !== undefined ? options.volume : 1.0;
    gainNode.gain.value = volume;
    
    // Handle fade in
    if (options.fade) {
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 1);
    }
    
    // Start playback
    source.start(0);
    
    // Store reference for management
    const audioId = this.generateAudioId();
    const audioSource = {
      id: audioId,
      source,
      gainNode,
      category,
      isPlaying: true
    };
    
    this.activeAudioSources.set(audioId, audioSource);
    
    // Handle end event
    source.onended = () => {
      this.activeAudioSources.delete(audioId);
    };
    
    return audioSource;
  }

  /**
   * Play audio using HTML5 Audio
   */
  async playHTML5Audio(audioPath, category, options = {}) {
    const audio = this.html5Audio[category] || this.html5Audio.ui;
    const fullPath = this.resolveAudioPath(audioPath);
    
    audio.src = fullPath;
    audio.loop = options.loop || false;
    audio.volume = (options.volume !== undefined ? options.volume : 1.0) * this.volumes[category];
    
    try {
      await audio.play();
      return { id: this.generateAudioId(), element: audio, category };
    } catch (error) {
      this.logger.error('HTML5 audio playback failed:', error);
      return null;
    }
  }

  /**
   * Stop playing audio
   */
  stopAudio(audioSource) {
    if (!audioSource) return;
    
    if (audioSource.source) {
      // Web Audio API
      try {
        audioSource.source.stop();
        audioSource.isPlaying = false;
        this.activeAudioSources.delete(audioSource.id);
      } catch (error) {
        // Source might have already stopped
      }
    } else if (audioSource.element) {
      // HTML5 Audio
      audioSource.element.pause();
      audioSource.element.currentTime = 0;
    }
  }

  /**
   * Fade out audio over time
   */
  fadeOut(audioSource, duration = 1000) {
    if (!audioSource || !audioSource.gainNode) return;
    
    const gainNode = audioSource.gainNode;
    const currentTime = this.audioContext.currentTime;
    const fadeTime = duration / 1000;
    
    gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeTime);
    
    setTimeout(() => {
      this.stopAudio(audioSource);
    }, duration);
  }

  /**
   * Handle screen changes for contextual audio
   */
  handleScreenChange({ to }) {
    // Play appropriate background music based on screen
    switch (to) {
      case 'main-menu':
        this.playMusic('mainMenu');
        break;
      case 'mech-bay':
        this.playMusic('mechBay');
        this.playAmbient('mechBayHum');
        break;
      case 'star-map':
        this.playMusic('starMap');
        this.playAmbient('spaceStation');
        break;
      case 'company-overview':
        this.playAmbient('briefingRoom');
        break;
      default:
        // Keep current music for other screens
        break;
    }
  }

  /**
   * Handle game paused
   */
  handleGamePaused() {
    if (this.supportsWebAudio && this.audioContext) {
      this.audioContext.suspend();
    }
  }

  /**
   * Handle game resumed
   */
  handleGameResumed() {
    if (this.supportsWebAudio && this.audioContext) {
      this.audioContext.resume();
    }
  }

  /**
   * Set volume for category
   */
  setVolume(category, volume) {
    this.volumes[category] = Math.max(0, Math.min(1, volume));
    this.updateGainValues();
    this.saveAudioSettings();
    
    this.eventBus.emit('audio:volumeChanged', { category, volume });
  }

  /**
   * Update gain node values
   */
  updateGainValues() {
    if (!this.supportsWebAudio) return;
    
    this.masterGain.gain.value = this.volumes.master;
    this.musicGain.gain.value = this.volumes.music;
    this.uiGain.gain.value = this.volumes.ui;
    this.ambientGain.gain.value = this.volumes.ambient;
  }

  /**
   * Mute all audio
   */
  mute() {
    this.isMuted = true;
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
    this.saveAudioSettings();
    this.eventBus.emit('audio:muted');
  }

  /**
   * Unmute all audio
   */
  unmute() {
    this.isMuted = false;
    this.updateGainValues();
    this.saveAudioSettings();
    this.eventBus.emit('audio:unmuted');
  }

  /**
   * Detect mobile device
   */
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Generate unique audio ID
   */
  generateAudioId() {
    return `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load audio settings from storage
   */
  async loadAudioSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('battletech_audio_settings') || '{}');
      
      if (settings.volumes) {
        this.volumes = { ...this.volumes, ...settings.volumes };
      }
      
      if (settings.isMuted !== undefined) {
        this.isMuted = settings.isMuted;
      }
      
      if (settings.isEnabled !== undefined) {
        this.isEnabled = settings.isEnabled;
      }
      
      this.updateGainValues();
      
    } catch (error) {
      this.logger.error('Failed to load audio settings:', error);
    }
  }

  /**
   * Save audio settings to storage
   */
  saveAudioSettings() {
    try {
      const settings = {
        volumes: this.volumes,
        isMuted: this.isMuted,
        isEnabled: this.isEnabled
      };
      
      localStorage.setItem('battletech_audio_settings', JSON.stringify(settings));
      
    } catch (error) {
      this.logger.error('Failed to save audio settings:', error);
    }
  }

  /**
   * Handle browser visibility change
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.handleGamePaused();
    } else {
      this.handleGameResumed();
    }
  }

  /**
   * Handle page unload
   */
  handleBeforeUnload() {
    this.stopAllAudio();
  }

  /**
   * Stop all playing audio
   */
  stopAllAudio() {
    this.activeAudioSources.forEach(audioSource => {
      this.stopAudio(audioSource);
    });
    this.activeAudioSources.clear();
    
    if (this.currentMusic) {
      this.stopMusic(false);
    }
  }

  /**
   * Get audio system status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isEnabled: this.isEnabled,
      isMuted: this.isMuted,
      supportsWebAudio: this.supportsWebAudio,
      audioUnlocked: this.audioUnlocked,
      volumes: { ...this.volumes },
      activeAudioSources: this.activeAudioSources.size,
      loadedBuffers: this.audioBuffers.size,
      currentMusic: this.currentMusic ? 'playing' : 'stopped'
    };
  }

  /**
   * Shutdown audio system
   */
  async shutdown() {
    try {
      this.logger.info('Shutting down AudioManager...');
      
      // Stop all audio
      this.stopAllAudio();
      
      // Save settings
      this.saveAudioSettings();
      
      // Close audio context
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      // Clear resources
      this.audioBuffers.clear();
      this.activeAudioSources.clear();
      this.loadingPromises.clear();
      
      this.isInitialized = false;
      this.logger.info('AudioManager shutdown complete');
      
    } catch (error) {
      this.logger.error('Error during AudioManager shutdown:', error);
    }
  }
}