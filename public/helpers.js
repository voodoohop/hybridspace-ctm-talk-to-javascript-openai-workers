// Helper functions for PRIO Conception App
// Keep business logic separate from main script

// Auto-print functionality for ArtRio installation using Print.js
function printImageDirect(imageUrl) {
	console.log('Printing image with Print.js (A5 format):', imageUrl);
	
	// Use Print.js library for clean image printing
	if (typeof printJS !== 'undefined') {
		printJS({
			printable: imageUrl,
			type: 'image',
			imageStyle: 'width:100%;height:auto;max-width:100%;max-height:95vh;object-fit:contain;display:block;margin:0;padding:0;',
			css: `
				@media print {
					@page { 
						size: A5 portrait; 
						margin: 5mm; 
					}
					html, body { 
						height: auto !important; 
						margin: 0 !important; 
						padding: 0 !important; 
					}
					* { 
						page-break-after: auto !important; 
						page-break-before: auto !important; 
						page-break-inside: avoid !important; 
					}
				}
			`
		});
	} else {
		console.error('Print.js library not loaded, falling back to window.print');
		// Fallback: open image in new window and print with A5 CSS
		const printWindow = window.open('', '_blank');
		if (printWindow) {
			printWindow.document.write(`
				<html>
				<head>
					<style>
						@media print {
							@page { 
								size: A5 portrait; 
								margin: 5mm; 
							}
							body { 
								margin: 0; 
								padding: 0; 
								display: flex; 
								justify-content: center; 
								align-items: center; 
								height: 100vh; 
							}
							img { 
								max-width: 100%; 
								max-height: 100%; 
								object-fit: contain; 
							}
						}
					</style>
				</head>
				<body>
					<img src="${imageUrl}" onload="window.print(); setTimeout(() => window.close(), 2000);" />
				</body>
				</html>
			`);
			printWindow.document.close();
		}
	}
}

// Show simple completion message (no overlay, no image display)
export function addImageToPage(url, prompt = '') {
	console.log('🖼️ addImageToPage called with URL:', url);
	
	// Auto-print functionality disabled
	// Note: printImageDirect() function is still available for manual use if needed
	console.log('🖨️ Auto-print disabled - image generated:', url?.substring(0, 50));
	
	// Log that image was generated but not displayed on main screen
	console.log('✅ Image generated successfully:', url);
	console.log('📱 Image generation completed - collection message already shown');
	console.log('🖥️ Image available on external screen at /carousel.html?latest=true');
	
	
	return null; // No container to return since we're not creating an overlay
}


// Camera utilities
export async function capturePhotoFromVideo(videoElement) {
	console.log('📸 capturePhotoFromVideo() called');
	console.log('📸 Video element:', !!videoElement);
	
	if (!videoElement) {
		console.error('❌ No video element provided');
		return null;
	}
	
	console.log('📸 Video element properties:', {
		videoWidth: videoElement.videoWidth,
		videoHeight: videoElement.videoHeight,
		readyState: videoElement.readyState,
		paused: videoElement.paused,
		ended: videoElement.ended,
		currentTime: videoElement.currentTime
	});
	
	if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
		console.error('❌ Video dimensions are 0x0 - video not ready');
		return null;
	}
	
	// Calculate crop area: Extended by ~15-20% - Left: 15%, Top: 25%, Width: 70%, Height: 75%
	const sourceWidth = videoElement.videoWidth;
	const sourceHeight = videoElement.videoHeight;
	const cropX = Math.floor(sourceWidth * 0.2);
	const cropY = Math.floor(sourceHeight * 0.3);
	const cropWidth = Math.floor(sourceWidth * 0.60);
	const cropHeight = Math.floor(sourceHeight * 0.7);
	
	console.log('📸 Crop parameters:', { 
		sourceWidth, sourceHeight, 
		cropX, cropY, cropWidth, cropHeight 
	});
	
	const canvas = document.createElement('canvas');
	canvas.width = cropWidth;
	canvas.height = cropHeight;
	const ctx = canvas.getContext('2d');
	
	console.log('📸 Canvas created:', { width: canvas.width, height: canvas.height });
	
	try {
		// Draw cropped area from video to canvas
		ctx.drawImage(
			videoElement,
			cropX, cropY, cropWidth, cropHeight,  // Source rectangle
			0, 0, cropWidth, cropHeight           // Destination rectangle
		);
		console.log('📸 Cropped image drawn to canvas successfully');
	} catch (error) {
		console.error('❌ Failed to draw cropped image to canvas:', error);
		return null;
	}
	
	return new Promise(resolve => {
		canvas.toBlob((blob) => {
			console.log('📸 Canvas.toBlob result:', !!blob, blob?.size);
			resolve(blob);
		}, 'image/jpeg', 0.8);
	});
}

