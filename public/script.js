// Import helper functions
import { addImageToPage, addPromptToPage, capturePhotoFromVideo, addTestButton, initializeCamera, setupLogoAnimation, generateImage, closeConnection } from './helpers.js';

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

	// Initialize camera and set up test button after camera is ready
	initializeCamera().then((result) => {
		// Update global variables with returned values
		cameraStream = result.cameraStream;
		videoElement = result.videoElement;
		
		// Make camera variables globally accessible for test functions
		window.videoElement = videoElement;
		window.cameraStream = cameraStream;
		
		// Make fns globally accessible for test functions
		window.fns = fns;
		
		// Add test button (DELETE AFTER TESTING)
		addTestButton();
	});

	const fns = {
		getPageHTML: () => {
			return { success: true, html: document.documentElement.outerHTML };
		},
		generateImage: async (params) => {
			return await generateImage(params, videoElement, cameraStream);
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

	// Create close connection function using helper
	const closeConnectionFn = closeConnection(peerConnection, connectionTimeout);

	dataChannel.addEventListener('open', async (ev) => {
		console.log('Opening data channel', ev);
		
		// Start 5-minute timeout
		connectionTimeout = setTimeout(closeConnectionFn, 5 * 60 * 1000); // 5 minutes
		
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
