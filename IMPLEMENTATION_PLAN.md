# PRIO Conception App - ArtRio 2025 Implementation Plan

## Overview
Based on the conversation transcript, we need to transform the current single-screen experience into a multi-screen installation with separate interfaces for different roles and improved user flow.

## Current Architecture Analysis

### Existing Components
- **Main Experience** (`/index.html`) - Voice conversation with camera view, art generation, QR codes
- **Gallery** (`/gallery.html`) - Admin interface with all images and management controls
- **Carousel** (`/carousel.html`) - Simple slideshow of generated images
- **Backend** (`/src/index.ts`) - Cloudflare Workers with Azure GPT Image 1 API integration

### Current Flow Issues
1. User stays in booth during 75-second art generation
2. Camera view visible during conversation (feedback: should be voice visualization)
3. QR codes and print buttons shown to end users (should be admin-only)
4. No session control for reception staff
5. Too much slang in AI personality
6. Missing PRIO company information integration

## Implementation Plan

### Phase 1: Core Experience Changes (High Priority)

#### 1.1 Remove Camera View from Main Experience
**Files to modify:** `helpers.js`, `script.js`
**Changes:**
- Remove video container creation in `initializeCamera()`
- Keep camera stream active but hidden for photo capture
- Replace camera view with audio visualization component
- Create new `createVoiceVisualization()` function
- Update existing heart animation to be the main visual element

**Technical Details:**
```javascript
// New voice visualization component
function createVoiceVisualization() {
  // Create circular audio waveform around PRIO logo
  // Use existing audio analysis from setupLogoAnimation()
  // Show animated rings/waves based on voice input
}
```

#### 1.2 Remove QR Code, Prompt, and Print Button from Main Experience
**Files to modify:** `helpers.js`
**Changes:**
- Modify `addImageToPage()` function to remove sharing elements
- Remove QR code generation and display
- Remove print button functionality
- Remove prompt text display
- Keep only image display for user confirmation

**Before:**
```javascript
// Current addImageToPage shows: image + prompt + QR + print button
```

**After:**
```javascript
// New addImageToPage shows: image only + "check outside screen" message
```

#### 1.3 Add Conversation End Trigger
**Files to modify:** `helpers.js`, `script.js`, `src/index.ts`
**Changes:**
- Add conversation termination after image generation
- Display "experience complete" message
- Redirect user to external screen
- Add timeout mechanism to reset for next user

**New Function:**
```javascript
function endConversation() {
  // Show completion message
  // Hide all UI elements
  // Display "check outside screen" instruction
  // Auto-reset after 30 seconds
}
```

### Phase 2: Multi-Screen Architecture (Medium Priority)

#### 2.1 Create Admin Interface for Print Management
**New file:** `admin.html`
**Features:**
- Real-time image list with thumbnails
- Print button for each image
- QR code display for staff
- Image metadata (timestamp, prompt preview)
- Delete functionality
- Auto-refresh for new images

**Layout:**
```
┌─────────────────────────────────────┐
│ PRIO Admin - Print Management       │
├─────────────────────────────────────┤
│ [Image 1] [Print] [QR] [Delete]     │
│ [Image 2] [Print] [QR] [Delete]     │
│ [Image 3] [Print] [QR] [Delete]     │
└─────────────────────────────────────┘
```

#### 2.2 Add Start Session Control
**Files to modify:** `script.js`, `admin.html`
**Changes:**
- Add "Start Session" button to admin interface
- Disable WebRTC connection until button pressed
- Add session status indicator
- Reset mechanism between users

**Implementation:**
```javascript
let sessionActive = false;
let waitingForStart = true;

function startNewSession() {
  // Enable microphone and WebRTC
  // Reset conversation state
  // Clear previous image displays
}
```

#### 2.3 Update Carousel for Public Display
**Files to modify:** `carousel.html`
**Changes:**
- Show only the latest generated image (not slideshow)
- Display QR code prominently
- Remove admin controls
- Auto-update when new image generated
- Clean, public-facing design