// Camera initialization - hidden for main experience
export async function initializeCamera() {
	try {
		const cameraStream = await navigator.mediaDevices.getUserMedia({ 
			video: { facingMode: 'user', width: 1280, height: 720 } 
		});
		
		// Create video element for photo capture - hidden but functional
		const videoElement = document.createElement('video');
		videoElement.srcObject = cameraStream;
		videoElement.autoplay = true;
		videoElement.muted = true;
		videoElement.style.position = 'absolute';
		videoElement.style.top = '0';
		videoElement.style.left = '0';
		videoElement.style.width = '1280px';
		videoElement.style.height = '720px';
		videoElement.style.visibility = 'hidden';
		videoElement.style.pointerEvents = 'none';
		videoElement.style.zIndex = '-1';
		
		// Append hidden video to body for photo capture functionality
		document.body.appendChild(videoElement);
		
		console.log('Camera initialized successfully (hidden but functional for photo capture)');
		
		return { cameraStream, videoElement };
	} catch (error) {
		console.warn('Camera initialization failed:', error);
		return { cameraStream: null, videoElement: null };
	}
}

// Logo animation setup with waveform visualization
export function setupLogoAnimation(audioStream) {
	const logo = document.querySelector('.logo');
	if (!logo) return;
	
	// Create wrapper div to hold both logo and heart
	const logoWrapper = document.createElement('div');
	logoWrapper.style.position = 'relative';
	logoWrapper.style.display = 'inline-block';
	
	// Move logo into wrapper
	logo.parentNode.insertBefore(logoWrapper, logo);
	logoWrapper.appendChild(logo);
	
	// Create animated heart element
	const heart = document.createElement('div');
	heart.innerHTML = '♥';
	heart.style.position = 'absolute';
	heart.style.color = '#FF4444';
	heart.style.fontSize = '50px';
	heart.style.fontWeight = 'bold';
	heart.style.left = '28%';
	heart.style.top = '28%';
	heart.style.transform = 'translate(-50%, -50%)';
	heart.style.transformOrigin = 'center';
	heart.style.pointerEvents = 'none';
	heart.style.zIndex = '1000';
	heart.style.textShadow = '0 0 10px rgba(255, 68, 68, 0.8)';
	
	// Add heart to wrapper (sibling of logo)
	logoWrapper.appendChild(heart);
	
	console.log('Heart element added to logo wrapper');
	
	// Create prominent waveform visualization
	createWaveformVisualization(audioStream);
	
	const audioContext = new AudioContext();
	const source = audioContext.createMediaStreamSource(audioStream);
	const analyser = audioContext.createAnalyser();
	
	analyser.fftSize = 256;
	source.connect(analyser);
	
	const dataArray = new Uint8Array(analyser.frequencyBinCount);
	
	function animate() {
		analyser.getByteFrequencyData(dataArray);
		
		// Calculate average amplitude
		const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
		
		// Scale amplitude to a more subtle range (1.0 to 1.3) - same minimum, less growth at max
		const scale = 1 + (average / 255) * 0.3;
		
		// Animate only the heart overlay
		heart.style.transform = `translate(-50%, -50%) scale(${scale})`;
		heart.style.transition = 'transform 0.05s ease-out';
		
		requestAnimationFrame(animate);
	}
	
	animate();
	console.log('Heart-only animation setup complete');
}

