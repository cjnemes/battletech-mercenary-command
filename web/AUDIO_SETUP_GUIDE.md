# Battletech Mercenary Command - Audio & Mobile Setup Guide

## 🎵 Audio System Implementation

Your game now includes a comprehensive, professional-grade audio system with Battletech-themed atmospheric sounds and mobile optimizations.

### Core Audio Features Implemented:

#### 1. **AudioManager System**
- **Location**: `/web/src/systems/js/AudioManager.js`
- **Integration**: Fully integrated with GameEngine as a core system
- **Features**:
  - Web Audio API with HTML5 fallback
  - Volume controls for Master, Music, UI, and Ambient channels
  - Audio asset preloading and management
  - Mobile-specific audio unlock mechanisms
  - User preferences persistence

#### 2. **Battletech Atmospheric Audio Categories**
```javascript
// Music Tracks
mainMenu: 'Main menu ambient music'
mechBay: 'Mech bay industrial sounds'
starMap: 'Strategic navigation music'
combat: 'Tactical combat music'
victory: 'Mission success fanfare'

// UI Sound Effects
buttonClick: 'Professional button click'
buttonHover: 'Subtle hover feedback'
menuSelect: 'Menu navigation sound'
notification: 'System notifications'
error: 'Error alert sound'
success: 'Success confirmation'

// Ambient Environment
mechBayHum: 'Industrial mech bay ambiance'
spaceStation: 'Space station background'
briefingRoom: 'Command center atmosphere'
hangarAmbient: 'Hangar bay sounds'

// Interactive Effects  
mechStartup: 'Mech initialization sequence'
weaponLock: 'Targeting system lock-on'
systemAlert: 'Critical system alerts'
creditSound: 'Transaction confirmation'
```

#### 3. **Smart Context-Aware Audio**
- Automatic music changes based on current screen
- Tutorial integration with audio cues
- Notification system with audio feedback
- UI interaction sounds throughout the interface

#### 4. **Mobile Audio Optimizations**
- Touch-based audio unlock for iOS/Android
- Battery-saving audio modes
- Compressed audio formats for mobile networks
- Hardware acceleration support

## 📱 Mobile Optimization Implementation

### Core Mobile Features:

#### 1. **MobileOptimizer System**
- **Location**: `/web/src/systems/js/MobileOptimizer.js`
- **Features**:
  - Device detection (Mobile/Tablet/Desktop)
  - Touch gesture recognition
  - Performance mode adaptation
  - Haptic feedback support

#### 2. **Touch Interaction Enhancements**
- **Touch Targets**: Minimum 44px for accessibility
- **Gesture Support**:
  - Swipe navigation between screens
  - Pull-to-refresh functionality
  - Double-tap for quick actions
  - Pinch-to-zoom for detailed views
- **Visual Feedback**: Touch ripple effects and haptic feedback

#### 3. **Responsive Design Breakpoints**
```css
/* Small Mobile: 320px - 479px */
/* Large Mobile: 480px - 767px */
/* Tablet: 768px - 1024px */
/* Desktop: 1025px+ */
```

#### 4. **Mobile-Specific UI Elements**
- Collapsible sections for better screen space usage
- Bottom-sheet modals for mobile-friendly interactions
- Fixed navigation with safe area handling
- Enhanced typography scaling

#### 5. **Progressive Web App (PWA) Features**
- **Manifest**: `/web/manifest.json`
- **Service Worker**: `/web/sw.js`
- **Offline Support**: Core game functionality works offline
- **Install Prompt**: Custom installation experience
- **App Icons**: Multiple sizes for different devices

### Performance Optimizations:

#### 1. **Loading & Caching**
- Critical resource preloading
- Lazy loading for non-essential content
- Intelligent caching strategies
- Service worker for offline functionality

#### 2. **Animation & Rendering**
- Hardware acceleration for smooth animations
- Battery-conscious animation modes
- Reduced motion support for accessibility
- GPU-optimized transforms

#### 3. **Memory Management**
- Efficient audio buffer management
- Lazy component loading
- Resource cleanup on screen changes
- Mobile-specific memory optimizations

## 🚀 Setup Instructions

### 1. Audio Asset Preparation
To add actual audio files, place them in the appropriate directories:

```
/web/src/assets/audio/
├── music/
│   ├── main-menu.mp3
│   ├── mech-bay.mp3
│   ├── star-map.mp3
│   ├── combat.mp3
│   └── victory.mp3
├── ui/
│   ├── button-click.wav
│   ├── button-hover.wav
│   ├── menu-select.wav
│   ├── notification.wav
│   ├── error.wav
│   ├── success.wav
│   └── typing.wav
├── ambient/
│   ├── mech-bay-hum.mp3
│   ├── space-station.mp3
│   ├── briefing-room.mp3
│   └── hangar-ambient.mp3
└── effects/
    ├── mech-startup.wav
    ├── weapon-lock.wav
    ├── system-alert.wav
    └── credit-sound.wav
```

