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
	
	// Auto-print if it's a shareable URL (not base64) and in kiosk mode
	if (url && !url.startsWith('data:')) {
		// Check if we're in kiosk mode by looking for kiosk-specific indicators
		const isKioskMode = window.navigator.userAgent.includes('Chrome') && 
						   (window.outerHeight === window.screen.height || 
							document.fullscreenElement !== null);
		
		console.log('🖨️ Kiosk mode check - isKioskMode:', isKioskMode, 'userAgent:', window.navigator.userAgent);
		
		if (isKioskMode) {
			console.log('🖨️ Kiosk mode detected - auto-printing image:', url);
			// Small delay to ensure image is fully loaded
			setTimeout(() => printImageDirect(url), 1500);
		} else {
			console.log('🖨️ Not in kiosk mode - skipping auto-print');
		}
	} else {
		console.log('🖨️ Skipping auto-print - URL is base64 or empty:', url?.substring(0, 50));
	}
	
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
	
	const canvas = document.createElement('canvas');
	canvas.width = videoElement.videoWidth;
	canvas.height = videoElement.videoHeight;
	const ctx = canvas.getContext('2d');
	
	console.log('📸 Canvas created:', { width: canvas.width, height: canvas.height });
	
	try {
		ctx.drawImage(videoElement, 0, 0);
		console.log('📸 Image drawn to canvas successfully');
	} catch (error) {
		console.error('❌ Failed to draw image to canvas:', error);
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

// Logo animation setup
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
	heart.style.fontSize = '66px';
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
		
		// Scale amplitude to a more subtle range (1.0 to 2.0)
		const scale = 1 + (average / 255) * 1.0;
		
		// Animate only the heart overlay
		heart.style.transform = `translate(-50%, -50%) scale(${scale})`;
		heart.style.transition = 'transform 0.05s ease-out';
		
		requestAnimationFrame(animate);
	}
	
	animate();
	console.log('Heart-only animation setup complete');
}


// Generate image function
export async function generateImage({ prompt, width = 1024, height = 1024 }, videoElement, cameraStream) {
	console.log('🎬 generateImage() called with params:', { prompt: prompt.substring(0, 50) + '...', width, height });
	console.log('📷 Video element available:', !!videoElement);
	console.log('📹 Camera stream available:', !!cameraStream);
	
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
			showCollectionMessage();
		} else {
			console.error('❌ Failed to end session:', endSessionResponse.status);
		}
	} catch (error) {
		console.error('❌ Error ending session:', error);
	}
	
	if (!prompt) {
		throw new Error('prompt is required for image generation');
	}
	
	try {
		// Capture photo from already-open camera
		let photoBlob = null;
		if (videoElement && cameraStream) {
			console.log('📸 Attempting to capture photo from video element...');
			photoBlob = await capturePhotoFromVideo(videoElement);
			console.log('📸 Photo capture result:', !!photoBlob, photoBlob ? `${photoBlob.size} bytes` : 'null');
			
			// Stop all camera tracks (video element is already hidden)
			console.log('🛑 Stopping camera tracks...');
			cameraStream.getTracks().forEach(track => {
				track.stop();
				console.log('🛑 Camera track stopped:', track.kind);
			});
			
			console.log('✅ Camera stopped after photo capture (video element already hidden)');
		} else {
			console.log('⚠️ No camera available - will use fallback image generation');
		}
		
		console.log('🌐 Sending image generation request with params:', {
			prompt, width, height, hasPhoto: !!photoBlob
		});
		
		// In controlled environment, camera is always available - no fallback needed
		if (!photoBlob) {
			throw new Error('Camera not available - required for controlled installation');
		}
		
		console.log('📤 Using photo edit API with captured photo');
		const formData = new FormData();
		formData.append('image', photoBlob, 'photo.jpg');
		formData.append('prompt', prompt);
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
		
		addImageToPage(result.output, prompt);
		
		return { success: true, output: result.output };
	} catch (error) {
		console.error('💥 Error in generateImage:', error);
		console.error('💥 Error message:', error.message);
		console.error('💥 Error stack:', error.stack);
		throw error;
	}
}


// Show persistent collection message (no auto-reload)
export function showCollectionMessage() {
	console.log('📢 showCollectionMessage() called - showing persistent collection message');
	
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
		collectionMessage.style.margin = '20px auto';
		collectionMessage.style.maxWidth = '600px';
		collectionMessage.style.boxShadow = '0 4px 20px rgba(255, 212, 0, 0.3)';
		collectionMessage.style.border = '2px solid #000';
		collectionMessage.innerHTML = '🎨 <strong>Sua arte está sendo criada!</strong><br><span style="font-size: 18px; font-weight: 400; margin-top: 10px; display: block;">Vá para a tela externa buscar sua obra de arte personalizada</span>';
		
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
				
				const result = await window.fns.generateImage({
					prompt: testPrompt,
					width: 1024,
					height: 1024
				});
				
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
		{ text: 'GALLERY', url: '/gallery.html', color: '#00B4D8' },
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