// Create prominent waveform visualization for AI speech feedback
function createWaveformVisualization(audioStream) {
	console.log('🌊 Creating waveform visualization for AI speech feedback');
	
	// Create waveform container
	const waveformContainer = document.createElement('div');
	waveformContainer.id = 'waveform-container';
	waveformContainer.style.position = 'fixed';
	waveformContainer.style.top = '50%';
	waveformContainer.style.left = '50%';
	waveformContainer.style.transform = 'translate(-50%, -50%)';
	waveformContainer.style.width = '720px';
	waveformContainer.style.height = '150px';
	waveformContainer.style.background = 'rgba(0, 0, 0, 0.8)';
	waveformContainer.style.borderRadius = '20px';
	waveformContainer.style.border = '2px solid #FFD400';
	waveformContainer.style.backdropFilter = 'blur(10px)';
	waveformContainer.style.boxShadow = '0 8px 32px rgba(255, 212, 0, 0.3)';
	waveformContainer.style.display = 'flex';
	waveformContainer.style.alignItems = 'center';
	waveformContainer.style.justifyContent = 'center';
	waveformContainer.style.padding = '20px';
	waveformContainer.style.zIndex = '1000';
	waveformContainer.style.opacity = '0';
	waveformContainer.style.transition = 'opacity 0.5s ease-in-out';
	
	// Create waveform bars container
	const barsContainer = document.createElement('div');
	barsContainer.style.display = 'flex';
	barsContainer.style.alignItems = 'center';
	barsContainer.style.justifyContent = 'center';
	barsContainer.style.gap = '5px';
	barsContainer.style.height = '100px';
	
	// Create individual waveform bars
	const numBars = 32;
	const bars = [];
	
	for (let i = 0; i < numBars; i++) {
		const bar = document.createElement('div');
		bar.style.width = '14px';
		bar.style.minHeight = '7px';
		bar.style.height = '7px';
		bar.style.background = 'linear-gradient(to top, #FFD400, #FFA500)';
		bar.style.borderRadius = '4px';
		bar.style.transition = 'height 0.1s ease-out';
		bar.style.boxShadow = '0 0 8px rgba(255, 212, 0, 0.5)';
		bars.push(bar);
		barsContainer.appendChild(bar);
	}
	
	// Add AI speaking indicator text
	const speakingText = document.createElement('div');
	speakingText.textContent = 'Prio está falando...';
	speakingText.style.position = 'absolute';
	speakingText.style.top = '15px';
	speakingText.style.left = '50%';
	speakingText.style.transform = 'translateX(-50%)';
	speakingText.style.color = '#FFD400';
	speakingText.style.fontSize = '14px';
	speakingText.style.fontWeight = '600';
	speakingText.style.fontFamily = 'Inter, sans-serif';
	speakingText.style.textShadow = '0 0 10px rgba(255, 212, 0, 0.8)';
	
	waveformContainer.appendChild(speakingText);
	waveformContainer.appendChild(barsContainer);
	document.body.appendChild(waveformContainer);
	
	// Set up audio analysis for waveform
	const audioContext = new AudioContext();
	const source = audioContext.createMediaStreamSource(audioStream);
	const analyser = audioContext.createAnalyser();
	
	analyser.fftSize = 128; // Smaller for more responsive bars
	analyser.smoothingTimeConstant = 0.8;
	source.connect(analyser);
	
	const dataArray = new Uint8Array(analyser.frequencyBinCount);
	let isVisible = false;
	let lastActivityTime = 0;
	const ACTIVITY_THRESHOLD = 15; // Minimum audio level to show waveform
	const HIDE_DELAY = 2000; // Hide after 2 seconds of silence
	
	function animateWaveform() {
		analyser.getByteFrequencyData(dataArray);
		
		// Calculate current audio activity
		const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
		const hasActivity = average > ACTIVITY_THRESHOLD;
		
		if (hasActivity) {
			lastActivityTime = Date.now();
			
			// Show waveform if hidden
			if (!isVisible) {
				isVisible = true;
				waveformContainer.style.opacity = '1';
				console.log('🌊 Waveform visible - AI is speaking');
			}
			
			// Update each bar with frequency data
			bars.forEach((bar, index) => {
				// Map bar index to frequency data (spread across available data)
				const dataIndex = Math.floor((index / numBars) * dataArray.length);
				const value = dataArray[dataIndex] || 0;
				
				// Scale height based on frequency amplitude (4px to 80px)
				const height = Math.max(4, (value / 255) * 76 + 4);
				bar.style.height = `${height}px`;
				
				// Add subtle color variation based on frequency
				const intensity = value / 255;
				const hue = 45 + (intensity * 15); // Yellow to orange range
				bar.style.background = `linear-gradient(to top, hsl(${hue}, 100%, 50%), hsl(${hue}, 100%, 65%))`;
				bar.style.boxShadow = `0 0 ${8 + intensity * 12}px hsla(${hue}, 100%, 50%, ${0.5 + intensity * 0.3})`;
			});
		} else {
			// Hide waveform after delay if no activity
			if (isVisible && Date.now() - lastActivityTime > HIDE_DELAY) {
				isVisible = false;
				waveformContainer.style.opacity = '0';
				console.log('🌊 Waveform hidden - AI stopped speaking');
				
				// Reset bars to minimum height
				bars.forEach(bar => {
					bar.style.height = '4px';
					bar.style.background = 'linear-gradient(to top, #FFD400, #FFA500)';
					bar.style.boxShadow = '0 0 8px rgba(255, 212, 0, 0.5)';
				});
			}
		}
		
		requestAnimationFrame(animateWaveform);
	}
	
	animateWaveform();
	console.log('🌊 Waveform visualization setup complete');
}


