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

// Image display and UI helpers
export function addImageToPage(url, prompt = '') {
	// Hide all other elements
	const contentDiv = document.querySelector('.content');
	if (contentDiv) contentDiv.style.display = 'none';
	
	// Auto-print if it's a shareable URL (not base64) and in kiosk mode
	if (url && !url.startsWith('data:')) {
		// Check if we're in kiosk mode by looking for kiosk-specific indicators
		const isKioskMode = window.navigator.userAgent.includes('Chrome') && 
						   (window.outerHeight === window.screen.height || 
							document.fullscreenElement !== null);
		
		if (isKioskMode) {
			console.log('Kiosk mode detected - auto-printing image:', url);
			// Small delay to ensure image is fully loaded
			setTimeout(() => printImageDirect(url), 1500);
		}
	}
	
	// Create fullscreen image container
	const fullscreenContainer = document.createElement('div');
	fullscreenContainer.id = 'fullscreen-image-container';
	fullscreenContainer.style.position = 'fixed';
	fullscreenContainer.style.top = '0';
	fullscreenContainer.style.left = '0';
	fullscreenContainer.style.width = '100vw';
	fullscreenContainer.style.height = '100vh';
	fullscreenContainer.style.background = 'linear-gradient(135deg, #00B4D8 0%, #0077B6 50%, #023E8A 100%)';
	fullscreenContainer.style.display = 'flex';
	fullscreenContainer.style.flexDirection = 'column';
	fullscreenContainer.style.alignItems = 'center';
	fullscreenContainer.style.justifyContent = 'flex-start';
	fullscreenContainer.style.overflowY = 'auto';
	fullscreenContainer.style.padding = '20px 0';
	fullscreenContainer.style.zIndex = '2000';
	
	// Add dotted pattern overlay
	fullscreenContainer.style.position = 'relative';
	const patternOverlay = document.createElement('div');
	patternOverlay.style.position = 'absolute';
	patternOverlay.style.top = '0';
	patternOverlay.style.left = '0';
	patternOverlay.style.width = '100%';
	patternOverlay.style.height = '100%';
	patternOverlay.style.backgroundImage = 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)';
	patternOverlay.style.backgroundSize = '20px 20px';
	patternOverlay.style.pointerEvents = 'none';
	patternOverlay.style.zIndex = '1';
	fullscreenContainer.appendChild(patternOverlay);
	
	// Create image element
	const img = document.createElement('img');
	img.onerror = (error) => {
		console.error('Failed to load image:', error);
		fullscreenContainer.innerHTML = '<div style="color: red; font-size: 24px;">Failed to load the generated image. Please try again.</div>';
	};
	img.src = url;
	img.alt = `Generated image for prompt: ${prompt}`;
	img.style.maxWidth = '90vw';
	img.style.maxHeight = '60vh';
	img.style.width = 'auto';
	img.style.height = 'auto';
	img.style.objectFit = 'contain';
	img.style.marginTop = '20px';
	img.style.borderRadius = '12px';
	img.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
	img.style.position = 'relative';
	img.style.zIndex = '2';
	
	// Create prompt text underneath image
	const promptText = document.createElement('div');
	promptText.style.fontSize = '16px';
	promptText.style.color = 'rgba(255, 255, 255, 0.9)';
	promptText.style.textAlign = 'center';
	promptText.style.maxWidth = '80vw';
	promptText.style.marginTop = '15px';
	promptText.style.fontFamily = 'Inter, sans-serif';
	promptText.style.fontWeight = '400';
	promptText.style.lineHeight = '1.4';
	promptText.style.position = 'relative';
	promptText.style.zIndex = '2';
	const truncatedPrompt = prompt.length > 150 ? prompt.substring(0, 150) + '...' : prompt;
	promptText.textContent = truncatedPrompt;
	
	// Add share info if it's a shareable URL (not base64)
	let shareContainer = null;
	if (url && !url.startsWith('data:')) {
		shareContainer = document.createElement('div');
		shareContainer.style.textAlign = 'center';
		shareContainer.style.marginTop = '20px';
		shareContainer.style.maxWidth = '90vw';
		shareContainer.style.marginBottom = '20px';
		shareContainer.style.position = 'relative';
		shareContainer.style.zIndex = '2';
		
		// Share message
		const shareInfo = document.createElement('div');
		shareInfo.style.fontSize = '18px';
		shareInfo.style.color = '#fff';
		shareInfo.style.marginBottom = '20px';
		shareInfo.style.fontFamily = 'Inter, sans-serif';
		shareInfo.style.fontWeight = '600';
		shareInfo.textContent = '✨ Sua arte está disponível online para compartilhar!';
		
		// Link container
		const linkContainer = document.createElement('div');
		linkContainer.style.display = 'flex';
		linkContainer.style.flexDirection = 'column';
		linkContainer.style.alignItems = 'center';
		linkContainer.style.justifyContent = 'center';
		linkContainer.style.gap = '20px';
		linkContainer.style.marginBottom = '10px';
		
		// Clickable QR Code
		const qrContainer = document.createElement('div');
		qrContainer.style.display = 'flex';
		qrContainer.style.flexDirection = 'column';
		qrContainer.style.alignItems = 'center';
		qrContainer.style.gap = '10px';
		qrContainer.style.cursor = 'pointer';
		qrContainer.style.transition = 'transform 0.2s ease';
		
		// Add hover effect
		qrContainer.onmouseenter = () => {
			qrContainer.style.transform = 'scale(1.05)';
		};
		qrContainer.onmouseleave = () => {
			qrContainer.style.transform = 'scale(1)';
		};
		
		// Click to open image
		qrContainer.onclick = () => {
			window.open(url, '_blank');
		};
		
		const qrLabel = document.createElement('div');
		qrLabel.style.fontSize = '14px';
		qrLabel.style.color = 'rgba(255, 255, 255, 0.9)';
		qrLabel.style.fontFamily = 'Inter, sans-serif';
		qrLabel.style.fontWeight = '600';
		qrLabel.style.marginBottom = '5px';
		qrLabel.textContent = '📱 Clique ou escaneie para abrir';
		
		const qrImg = document.createElement('img');
		qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
		
		qrImg.style.width = '150px';
		qrImg.style.height = '150px';
		qrImg.style.border = '3px solid rgba(255, 255, 255, 0.3)';
		qrImg.style.borderRadius = '12px';
		qrImg.style.backdropFilter = 'blur(10px)';
		qrImg.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
		qrImg.alt = 'QR Code for sharing your artwork';
		
		qrContainer.appendChild(qrLabel);
		qrContainer.appendChild(qrImg);
		
		// Manual print button for admin/testing
		const printButton = document.createElement('button');
		printButton.textContent = '🖨️ Imprimir';
		printButton.style.padding = '10px 16px';
		printButton.style.background = 'linear-gradient(135deg, #FFD400, #FFA500)';
		printButton.style.color = '#000';
		printButton.style.border = '2px solid rgba(255, 255, 255, 0.2)';
		printButton.style.borderRadius = '8px';
		printButton.style.cursor = 'pointer';
		printButton.style.fontWeight = '600';
		printButton.style.fontSize = '13px';
		printButton.style.fontFamily = 'Inter, sans-serif';
		printButton.style.backdropFilter = 'blur(10px)';
		printButton.style.transition = 'all 0.3s ease';
		printButton.style.marginTop = '10px';
		
		printButton.onclick = () => {
			console.log('Manual print triggered for:', url);
			printImageDirect(url);
			printButton.textContent = '✅ Imprimindo...';
			printButton.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
			setTimeout(() => {
				printButton.textContent = '🖨️ Imprimir';
				printButton.style.background = 'linear-gradient(135deg, #FFD400, #FFA500)';
			}, 3000);
		};
		
		linkContainer.appendChild(qrContainer);
		linkContainer.appendChild(printButton);
		
		shareContainer.appendChild(shareInfo);
		shareContainer.appendChild(linkContainer);
	}
	
	fullscreenContainer.appendChild(img);
	fullscreenContainer.appendChild(promptText);
	if (shareContainer) fullscreenContainer.appendChild(shareContainer);
	document.body.appendChild(fullscreenContainer);
	
	return fullscreenContainer;
}