**New Behavior:**
- Always shows most recent image
- Large QR code for easy scanning
- Minimal, clean interface
- Updates in real-time

### Phase 3: Content and Branding Updates (Low Priority)

#### 3.1 Update AI Personality and System Prompt
**Files to modify:** `src/index.ts`
**Changes:**
- Reduce slang usage in system prompt
- Remove "energia que gera energia" phrase
- Make language more neutral and professional
- Keep Carioca warmth but less colloquial

**Current Issues:**
```
"energia humana gera energia" - Remove this
Too many gírias (slang) - Reduce usage
Overly casual tone - Make more professional
```

#### 3.2 Add PRIO Company Information Integration
**Files to modify:** `src/index.ts`
**Changes:**
- Add PRIO company facts to system prompt
- Create connection opportunities during conversation
- Add petroleum/energy industry context
- Integrate company values naturally

**Example Integration:**
```
User mentions "black" → AI connects to petroleum industry
User talks about energy → AI mentions PRIO's energy work
User discusses innovation → AI references PRIO's pioneering spirit
```

#### 3.3 Update Logo Branding in Generated Images
**Files to modify:** `src/index.ts` (azureImageEdit function)
**Changes:**
- Reduce logo size in generated images
- Use actual PRIO logo file instead of text description
- Implement logo overlay option vs. AI integration
- Test both approaches for best results

**Options:**
1. **AI Integration:** Pass logo as input to image model
2. **Post-processing:** Add logo overlay after generation

### Phase 4: Technical Infrastructure

#### 4.1 URL Structure
```
/ (or /booth)     - Main conversation experience
/admin            - Print management interface  
/carousel         - Public display screen
/gallery          - Existing gallery (keep for backup)
```

#### 4.2 Session Management
- Add session state tracking
- Implement proper cleanup between users
- Add timeout mechanisms
- Handle connection failures gracefully

#### 4.3 Real-time Updates
- WebSocket or polling for admin interface updates
- Carousel auto-refresh for new images
- Status synchronization between screens

## Implementation Order

### Week 1: Core Experience (High Priority)
1. Remove camera view, add voice visualization
2. Remove QR/print from main experience  
3. Add conversation end trigger
4. Update system prompt (reduce slang)

### Week 2: Multi-Screen Setup (Medium Priority)
5. Create admin interface
6. Add session start control
7. Update carousel for public display
8. Test multi-screen workflow

### Week 3: Polish and Integration (Low Priority)
9. Add PRIO company information
10. Update logo branding
11. Final testing and optimization
12. Documentation and deployment

## Technical Considerations

### Camera Handling
- Keep camera stream active but hidden
- Maintain photo capture functionality
- Ensure proper cleanup after use

### State Management
- Track session status across interfaces
- Handle connection timeouts
- Manage image generation queue

### Performance
- Optimize for kiosk/installation environment
- Handle network interruptions gracefully
- Minimize resource usage between sessions

### Security
- Add basic authentication for admin interface
- Validate all user inputs
- Secure image upload/storage

## Testing Strategy

### User Flow Testing
1. **Reception Staff:** Start session → monitor progress → manage prints
2. **Visitor:** Enter booth → conversation → exit → view result outside
3. **Admin:** Monitor queue → print images → handle issues

### Technical Testing
- Multi-screen synchronization
- Session timeout handling
- Image generation failures
- Network connectivity issues

### Integration Testing
- Full end-to-end workflow
- Multiple concurrent users
- Extended operation periods
- Error recovery scenarios

## Deployment Considerations

### Environment Setup
- Configure multiple browser windows/screens
- Set up kiosk mode for public displays
- Configure auto-print settings
- Network and hardware requirements

### Monitoring
- Add logging for session tracking
- Monitor image generation success rates
- Track user engagement metrics
- Error reporting and alerts

This plan provides a comprehensive roadmap for transforming the PRIO Conception App into a professional multi-screen installation suitable for ArtRio 2025.