// Session image counter - shared across all calls
let sessionImageCount = 0;

// Reset counter function - called from script.js when session resets
export function resetSessionImageCount() {
	sessionImageCount = 0;
	console.log('📊 Session Image Count reset to 0 for new session');
}

// Get current session image count - used by script.js to check before function calls
export function getSessionImageCount() {
	return sessionImageCount;
}

// Generate image function
export async function generateImage({ prompt: userPrompt, width = 1024, height = 1024 }, videoElement, cameraStream) {
	console.log('🎬 generateImage() called with params:', { prompt: userPrompt.substring(0, 50) + '...', width, height });
	console.log('📷 Video element available:', !!videoElement);
	console.log('📹 Camera stream available:', !!cameraStream);
	
	// Check if we've already generated an image this session
	if (sessionImageCount >= 1) {
		console.log('🚫 Image generation blocked - already generated 1 image this session');
		return { 
			success: false, 
			error: 'Only one image allowed per session',
			imageCount: sessionImageCount 
		};
	}
	
	// Increment and log session image counter
	sessionImageCount++;
	console.log(`📊 Session Image Count: ${sessionImageCount}`);
	
	// End the current session immediately when image generation starts
	console.log('🏁 Ending current session - calling /api/end-session');
	try {
		const endSessionResponse = await fetch('/api/end-session', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		
		if (endSessionResponse.ok) {
			console.log('✅ Session ended successfully');
			// Show persistent collection message immediately
			showCollectionMessage(userPrompt);
		} else {
			console.error('❌ Failed to end session:', endSessionResponse.status);
		}
	} catch (error) {
		console.error('❌ Error ending session:', error);
	}
	
	if (!userPrompt) {
		throw new Error('prompt is required for image generation');
	}
	
	try {
		// Capture photo from already-open camera
		let photoBlob = null;
		if (videoElement && cameraStream) {
			console.log('📸 Attempting to capture photo from video element...');
			photoBlob = await capturePhotoFromVideo(videoElement);
			console.log('📸 Photo capture result:', !!photoBlob, photoBlob ? `${photoBlob.size} bytes` : 'null');
			
			// Keep camera running for potential future captures
			console.log('📹 Camera remains active for future use');
		} else {
			console.log('⚠️ No camera available - will use fallback image generation');
		}
		
		console.log('🌐 Sending image generation request with params:', {
			prompt: userPrompt, width, height, hasPhoto: !!photoBlob
		});
		
		// In controlled environment, camera is always available - no fallback needed
		if (!photoBlob) {
			throw new Error('Camera not available - required for controlled installation');
		}
		
		console.log('📤 Using photo edit API with captured photo');
		const formData = new FormData();
		formData.append('image', photoBlob, 'photo.jpg');
		formData.append('prompt', userPrompt);
		formData.append('size', '1024x1536');
		
		// First test if server is responding
		console.log('🧪 Testing server connectivity...');
		try {
			const testResponse = await fetch('/test');
			console.log('🧪 Server test response:', testResponse.status, testResponse.statusText);
			const testData = await testResponse.json();
			console.log('🧪 Server test data:', testData);
		} catch (testError) {
			console.error('🧪 Server connectivity test failed:', testError);
		}
		
		console.log('🌐 Making POST request to /edit-image...');
		console.log('📤 FormData contents:');
		for (let [key, value] of formData.entries()) {
			if (value instanceof File) {
				console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
			} else {
				console.log(`  ${key}: ${typeof value === 'string' ? value.substring(0, 100) + '...' : value}`);
			}
		}
		
		// Add timeout to the fetch request
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			console.error('⏰ Request timeout after 2 minutes');
			controller.abort();
		}, 120000); // 2 minute timeout
		
		let response;
		try {
			response = await fetch('/edit-image', {
				method: 'POST',
				body: formData,
				signal: controller.signal
			});
			clearTimeout(timeoutId);
		} catch (fetchError) {
			clearTimeout(timeoutId);
			console.error('🚫 Fetch error:', fetchError);
			console.error('🚫 Error name:', fetchError.name);
			console.error('🚫 Error message:', fetchError.message);
			throw new Error(`Network error: ${fetchError.message}`);
		}
		
		console.log('📥 Response received from /edit-image:', response.status, response.statusText);
		console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
		
		let result;
		try {
			const responseText = await response.text();
			console.log('📄 Raw response text (first 500 chars):', responseText.substring(0, 500));
			result = JSON.parse(responseText);
			console.log('📄 Parsed response data:', result);
		} catch (parseError) {
			console.error('📄 Failed to parse response as JSON:', parseError);
			throw new Error('Invalid response format from server');
		}
		
		if (!response.ok) {
			throw new Error(result.error || 'Failed to generate personalized image');
		}
		
		addImageToPage(result.output, userPrompt);
		
		return { success: true, output: result.output };
	} catch (error) {
		console.error('💥 Error in generateImage:', error);
		console.error('💥 Error message:', error.message);
		console.error('💥 Error stack:', error.stack);
		throw error;
	}
}