export function addPromptToPage(prompt) {
	const imageContainer = document.getElementById('image-container');
	const promptElement = document.createElement('div');
	promptElement.style.margin = '20px auto';
	promptElement.style.maxWidth = '800px';
	promptElement.style.padding = '20px';
	promptElement.style.textAlign = 'center';
	promptElement.style.fontSize = '18px';
	promptElement.style.fontWeight = '400';
	promptElement.style.lineHeight = '1.5';
	promptElement.style.color = '#fff';
	promptElement.style.opacity = '0.8';
	promptElement.innerHTML = prompt;
	imageContainer.appendChild(promptElement);
	return promptElement;
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

// Camera initialization
export async function initializeCamera() {
	try {
		const cameraStream = await navigator.mediaDevices.getUserMedia({ 
			video: { facingMode: 'user', width: 1280, height: 720 } 
		});
		
		// Create video container with circular vignette
		const videoContainer = document.createElement('div');
		videoContainer.style.position = 'relative';
		videoContainer.style.width = '400px';
		videoContainer.style.height = '300px';
		videoContainer.style.margin = '10px auto';
		videoContainer.style.borderRadius = '12px';
		videoContainer.style.overflow = 'hidden';
		videoContainer.style.border = '2px solid rgba(255, 255, 255, 0.2)';
		
		const videoElement = document.createElement('video');
		videoElement.srcObject = cameraStream;
		videoElement.autoplay = true;
		videoElement.muted = true;
		videoElement.style.width = '100%';
		videoElement.style.height = '100%';
		videoElement.style.objectFit = 'cover';
		
		// Create circular mask with soft fade
		const maskOverlay = document.createElement('div');
		maskOverlay.style.position = 'absolute';
		maskOverlay.style.top = '0';
		maskOverlay.style.left = '0';
		maskOverlay.style.width = '100%';
		maskOverlay.style.height = '100%';
		maskOverlay.style.background = 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,1) 90%)';
		maskOverlay.style.pointerEvents = 'none';
		maskOverlay.style.mixBlendMode = 'multiply';
		
		videoContainer.appendChild(videoElement);
		videoContainer.appendChild(maskOverlay);
		
		// Insert video container after the logo in the content div
		const contentDiv = document.querySelector('.content');
		const logo = document.querySelector('.logo');
		if (contentDiv && logo) {
			contentDiv.insertBefore(videoContainer, logo.nextSibling);
		} else {
			document.body.appendChild(videoContainer);
		}
		console.log('Camera initialized successfully');
		
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

// Progress bar helper function
function createProgressBar() {
	const progressContainer = document.createElement('div');
	progressContainer.id = 'progress-container';
	progressContainer.style.position = 'fixed';
	progressContainer.style.top = '50%';
	progressContainer.style.left = '50%';
	progressContainer.style.transform = 'translate(-50%, -50%)';
	progressContainer.style.zIndex = '9999';
	progressContainer.style.textAlign = 'center';
	progressContainer.style.padding = '20px 25px';
	progressContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
	progressContainer.style.borderRadius = '16px';
	progressContainer.style.backdropFilter = 'blur(20px)';
	progressContainer.style.border = '2px solid rgba(255, 255, 255, 0.2)';
	progressContainer.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
	
	const progressText = document.createElement('div');
	progressText.style.color = '#fff';
	progressText.style.fontSize = '16px';
	progressText.style.marginBottom = '15px';
	progressText.style.fontWeight = '600';
	progressText.style.fontFamily = 'Inter, sans-serif';
	progressText.textContent = 'Criando sua arte personalizada...';
	
	const progressBarBg = document.createElement('div');
	progressBarBg.style.width = '280px';
	progressBarBg.style.height = '6px';
	progressBarBg.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
	progressBarBg.style.borderRadius = '3px';
	progressBarBg.style.overflow = 'hidden';
	
	const progressBarFill = document.createElement('div');
	progressBarFill.style.width = '0%';
	progressBarFill.style.height = '100%';
	progressBarFill.style.background = 'linear-gradient(90deg, #00B4D8, #0077B6)';
	progressBarFill.style.borderRadius = '3px';
	progressBarFill.style.transition = 'width 0.3s ease';
	progressBarFill.style.boxShadow = '0 0 8px rgba(0, 180, 216, 0.4)';
	
	progressBarBg.appendChild(progressBarFill);
	progressContainer.appendChild(progressText);
	progressContainer.appendChild(progressBarBg);
	
	return { progressContainer, progressBarFill };
}

function startProgressBar(progressBarFill, duration = 75000) {
	const startTime = Date.now();
	
	const updateProgress = () => {
		const elapsed = Date.now() - startTime;
		const progress = Math.min((elapsed / duration) * 100, 100);
		
		progressBarFill.style.width = `${progress}%`;
		
		if (elapsed < duration) {
			requestAnimationFrame(updateProgress);
		}
	};
	
	updateProgress();
}

// Generate image function
export async function generateImage({ prompt, width = 1024, height = 1024 }, videoElement, cameraStream) {
	if (!prompt) {
		throw new Error('prompt is required for image generation');
	}
	const promptElement = addPromptToPage(prompt);
	
	// Create and show progress bar
	const { progressContainer, progressBarFill } = createProgressBar();
	document.body.appendChild(progressContainer);
	startProgressBar(progressBarFill, 70000);
	
	try {
		// Capture photo from already-open camera
		let photoBlob = null;
		if (videoElement && cameraStream) {
			photoBlob = await capturePhotoFromVideo(videoElement);
			
			// Hide camera view and stop camera stream after photo capture
			const videoContainer = videoElement.parentElement;
			if (videoContainer) {
				videoContainer.style.display = 'none';
			}
			
			// Stop all camera tracks
			cameraStream.getTracks().forEach(track => {
				track.stop();
				console.log('Camera track stopped:', track.kind);
			});
			
			console.log('Camera hidden and stopped after photo capture');
		}
		
		console.log('Sending image generation request with params:', {
			prompt, width, height, hasPhoto: !!photoBlob
		});
		
		// Use photo edit API if we have a photo, otherwise regular generation
		if (photoBlob) {
			const formData = new FormData();
			formData.append('image', photoBlob, 'photo.jpg');
			formData.append('prompt', prompt);
			formData.append('size', '1024x1536');
			
			const response = await fetch('/edit-image', {
				method: 'POST',
				body: formData
			});
			
			const result = await response.json();
			
			if (!response.ok) {
				throw new Error(result.error || 'Failed to generate personalized image');
			}
			
			promptElement.remove();
			progressContainer.remove();
			addImageToPage(result.output, prompt);
			return { success: true, output: result.output };
		} else {
			// Fallback to regular image generation
			const response = await fetch('/generate-image', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					prompt,
					width,
					height
				})
			});
			
			const result = await response.json();
			
			if (!response.ok) {
				console.error('Image generation failed:', result);
				const errorMessage = result.message || result.error || 'Unknown error occurred';
				throw new Error(`Failed to generate image: ${errorMessage}`);
			}
			
			if (!result.output) {
				throw new Error('No output URL received from the image generation service');
			}

			promptElement.remove();
			progressContainer.remove();
			addImageToPage(result.output, prompt);
			return { success: true, output: result.output };
		}
	} catch (error) {
		console.error('Error in generateImage:', error);
		promptElement.remove();
		progressContainer.remove();
		throw error;
	}
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


