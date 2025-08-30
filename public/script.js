// Import helper functions
import { addImageToPage, addPromptToPage, capturePhotoFromVideo, addTestButton } from './helpers.js';

// Global camera state - accessible to test functions
let cameraStream = null;
let videoElement = null;

// Initialize containers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	// Create containers
	const imageContainer = document.createElement('div');
	imageContainer.id = 'image-container';
	imageContainer.style.padding = '20px';
	imageContainer.style.maxWidth = '800px';
	imageContainer.style.margin = '0 auto';
	document.body.appendChild(imageContainer);

	// Open camera immediately when page loads
	async function initializeCamera() {
		try {
			cameraStream = await navigator.mediaDevices.getUserMedia({ 
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
			
			videoElement = document.createElement('video');
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
		} catch (error) {
			console.warn('Camera initialization failed:', error);
		}
	}

	// Initialize camera and set up test button after camera is ready
	initializeCamera().then(() => {
		// Make camera variables globally accessible for test functions
		window.videoElement = videoElement;
		window.cameraStream = cameraStream;
		
		// Make fns globally accessible for test functions
		window.fns = fns;
		
		// Add test button (DELETE AFTER TESTING)
		addTestButton();
	});

	// Heart-only animation based on audio amplitude
	function setupLogoAnimation(audioStream) {
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









	const fns = {
		getPageHTML: () => {
			return { success: true, html: document.documentElement.outerHTML };
		},
		generateImage: async ({ prompt, width = 1024, height = 1024 }) => {
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
	};

	// Create a WebRTC Agent
	const peerConnection = new RTCPeerConnection();
	
	// 5-minute timeout for connection
	let connectionTimeout;
	let isConnectionClosed = false;

	// On inbound audio add to page
	peerConnection.ontrack = (event) => {
		const el = document.createElement('audio');
		el.srcObject = event.streams[0];
		el.autoplay = true;
		el.controls = true;
		el.style.display = 'block';
		el.style.margin = '15px auto';
		el.style.maxWidth = '120px';
		el.style.width = '120px';
		el.style.height = '40px';
		el.style.borderRadius = '20px';
		el.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
		el.style.border = '1px solid rgba(255, 255, 255, 0.2)';
		el.style.backdropFilter = 'blur(10px)';
		el.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
		el.style.outline = 'none';
		
		// Insert audio controls in the content div after the logo
		const contentDiv = document.querySelector('.content');
		if (contentDiv) {
			contentDiv.appendChild(el);
		} else {
			document.body.appendChild(el);
		}
		
		// Setup audio visualization for logo animation
		setupLogoAnimation(event.streams[0]);
		
		console.log('Audio controls added to page');
	};

	const dataChannel = peerConnection.createDataChannel('response');

	// Function to close connection and show message
	function closeConnection() {
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
	}

	dataChannel.addEventListener('open', async (ev) => {
		console.log('Opening data channel', ev);
		
		// Start 5-minute timeout
		connectionTimeout = setTimeout(closeConnection, 5 * 60 * 1000); // 5 minutes
		
		// Fetch instructions from server
		let instructions = '';
		try {
			const response = await fetch('/instructions');
			const data = await response.json();
			instructions = data.instructions;
		} catch (error) {
			console.error('Failed to fetch instructions:', error);
		}
		
		const event = {
			type: 'session.update',
			session: {
				instructions: instructions,
				voice: 'ash',
				modalities: ['text', 'audio'],
				turn_detection: {
					type: 'server_vad',
					threshold: 0.3,              // More sensitive (lower threshold)
					prefix_padding_ms: 250,      // Slightly less padding for quicker response
					silence_duration_ms: 400,    // Shorter wait time for more responsive conversation
					create_response: true
				},
				tools: [
					{
						type: 'function',
						name: 'generateImage',
						description: 'Generate an image using Azure OpenAI GPT-image-1',
						parameters: {
							type: 'object',
							properties: {
								prompt: {
									type: 'string',
									description: 'The prompt to generate an image for',
								},
								width: {
									type: 'number',
									description: 'Width of the generated image (default: 1024)',
									default: 1024
								},
								height: {
									type: 'number',
									description: 'Height of the generated image (default: 1024)',
									default: 1024
								}
							},
							required: ['prompt']
						}
					}
				],
			},
		};
		dataChannel.send(JSON.stringify(event));
	});

	dataChannel.addEventListener('message', async (ev) => {
		// Check if connection is closed
		if (isConnectionClosed) return;
		
		try {
			const msg = JSON.parse(ev.data);
			console.log('Received message:', msg);

			// Handle function calls
			if (msg.type === 'response.function_call_arguments.done') {
				const call = {
					name: msg.name,
					parameters: JSON.parse(msg.arguments)
				};
				console.log('Calling local function', call.name, 'with', call.parameters);
				const fn = fns[call.name];
				if (fn) {
					try {
						const fnResult = await fn(call.parameters);
						const event = {
							type: 'conversation.item.create',
							item: {
								type: 'function_call_output',
								call_id: msg.call_id,
								output: JSON.stringify(fnResult)
							}
						};
						dataChannel.send(JSON.stringify(event));
					} catch (err) {
						console.error('Error in', call.name, err);
						const event = {
							type: 'conversation.item.create',
							item: {
								type: 'function_call_error',
								call_id: msg.call_id,
								error: err.message
							}
						};
						dataChannel.send(JSON.stringify(event));
					}
				}
			} 
			// Handle chat messages - no longer needed since we removed chat
			else if (msg.content) {
				console.log('Assistant message:', msg.content);
			}
		} catch (error) {
			console.error('Error processing message:', error);
		}
	});


	// Capture microphone
	navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
		// Add microphone to PeerConnection
		stream.getTracks().forEach((track) => peerConnection.addTransceiver(track, { direction: 'sendrecv' }));

		peerConnection.createOffer().then((offer) => {
			peerConnection.setLocalDescription(offer);

			// Send WebRTC Offer to Workers Realtime WebRTC API Relay
			fetch('/rtc-connect', {
				method: 'POST',
				body: offer.sdp,
				headers: {
					'Content-Type': 'application/sdp',
				},
			})
				.then((r) => r.text())
				.then((answer) => {
					// Accept answer from Realtime WebRTC API
					peerConnection.setRemoteDescription({
						sdp: answer,
						type: 'answer',
					});
				});
		});
	});


});