// Show persistent collection message (no auto-reload)
export function showCollectionMessage(userPrompt = '') {
	console.log('📢 showCollectionMessage() called - showing persistent collection message');
	console.log('📢 Received prompt:', userPrompt ? userPrompt.substring(0, 50) + '...' : 'No prompt provided');
	
	// Remove any existing completion messages
	const existingMessage = document.getElementById('completion-message');
	if (existingMessage) {
		existingMessage.remove();
		console.log('🗑️ Existing completion message removed');
	}
	
	// Create persistent collection message
	const contentDiv = document.querySelector('.content');
	if (contentDiv) {
		const collectionMessage = document.createElement('div');
		collectionMessage.id = 'collection-message';
		collectionMessage.style.backgroundColor = 'rgba(255, 212, 0, 0.95)';
		collectionMessage.style.color = '#000';
		collectionMessage.style.padding = '30px 40px';
		collectionMessage.style.borderRadius = '12px';
		collectionMessage.style.textAlign = 'center';
		collectionMessage.style.fontSize = '20px';
		collectionMessage.style.fontWeight = '600';
		collectionMessage.style.fontFamily = 'Inter, sans-serif';
		collectionMessage.style.margin = '20px auto 0 auto'; /* Remove bottom margin to prevent waveform overlap */
		collectionMessage.style.maxWidth = '600px';
		collectionMessage.style.boxShadow = '0 4px 20px rgba(255, 212, 0, 0.3)';
		collectionMessage.style.border = '2px solid #000';
		const promptDisplay = userPrompt ? `<div style="font-size: 14px; font-weight: 400; margin-top: 15px; padding: 15px; background: rgba(0,0,0,0.1); border-radius: 8px; text-align: left; line-height: 1.4;"><strong>Prompt:</strong> ${userPrompt}</div>` : '';
		collectionMessage.innerHTML = `🎨 <strong>Sua arte está sendo criada!</strong><br><span style="font-size: 18px; font-weight: 400; margin-top: 10px; display: block;">Vá para a tela externa buscar sua obra de arte personalizada</span>${promptDisplay}`;
		
		// Add to content div
		contentDiv.appendChild(collectionMessage);
		console.log('✅ Persistent collection message added to page');
	} else {
		console.error('❌ Content div not found - cannot add collection message');
	}
	
	console.log('📱 Session completed - showing persistent message (no reload)');
}

