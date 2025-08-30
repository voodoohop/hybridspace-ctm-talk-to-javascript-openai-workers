// Helper functions for PRIO Conception App
// Keep business logic separate from main script

// Image display and UI helpers
export function addImageToPage(url, prompt = '') {
	// Hide all other elements
	const contentDiv = document.querySelector('.content');
	if (contentDiv) contentDiv.style.display = 'none';
	
	// Create fullscreen image container
	const fullscreenContainer = document.createElement('div');
	fullscreenContainer.id = 'fullscreen-image-container';
	fullscreenContainer.style.position = 'fixed';
	fullscreenContainer.style.top = '0';
	fullscreenContainer.style.left = '0';
	fullscreenContainer.style.width = '100vw';
	fullscreenContainer.style.height = '100vh';
	fullscreenContainer.style.backgroundColor = '#000';
	fullscreenContainer.style.display = 'flex';
	fullscreenContainer.style.flexDirection = 'column';
	fullscreenContainer.style.alignItems = 'center';
	fullscreenContainer.style.justifyContent = 'flex-start';
	fullscreenContainer.style.overflowY = 'auto';
	fullscreenContainer.style.padding = '20px 0';
	fullscreenContainer.style.zIndex = '2000';
	
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
	
	// Create prompt text underneath image
	const promptText = document.createElement('div');
	promptText.style.fontSize = '18px';
	promptText.style.color = '#fff';
	promptText.style.textAlign = 'center';
	promptText.style.maxWidth = '80vw';
	promptText.style.marginTop = '20px';
	promptText.style.opacity = '0.8';
	const truncatedPrompt = prompt.length > 150 ? prompt.substring(0, 150) + '...' : prompt;
	promptText.textContent = truncatedPrompt;
	
	// Add share info if it's a shareable URL (not base64)
	let shareContainer = null;
	if (url && !url.startsWith('data:')) {
		shareContainer = document.createElement('div');
		shareContainer.style.textAlign = 'center';
		shareContainer.style.marginTop = '15px';
		shareContainer.style.maxWidth = '90vw';
		shareContainer.style.marginBottom = '20px';
		
		// Share message
		const shareInfo = document.createElement('div');
		shareInfo.style.fontSize = '16px';
		shareInfo.style.color = '#FFD400';
		shareInfo.style.marginBottom = '12px';
		shareInfo.style.opacity = '0.9';
		shareInfo.textContent = '✨ Sua arte está disponível online para compartilhar!';
		
		// Link container
		const linkContainer = document.createElement('div');
		linkContainer.style.display = 'flex';
		linkContainer.style.flexDirection = 'row';
		linkContainer.style.alignItems = 'center';
		linkContainer.style.justifyContent = 'center';
		linkContainer.style.gap = '20px';
		linkContainer.style.flexWrap = 'wrap';
		linkContainer.style.marginBottom = '10px';
		
		// Shareable link with copy button
		const linkWrapper = document.createElement('div');
		linkWrapper.style.display = 'flex';
		linkWrapper.style.alignItems = 'center';
		linkWrapper.style.gap = '10px';
		linkWrapper.style.flexWrap = 'wrap';
		linkWrapper.style.justifyContent = 'center';
		
		const linkText = document.createElement('input');
		linkText.type = 'text';
		linkText.value = url;
		linkText.readOnly = true;
		linkText.style.padding = '8px 12px';
		linkText.style.fontSize = '12px';
		linkText.style.border = '1px solid #FFD400';
		linkText.style.borderRadius = '5px';
		linkText.style.backgroundColor = 'rgba(255, 212, 0, 0.1)';
		linkText.style.color = '#fff';
		linkText.style.width = '300px';
		linkText.style.maxWidth = '70vw';
		
		const copyButton = document.createElement('button');
		copyButton.textContent = '📋 Copiar';
		copyButton.style.padding = '8px 15px';
		copyButton.style.backgroundColor = '#FFD400';
		copyButton.style.color = '#000';
		copyButton.style.border = 'none';
		copyButton.style.borderRadius = '5px';
		copyButton.style.cursor = 'pointer';
		copyButton.style.fontWeight = 'bold';
		copyButton.style.fontSize = '12px';
		
		copyButton.onclick = async () => {
			try {
				await navigator.clipboard.writeText(url);
				copyButton.textContent = '✅ Copiado!';
				copyButton.style.backgroundColor = '#4CAF50';
				setTimeout(() => {
					copyButton.textContent = '📋 Copiar';
					copyButton.style.backgroundColor = '#FFD400';
				}, 2000);
			} catch (err) {
				// Fallback for older browsers
				linkText.select();
				document.execCommand('copy');
				copyButton.textContent = '✅ Copiado!';
				copyButton.style.backgroundColor = '#4CAF50';
				setTimeout(() => {
					copyButton.textContent = '📋 Copiar';
					copyButton.style.backgroundColor = '#FFD400';
				}, 2000);
			}
		};
		
		linkWrapper.appendChild(linkText);
		linkWrapper.appendChild(copyButton);
		
		// QR Code
		const qrContainer = document.createElement('div');
		qrContainer.style.display = 'flex';
		qrContainer.style.flexDirection = 'column';
		qrContainer.style.alignItems = 'center';
		qrContainer.style.gap = '5px';
		
		const qrLabel = document.createElement('div');
		qrLabel.style.fontSize = '11px';
		qrLabel.style.color = '#FFD400';
		qrLabel.style.opacity = '0.8';
		qrLabel.textContent = 'Escaneie para compartilhar';
		
		const qrImg = document.createElement('img');
		qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`;
		qrImg.style.width = '120px';
		qrImg.style.height = '120px';
		qrImg.style.border = '2px solid #FFD400';
		qrImg.style.borderRadius = '6px';
		qrImg.alt = 'QR Code for sharing your artwork';
		
		qrContainer.appendChild(qrLabel);
		qrContainer.appendChild(qrImg);
		
		linkContainer.appendChild(linkWrapper);
		linkContainer.appendChild(qrContainer);
		
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
		videoContainer.style.margin = '20px auto';
		videoContainer.style.borderRadius = '8px';
		videoContainer.style.overflow = 'hidden';
		
		const videoElement = document.createElement('video');
		videoElement.srcObject = cameraStream;
		videoElement.autoplay = true;
		videoElement.muted = true;
		videoElement.style.width = '100%';
		videoElement.style.height = '100%';
		videoElement.style.objectFit = 'cover';
		
		// Create circular vignette overlay
		const vignetteOverlay = document.createElement('div');
		vignetteOverlay.style.position = 'absolute';
		vignetteOverlay.style.top = '0';
		vignetteOverlay.style.left = '0';
		vignetteOverlay.style.width = '100%';
		vignetteOverlay.style.height = '100%';
		vignetteOverlay.style.background = 'radial-gradient(circle at center, transparent 25%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0.8) 50%, black 70%)';
		vignetteOverlay.style.pointerEvents = 'none';
		
		videoContainer.appendChild(videoElement);
		videoContainer.appendChild(vignetteOverlay);
		
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

// Generate image function
export async function generateImage({ prompt, width = 1024, height = 1024 }, videoElement, cameraStream) {
	if (!prompt) {
		throw new Error('prompt is required for image generation');
	}
	const promptElement = addPromptToPage(prompt);
	
	try {
		// Capture photo from already-open camera
		let photoBlob = null;
		if (videoElement && cameraStream) {
			photoBlob = await capturePhotoFromVideo(videoElement);
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
			addImageToPage(result.output, prompt);
			return { success: true, output: result.output };
		}
	} catch (error) {
		console.error('Error in generateImage:', error);
		promptElement.remove();
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
		
		// Show closure message
		const messageDiv = document.createElement('div');
		messageDiv.style.position = 'fixed';
		messageDiv.style.top = '50%';
		messageDiv.style.left = '50%';
		messageDiv.style.transform = 'translate(-50%, -50%)';
		messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
		messageDiv.style.color = '#fff';
		messageDiv.style.padding = '30px';
		messageDiv.style.borderRadius = '12px';
		messageDiv.style.textAlign = 'center';
		messageDiv.style.fontSize = '18px';
		messageDiv.style.zIndex = '10000';
		messageDiv.style.maxWidth = '400px';
		messageDiv.innerHTML = `
			<h3 style="margin: 0 0 15px 0; color: #FFD400;">Sessão Encerrada</h3>
			<p style="margin: 0;">Sua conversa com Prio foi encerrada após 5 minutos.<br>
			Recarregue a página para uma nova sessão.</p>
		`;
		
		document.body.appendChild(messageDiv);
		
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
	testButton.style.top = '10px';
	testButton.style.right = '10px';
	testButton.style.zIndex = '9999';
	testButton.style.padding = '10px 15px';
	testButton.style.backgroundColor = '#FFD400';
	testButton.style.color = '#000';
	testButton.style.border = 'none';
	testButton.style.borderRadius = '5px';
	testButton.style.cursor = 'pointer';
	testButton.style.fontWeight = 'bold';
	testButton.onclick = testImageGeneration;
	document.body.appendChild(testButton);
}

// ========== END TEST FUNCTIONS ==========