// ========== TEST FUNCTIONS - DELETE AFTER TESTING ==========

// Test function to simulate agent image generation
export async function testImageGeneration() {
	try {
		console.log('Testing image generation flow...');
		
		// Get global camera variables
		const videoElement = window.videoElement;
		const cameraStream = window.cameraStream;
		
		// Check if camera is available
		if (!videoElement || !cameraStream) {
			alert('Camera not available for test');
			return;
		}
		
		// Simulate the agent's generateImage function call
		const testPrompt = 'Test image generation - creating a vibrant artistic portrait with Rio de Janeiro backdrop';
		
		// Use the same generateImage function that the agent uses
		if (window.fns && window.fns.generateImage) {
			console.log('Starting test image generation with prompt:', testPrompt);
			
			const result = await window.fns.generateImage({
				prompt: testPrompt,
				width: 1024,
				height: 1024
			});
			
			console.log('Test generation completed:', result);
			console.log('Output URL:', result.output);
			console.log('Is shareable URL:', !result.output.startsWith('data:'));
			
			if (result.output.startsWith('data:')) {
				console.log('Test generation completed with fallback - using base64 data URL (Cloudflare Images failed)');
			} else {
				console.log('Test generation successful - shareable URL:', result.output);
			}
		} else {
			console.log('generateImage function not available - make sure the agent is initialized');
		}
		
	} catch (error) {
		console.error('Test generation failed:', error);
	}
}

// Add test button to page
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
	testButton.onclick = testImageGeneration;
	
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

// ========== END TEST FUNCTIONS ==========