// WebRTC connection management
export function closeConnection(peerConnection, connectionTimeout) {
	let isConnectionClosed = false;
	
	return function() {
		if (isConnectionClosed) return;
		
		isConnectionClosed = true;
		peerConnection.close();
		
		// Clear any existing timeout
		if (connectionTimeout) {
			clearTimeout(connectionTimeout);
		}
		
		// Remove audio element if it exists
		const audioElement = document.querySelector('audio');
		if (audioElement) {
			audioElement.remove();
		}
		
		// Show closure message in place of audio element
		const messageDiv = document.createElement('div');
		messageDiv.id = 'session-timeout-message'; // Add ID for cleanup
		messageDiv.style.display = 'block';
		messageDiv.style.margin = '15px auto';
		messageDiv.style.maxWidth = '400px';
		messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
		messageDiv.style.color = '#fff';
		messageDiv.style.padding = '20px 30px';
		messageDiv.style.borderRadius = '12px';
		messageDiv.style.textAlign = 'center';
		messageDiv.style.fontSize = '16px';
		messageDiv.style.border = '1px solid rgba(255, 255, 255, 0.2)';
		messageDiv.style.backdropFilter = 'blur(10px)';
		messageDiv.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
		messageDiv.innerHTML = `
			<h3 style="margin: 0 0 10px 0; color: #FFD400; font-size: 18px;">Sessão Encerrada</h3>
			<p style="margin: 0; font-size: 14px; line-height: 1.4;">Sua conversa com Prio foi encerrada após 5 minutos.<br>
			Recarregue a página para uma nova sessão.</p>
		`;
		
		// Insert in the same place where audio element was
		const contentDiv = document.querySelector('.content');
		if (contentDiv) {
			contentDiv.appendChild(messageDiv);
		} else {
			document.body.appendChild(messageDiv);
		}
		
		console.log('Connection closed after 5 minutes');
	};
}