### 2. Audio Format Recommendations
- **Music**: MP3, OGG (longer tracks, compressed)
- **UI/Effects**: WAV, OGG (short, high quality)
- **Mobile**: Prefer OGG for better compression
- **Size Limit**: Keep individual files under 1MB for mobile

### 3. Image Assets for PWA
Create the following image assets for full PWA support:

```
/web/src/assets/images/
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── screenshots/
│   ├── screenshot-wide.png (1280x720)
│   └── screenshot-narrow.png (720x1280)
└── splash/
    ├── apple-touch-icon.png
    ├── favicon-32x32.png
    └── favicon-16x16.png
```

## 🎮 Usage Examples

### Audio Control in Game Code
```javascript
// Play UI sounds
this.eventBus.emit('ui:buttonClick');
this.eventBus.emit('ui:success');

// Control music
this.eventBus.emit('audio:playMusic', 'mechBay');
this.eventBus.emit('audio:stopMusic');

// Volume control
this.eventBus.emit('audio:setVolume', 'master', 0.7);
this.eventBus.emit('audio:mute');
this.eventBus.emit('audio:unmute');
```

### Mobile-Specific Features
```javascript
// Show mobile bottom sheet
this.eventBus.emit('ui:showBottomSheet', {
  title: 'Mech Details',
  content: '<p>Detailed mech information...</p>',
  actions: '<button class="btn btn-primary">Confirm</button>'
});

// Toggle collapsible sections
this.eventBus.emit('ui:toggleSection', headerElement);

// Handle orientation changes
this.eventBus.on('mobile:orientationChanged', (data) => {
  console.log('New orientation:', data.orientation);
});
```

## 🔧 Configuration Options

### Audio Settings
```javascript
// Accessible via AudioManager
{
  volumes: {
    master: 0.7,    // Master volume (0-1)
    music: 0.6,     // Background music
    ui: 0.8,        // UI sound effects
    ambient: 0.5    // Environmental sounds
  },
  isEnabled: true,  // Global audio toggle
  isMuted: false    // Global mute state
}
```

### Mobile Settings
```javascript
// Accessible via MobileOptimizer  
{
  hapticEnabled: true,           // Haptic feedback
  performanceMode: 'auto',       // 'auto', 'performance', 'battery'
  collapsedSections: [],         // User's collapsed sections
  touchFeedback: true            // Visual touch feedback
}
```

## 🎯 Integration Points

### Event System Integration
The audio and mobile systems integrate seamlessly with your existing EventBus:

```javascript
// Screen changes trigger contextual audio
this.eventBus.emit('screen:change', { from: 'main-menu', to: 'mech-bay' });

// Tutorial system with audio cues
this.eventBus.emit('tutorial:stepComplete');

// Notification system with audio feedback
this.eventBus.emit('notification:show', { type: 'success', message: 'Game saved!' });
```

### GameEngine Integration
Both systems are initialized as core systems in GameEngine:
- Initialize automatically with the game
- Shutdown properly when game closes
- Integrate with save/load functionality
- Performance monitoring and optimization

## 🐛 Troubleshooting

### Common Issues:

1. **Audio not playing on mobile**
   - Ensure user interaction has occurred (automatic unlock implemented)
   - Check browser autoplay policies
   - Verify audio files are accessible

2. **Touch gestures not working**
   - Verify MobileOptimizer is initialized
   - Check console for touch event errors
   - Ensure proper CSS touch-action properties

3. **PWA installation not working**
   - Check service worker registration
   - Verify manifest.json is accessible
   - Ensure HTTPS in production

4. **Performance issues on mobile**
   - Enable battery saving mode
   - Reduce animation complexity
   - Check console for performance warnings

## 🚀 Production Deployment

### Pre-deployment Checklist:
- [ ] Add actual audio files to asset directories
- [ ] Create PWA icons and screenshots
- [ ] Test on various mobile devices
- [ ] Verify service worker caching
- [ ] Test offline functionality
- [ ] Validate audio performance on low-end devices
- [ ] Test installation flow
- [ ] Verify haptic feedback on supported devices

### Performance Monitoring:
The systems include built-in performance monitoring:
- Frame rate tracking
- Audio buffer management
- Memory usage monitoring
- Touch event optimization
- Network request optimization

---

Your Battletech Mercenary Command game now features a professional-grade audio system and comprehensive mobile optimizations that provide an authentic, immersive experience across all devices while maintaining the tactical depth and atmospheric authenticity of the Battletech universe.