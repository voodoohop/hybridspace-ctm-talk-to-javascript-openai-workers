# PRIO Conception App - ArtRio 2025 Implementation Plan

## Overview
Based on the conversation transcript, we need to transform the current single-screen experience into a multi-screen installation with separate interfaces for different roles and improved user flow.

## ✅ COMPLETED WORK (September 2025)

### Camera Visibility Fix (CRITICAL BUG RESOLVED)
- **Issue**: Camera element was positioned off-screen causing black image captures
- **Solution**: Changed to `visibility: hidden` while maintaining full 1280x720 resolution
- **Status**: ✅ Fixed, deployed, committed (f74ae41)
- **Impact**: Photo capture now works properly with actual image content

### Enhanced Debugging System
- **Server-side logging**: Comprehensive Azure API request/response tracking
- **Image debugging**: Automatic upload of captured photos to Cloudflare Images for inspection
- **Client-side improvements**: Timeout handling, detailed error logging, connectivity tests
- **Status**: ✅ Implemented and working

### Session Management System
- **Backend endpoints**: `/api/session-state`, `/api/start-session`, `/api/end-session`
- **Session polling**: Real-time status updates via Cloudflare Images metadata
- **Admin interface**: Working session controls at `/admin.html`
- **Status**: ✅ Fully implemented and functional

### Multi-Screen Architecture (PARTIALLY COMPLETE)
- **Admin interface**: `/admin.html` with image management, printing, and QR codes
- **Carousel display**: `/carousel.html?latest=true` for external screens
- **Auto-print functionality**: Kiosk mode integration for automatic printing
- **Status**: ✅ Core functionality complete, needs refinement

### AI System Improvements
- **Model upgrade**: Switched to production `gpt-realtime` (20% cost savings)
- **System prompt**: Updated with ArtRio 2025 context and reduced slang
- **Image generation**: Azure GPT Image 1 integration with PRIO branding
- **Status**: ✅ Working and deployed

## Current Architecture Analysis

### Existing Components
- **Main Experience** (`/index.html`) - Voice conversation with camera view, art generation, QR codes
- **Admin Interface** (`/admin.html`) - Image management, printing, QR codes, and session controls
- **Carousel** (`/carousel.html`) - Simple slideshow of generated images
- **Backend** (`/src/index.ts`) - Cloudflare Workers with Azure GPT Image 1 API integration

### ⚠️ REMAINING ISSUES TO ADDRESS
1. ✅ ~~Camera view visible during conversation~~ - FIXED: Camera now invisible but functional
2. ✅ ~~No session control for reception staff~~ - FIXED: Admin interface with session controls
3. ✅ ~~Too much slang in AI personality~~ - FIXED: Updated system prompt
4. 🔄 **User stays in booth during 75-second art generation** - NEEDS IMPROVEMENT
5. 🔄 **QR codes and print buttons shown to end users** - NEEDS REMOVAL from main experience
6. 🔄 **Missing PRIO company information integration** - NEEDS ENHANCEMENT
7. 🆕 **Voice visualization needed** - Replace camera view with audio waveforms
8. 🆕 **Conversation end trigger** - Auto-end after image generation

## Implementation Plan

### Phase 1: Core Experience Changes (High Priority)

#### 1.1 ✅ Remove Camera View from Main Experience - COMPLETED
**Files modified:** `helpers.js`
**Changes completed:**
- ✅ Removed visible video container from `initializeCamera()`
- ✅ Camera stream kept active but hidden (`visibility: hidden`)
- ✅ Photo capture functionality maintained at full resolution
- 🔄 **NEXT**: Replace with audio visualization component
- 🔄 **NEXT**: Create new `createVoiceVisualization()` function

**Technical Details:**
```javascript
// IMPLEMENTED: Hidden camera element
videoElement.style.visibility = 'hidden';
videoElement.style.zIndex = '-1';

// TODO: New voice visualization component
function createVoiceVisualization() {
  // Create circular audio waveform around PRIO logo
  // Use existing audio analysis from setupLogoAnimation()
  // Show animated rings/waves based on voice input
  // Use existing audio analysis from setupLogoAnimation()
  // Show animated rings/waves based on voice input
}
```

#### 1.2 ✅ Remove QR Code, Prompt, and Print Button from Main Experience - COMPLETED
**Files modified:** `helpers.js`, `index.html`
**Current status:** ✅ QR codes and sharing elements removed from main experience
**Priority:** ✅ COMPLETED - Critical user flow issue resolved

**Changes completed:**
- ✅ Main experience (`index.html`) shows only PRIO logo - no QR/print UI
- ✅ `addImageToPage()` function only logs completion - no UI elements shown
- ✅ Auto-print functionality isolated to kiosk mode only
- ✅ QR code and print controls moved to admin interface (`admin.html`)
- ✅ Clean user experience without administrative controls
- Add "check outside screen" message

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

## 🎯 NEXT PRIORITY TASKS (Updated September 2025)

### IMMEDIATE (This Week)
1. **🔴 HIGH: Remove QR/Print from Main Experience**
   - Modify `addImageToPage()` in `helpers.js` to show only image + "check outside" message
   - Critical for proper user flow - users shouldn't see admin controls

2. **🔴 HIGH: Add Voice Visualization**
   - Create `createVoiceVisualization()` function using existing audio analysis
   - Replace invisible camera area with animated waveforms around PRIO logo

3. **🔴 HIGH: Add Conversation End Trigger**
   - Auto-terminate conversation after image generation
   - Show "experience complete" message and redirect to external screen
   - Add 30-second auto-reset for next user

### MEDIUM PRIORITY (Next 2 Weeks)
4. **🟡 Enhance PRIO Company Integration**
   - Add more petroleum/energy industry context to system prompt
   - Create natural conversation bridges to PRIO values and work

5. **🟡 Optimize Multi-Screen Workflow**
   - Test and refine admin interface workflow
   - Improve carousel display for public screens
   - Add better error handling and recovery

6. **🟡 Performance Optimization**
   - Optimize for extended operation periods
   - Add better session cleanup and memory management

### COMPLETED MILESTONES ✅
- ✅ Camera visibility fix (critical bug resolved)
- ✅ Session management system with admin controls
- ✅ Enhanced debugging and logging system
- ✅ Multi-screen architecture foundation
- ✅ AI system improvements and model upgrade
- ✅ Auto-print functionality for kiosk mode

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