// Test button for manual image generation testing
export function addTestButton() {
	const testButton = document.createElement('button');
	testButton.textContent = 'GERAR AGORA';
	testButton.style.position = 'fixed';
	testButton.style.top = '15px';
	testButton.style.right = '15px';
	testButton.style.zIndex = '9999';
	testButton.style.padding = '12px 20px';
	testButton.style.background = 'linear-gradient(135deg, #00B4D8, #0077B6)';
	testButton.style.color = '#fff';
	testButton.style.border = '2px solid rgba(255, 255, 255, 0.2)';
	testButton.style.borderRadius = '12px';
	testButton.style.cursor = 'pointer';
	testButton.style.fontWeight = '700';
	testButton.style.fontFamily = 'Inter, sans-serif';
	testButton.style.fontSize = '14px';
	testButton.style.letterSpacing = '0.05em';
	testButton.style.textTransform = 'uppercase';
	testButton.style.backdropFilter = 'blur(10px)';
	testButton.style.boxShadow = '0 4px 16px rgba(0, 180, 216, 0.3)';
	testButton.style.transition = 'all 0.3s ease';
	
	testButton.onclick = async () => {
		try {
			console.log('🚀 TEST BUTTON CLICKED - Starting image generation flow...');
			
			if (window.fns && window.fns.generateImage) {
				const testPrompt = 'Test image generation - creating a vibrant artistic portrait with Rio de Janeiro backdrop';
				console.log('🎯 Starting test image generation with prompt:', testPrompt);
				console.log('📷 Camera available:', !!window.videoElement, !!window.cameraStream);
				
				// Call generateImage directly - counter logic is now inside the function
				const result = await generateImage({
					prompt: testPrompt,
					width: 1024,
					height: 1024
				}, window.videoElement, window.cameraStream);
				
				console.log('✅ Test generation completed successfully:', result);
			} else {
				console.error('❌ generateImage function not available - window.fns:', window.fns);
				console.error('❌ Make sure the agent is initialized');
			}
		} catch (error) {
			console.error('💥 Test generation failed with error:', error);
			console.error('💥 Error stack:', error.stack);
		}
	};
	
	// Add hover effect
	testButton.onmouseenter = () => {
		testButton.style.transform = 'translateY(-2px)';
		testButton.style.boxShadow = '0 6px 20px rgba(0, 180, 216, 0.4)';
	};
	testButton.onmouseleave = () => {
		testButton.style.transform = 'translateY(0)';
		testButton.style.boxShadow = '0 4px 16px rgba(0, 180, 216, 0.3)';
	};
	
	document.body.appendChild(testButton);
}

