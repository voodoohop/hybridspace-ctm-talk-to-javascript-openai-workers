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
	
	// Just add a simple message to the existing content area
	const contentDiv = document.querySelector('.content');
	console.log('📝 Content div found:', !!contentDiv);
	
	if (contentDiv) {
		// Create simple completion message
		const completionMessage = document.createElement('div');
		completionMessage.id = 'completion-message';
		completionMessage.style.backgroundColor = 'rgba(255, 212, 0, 0.95)';
		completionMessage.style.color = '#000';
		completionMessage.style.padding = '20px 30px';
		completionMessage.style.borderRadius = '12px';
		completionMessage.style.textAlign = 'center';
		completionMessage.style.fontSize = '18px';
		completionMessage.style.fontWeight = '600';
		completionMessage.style.fontFamily = 'Inter, sans-serif';
		completionMessage.style.margin = '20px auto';
		completionMessage.style.maxWidth = '500px';
		completionMessage.style.boxShadow = '0 4px 20px rgba(255, 212, 0, 0.3)';
		completionMessage.style.border = '2px solid #000';
		completionMessage.innerHTML = '✨ <strong>Sua arte foi criada!</strong><br><span style="font-size: 16px; font-weight: 400;">Dirija-se à tela externa para ver e imprimir</span>';
		
		// Add to content div
		contentDiv.appendChild(completionMessage);
		console.log('✅ Completion message added to page');
	} else {
		console.error('❌ Content div not found - cannot add completion message');
	}
	
	// Log that image was generated but not displayed on main screen
	console.log('✅ Image generated successfully:', url);
	console.log('📱 Simple completion message added - no overlay, original interface intact');
	console.log('🖥️ Image available on external screen at /carousel.html?latest=true');
	
	
	return null; // No container to return since we're not creating an overlay
}


// Camera utilities
export async function capturePhotoFromVideo(videoElement) {
	if (!videoElement) return null;
	
	const canvas = document.createElement('canvas');
	canvas.width = videoElement.videoWidth;
	canvas.height = videoElement.videoHeight;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(videoElement, 0, 0);
	
	return new Promise(resolve => {
		canvas.toBlob(resolve, 'image/jpeg', 0.8);
	});
}

// Camera initialization - hidden for main experience
export async function initializeCamera() {
	try {
		const cameraStream = await navigator.mediaDevices.getUserMedia({ 
			video: { facingMode: 'user', width: 1280, height: 720 } 
		});
		
		// Create hidden video element for photo capture only
		const videoElement = document.createElement('video');
		videoElement.srcObject = cameraStream;
		videoElement.autoplay = true;
		videoElement.muted = true;
		videoElement.style.position = 'absolute';
		videoElement.style.top = '-9999px';
		videoElement.style.left = '-9999px';
		videoElement.style.width = '1px';
		videoElement.style.height = '1px';
		videoElement.style.opacity = '0';
		videoElement.style.pointerEvents = 'none';
		
		// Append hidden video to body for photo capture functionality
		document.body.appendChild(videoElement);
		
		console.log('Camera initialized successfully (hidden for main experience)');
		
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
	
	// Start the reset timer immediately when image generation begins
	console.log('🚀 AUTO-RESET TIMEOUT STARTING NOW - 10 seconds until reset');
	setTimeout(() => {
		console.log('⏰ 10-second timeout reached - calling resetForNextUser()');
		resetForNextUser();
	}, 10000);
	
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
		
		console.log('🌐 Making POST request to /edit-image...');
		const response = await fetch('/edit-image', {
			method: 'POST',
			body: formData
		});
		
		console.log('📥 Response received from /edit-image:', response.status, response.statusText);
		const result = await response.json();
		console.log('📄 Response data:', result);
		
		if (!response.ok) {
			throw new Error(result.error || 'Failed to generate personalized image');
		}
		
		addImageToPage(result.output, prompt);
		
		return { success: true, output: result.output };
	} catch (error) {
		console.error('Error in generateImage:', error);
		throw error;
	}
}


// Reset interface for next user
export function resetForNextUser() {
	console.log('🔄 resetForNextUser() called - starting interface reset');
	
	// Remove any completion messages
	const completionMessage = document.getElementById('completion-message');
	if (completionMessage) {
		completionMessage.remove();
		console.log('🗑️ Completion message removed');
	} else {
		console.log('🗑️ No completion message found to remove');
	}
	
	// Restore main content div
	const contentDiv = document.querySelector('.content');
	if (contentDiv) {
		contentDiv.style.display = 'flex';
		console.log('📱 Content div display restored to flex');
	} else {
		console.error('❌ Content div not found during reset');
	}
	
	// Remove any session messages
	const existingMessages = document.querySelectorAll('[data-session-message]');
	console.log('🗑️ Found', existingMessages.length, 'existing session messages to remove');
	existingMessages.forEach(msg => msg.remove());
	
	// Show reset message briefly
	console.log('📢 Creating reset notification message');
	const resetMessage = document.createElement('div');
	resetMessage.setAttribute('data-session-message', 'true');
	resetMessage.style.position = 'fixed';
	resetMessage.style.top = '20px';
	resetMessage.style.left = '50%';
	resetMessage.style.transform = 'translateX(-50%)';
	resetMessage.style.backgroundColor = 'rgba(0, 180, 216, 0.9)';
	resetMessage.style.color = '#fff';
	resetMessage.style.padding = '10px 20px';
	resetMessage.style.borderRadius = '8px';
	resetMessage.style.fontSize = '14px';
	resetMessage.style.fontWeight = '600';
	resetMessage.style.zIndex = '9999';
	resetMessage.style.backdropFilter = 'blur(10px)';
	resetMessage.textContent = 'Pronto para o próximo usuário';
	document.body.appendChild(resetMessage);
	console.log('📢 Reset notification message added to page');
	
	// Reload the page after showing the reset message to fully reset the WebRTC connection
	setTimeout(() => {
		console.log('🔄 Reloading page to fully reset WebRTC connection and interface');
		window.location.reload();
	}, 1500); // Give time to see the reset message
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