// Session reset button for debugging purposes
export function addSessionResetButton() {
	const resetButton = document.createElement('button');
	resetButton.textContent = 'RESET SESSION';
	resetButton.style.position = 'fixed';
	resetButton.style.top = '15px';
	resetButton.style.left = '15px';
	resetButton.style.zIndex = '9999';
	resetButton.style.padding = '12px 20px';
	resetButton.style.background = 'linear-gradient(135deg, #FFD400, #FFA500)';
	resetButton.style.color = '#000';
	resetButton.style.border = '2px solid rgba(255, 212, 0, 0.3)';
	resetButton.style.borderRadius = '12px';
	resetButton.style.cursor = 'pointer';
	resetButton.style.fontWeight = '700';
	resetButton.style.fontFamily = 'Inter, sans-serif';
	resetButton.style.fontSize = '14px';
	resetButton.style.letterSpacing = '0.05em';
	resetButton.style.textTransform = 'uppercase';
	resetButton.style.backdropFilter = 'blur(10px)';
	resetButton.style.boxShadow = '0 4px 16px rgba(255, 212, 0, 0.3)';
	resetButton.style.transition = 'all 0.3s ease';
	
	resetButton.onclick = async () => {
		try {
			console.log('🔄 SESSION RESET BUTTON CLICKED - Starting new session...');
			
			// Disable button during request
			resetButton.disabled = true;
			resetButton.textContent = 'RESETTING...';
			resetButton.style.opacity = '0.6';
			
			// Call the start-session API endpoint (same as admin page)
			const response = await fetch('/api/start-session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				}
			});
			
			if (!response.ok) {
				throw new Error(`Failed to start session: ${response.status}`);
			}
			
			const result = await response.json();
			console.log('✅ New session started successfully:', result);
			
			// Reset button state
			resetButton.disabled = false;
			resetButton.textContent = 'RESET SESSION';
			resetButton.style.opacity = '1';
			
			// Clear any existing session timeout messages immediately
			const timeoutMessage = document.getElementById('session-timeout-message');
			if (timeoutMessage) {
				timeoutMessage.remove();
				console.log('🗑️ Session timeout message cleared by reset button');
			}
			
			// The session polling in script.js will detect the new session and reset WebRTC
			
		} catch (error) {
			console.error('💥 Session reset failed:', error);
			
			// Reset button state on error
			resetButton.disabled = false;
			resetButton.textContent = 'RESET SESSION';
			resetButton.style.opacity = '1';
			
			// Show error feedback
			resetButton.textContent = 'ERROR - RETRY';
			resetButton.style.background = 'linear-gradient(135deg, #FF6B6B, #FF4444)';
			resetButton.style.color = '#fff';
			
			// Reset to normal after 3 seconds
			setTimeout(() => {
				resetButton.textContent = 'RESET SESSION';
				resetButton.style.background = 'linear-gradient(135deg, #FFD400, #FFA500)';
				resetButton.style.color = '#000';
			}, 3000);
		}
	};
	
	// Add hover effect
	resetButton.onmouseenter = () => {
		resetButton.style.transform = 'translateY(-2px)';
		resetButton.style.boxShadow = '0 6px 20px rgba(255, 212, 0, 0.4)';
	};
	resetButton.onmouseleave = () => {
		resetButton.style.transform = 'translateY(0)';
		resetButton.style.boxShadow = '0 4px 16px rgba(255, 212, 0, 0.3)';
	};
	
	document.body.appendChild(resetButton);
}

// Add debug navigation buttons for development
export function addDebugNavButtons() {
	const buttonContainer = document.createElement('div');
	buttonContainer.style.position = 'fixed';
	buttonContainer.style.bottom = '15px';
	buttonContainer.style.right = '15px';
	buttonContainer.style.display = 'flex';
	buttonContainer.style.flexDirection = 'column';
	buttonContainer.style.gap = '10px';
	buttonContainer.style.zIndex = '9998';

	const buttons = [
		{ text: 'ADMIN', url: '/admin.html', color: '#FFD400' },
		{ text: 'CAROUSEL', url: '/carousel.html', color: '#00FF88' }
	];

	buttons.forEach(({ text, url, color }) => {
		const button = document.createElement('a');
		button.href = url;
		button.target = '_blank';
		button.textContent = text;
		button.style.display = 'block';
		button.style.padding = '8px 16px';
		button.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
		button.style.color = color === '#FFD400' ? '#000' : '#fff';
		button.style.border = '2px solid rgba(255, 255, 255, 0.2)';
		button.style.borderRadius = '8px';
		button.style.textDecoration = 'none';
		button.style.fontWeight = '600';
		button.style.fontFamily = 'Inter, sans-serif';
		button.style.fontSize = '12px';
		button.style.textAlign = 'center';
		button.style.cursor = 'pointer';
		button.style.transition = 'all 0.2s ease';
		button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';

		// Hover effects
		button.onmouseenter = () => {
			button.style.transform = 'translateY(-1px)';
			button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
		};
		button.onmouseleave = () => {
			button.style.transform = 'translateY(0)';
			button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
		};

		buttonContainer.appendChild(button);
	});

	document.body.appendChild(buttonContainer);
}

