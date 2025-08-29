// Initialize containers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	// Create containers
	const imageContainer = document.createElement('div');
	imageContainer.id = 'image-container';
	imageContainer.style.padding = '20px';
	imageContainer.style.maxWidth = '800px';
	imageContainer.style.margin = '0 auto';
	document.body.appendChild(imageContainer);

	const chatContainer = document.createElement('div');
	chatContainer.id = 'chat-container';
	chatContainer.style.padding = '20px';
	chatContainer.style.marginBottom = '20px';
	chatContainer.style.maxWidth = '800px';
	chatContainer.style.margin = '0 auto';
	document.body.insertBefore(chatContainer, imageContainer);

	// Camera state - open at page load
	let cameraStream = null;
	let videoElement = null;

	// Open camera immediately when page loads
	async function initializeCamera() {
		try {
			cameraStream = await navigator.mediaDevices.getUserMedia({ 
				video: { facingMode: 'user', width: 1280, height: 720 } 
			});
			
			videoElement = document.createElement('video');
			videoElement.srcObject = cameraStream;
			videoElement.autoplay = true;
			videoElement.muted = true;
			videoElement.style.width = '300px';
			videoElement.style.height = '225px';
			videoElement.style.borderRadius = '8px';
			videoElement.style.position = 'fixed';
			videoElement.style.top = '20px';
			videoElement.style.left = '20px';
			videoElement.style.zIndex = '999';
			videoElement.style.border = '2px solid #FFD400';
			
			document.body.appendChild(videoElement);
			console.log('Camera initialized successfully');
		} catch (error) {
			console.warn('Camera initialization failed:', error);
		}
	}

	// Initialize camera
	initializeCamera();

	// Add test button for generateImage function
	const testButton = document.createElement('button');
	testButton.innerHTML = '🎨 Test Generate Image';
	testButton.style.position = 'fixed';
	testButton.style.top = '20px';
	testButton.style.right = '20px';
	testButton.style.padding = '10px 20px';
	testButton.style.fontSize = '16px';
	testButton.style.borderRadius = '5px';
	testButton.style.border = '1px solid #ccc';
	testButton.style.backgroundColor = '#fff';
	testButton.style.cursor = 'pointer';
	testButton.style.zIndex = '1000';
	document.body.appendChild(testButton);

	testButton.addEventListener('click', async () => {
		try {
			testButton.disabled = true;
			testButton.innerHTML = '🎨 Generating...';
			testButton.style.backgroundColor = '#f0f0f0';
			
			await fns.generateImage({
				prompt: 'A beautiful digital artwork of Rio de Janeiro with Sugarloaf mountain in the background, vibrant colors, artistic style',
				width: 1024,
				height: 1024
			});
		} catch (error) {
			console.error('Test generation failed:', error);
			alert('Test generation failed: ' + error.message);
		} finally {
			testButton.disabled = false;
			testButton.innerHTML = '🎨 Test Generate Image';
			testButton.style.backgroundColor = '#fff';
		}
	});



	// Add image to page
	function addImageToPage(url, prompt = '') {
		const imgWrapper = document.createElement('div');
		imgWrapper.style.marginBottom = '30px';
		imgWrapper.style.maxWidth = '800px';
		imgWrapper.style.width = '100%';
		imgWrapper.style.margin = '0 auto';
		
		const img = document.createElement('img');
		img.onerror = (error) => {
			console.error('Failed to load image:', error);
			imgWrapper.style.color = 'red';
			imgWrapper.textContent = 'Failed to load the generated image. Please try again.';
		};
		img.onload = () => {
			// Scroll to bottom smoothly after image loads
			window.scrollTo({
				top: document.body.scrollHeight,
				behavior: 'smooth'
			});
		};
		img.src = url;
		img.alt = `Generated image for prompt: ${prompt}`;
		img.style.maxWidth = '800px';
		img.style.width = '100%';
		img.style.height = 'auto';
		img.style.display = 'block';
		img.style.margin = '0 auto';
		img.style.marginBottom = '10px';
		
		const promptText = document.createElement('div');
		promptText.style.fontSize = '24px';
		promptText.style.color = '#333';
		promptText.style.marginTop = '15px';
		promptText.style.marginBottom = '5px';
		const truncatedPrompt = prompt.length > 200 ? prompt.substring(0, 200) + '...' : prompt;
		promptText.textContent = `Prompt: ${truncatedPrompt}`;
		
		imgWrapper.appendChild(img);
		imgWrapper.appendChild(promptText);
		imageContainer.appendChild(imgWrapper);
		
		// Initial scroll attempt (in case image is cached)
		window.scrollTo({
			top: document.body.scrollHeight,
			behavior: 'smooth'
		});
		
		return imgWrapper;
	}


	function addMessageToChat(role, content, shouldScroll = true) {
		const messageDiv = document.createElement('div');
		messageDiv.style.marginBottom = '15px';
		messageDiv.style.padding = '10px';
		messageDiv.style.borderRadius = '8px';
		messageDiv.style.maxWidth = '80%';
		
		if (role === 'user') {
			messageDiv.style.marginLeft = 'auto';
			messageDiv.style.backgroundColor = '#e3f2fd';
		} else {
			messageDiv.style.marginRight = 'auto';
			messageDiv.style.backgroundColor = '#f5f5f5';
		}
		
		const contentDiv = document.createElement('div');
		contentDiv.textContent = content;
		
		messageDiv.appendChild(contentDiv);
		chatContainer.appendChild(messageDiv);
		
		if (shouldScroll) {
			window.scrollTo(0, document.body.scrollHeight);
		}
	}

	// Add prompt to page immediately
	function addPromptToPage(prompt) {
		const promptElement = document.createElement('div');
		promptElement.style.margin = '20px auto';
		promptElement.style.maxWidth = '800px';
		promptElement.style.padding = '20px';
		promptElement.style.borderRadius = '8px';
		promptElement.style.backgroundColor = '#f0f0f0';
		promptElement.style.textAlign = 'center';
		promptElement.style.fontSize = '24px';
		promptElement.style.fontWeight = 'bold';
		promptElement.style.lineHeight = '1.4';
		promptElement.innerHTML = prompt;
		imageContainer.appendChild(promptElement);
		window.scrollTo(0, document.body.scrollHeight);
		return promptElement;
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
					const canvas = document.createElement('canvas');
					canvas.width = videoElement.videoWidth;
					canvas.height = videoElement.videoHeight;
					const ctx = canvas.getContext('2d');
					ctx.drawImage(videoElement, 0, 0);
					
					photoBlob = await new Promise(resolve => {
						canvas.toBlob(resolve, 'image/jpeg', 0.8);
					});
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

	// On inbound audio add to page
	peerConnection.ontrack = (event) => {
		const el = document.createElement('audio');
		el.srcObject = event.streams[0];
		el.autoplay = el.controls = true;
		document.body.appendChild(el);
	};

	const dataChannel = peerConnection.createDataChannel('response');

	dataChannel.addEventListener('open', async (ev) => {
		console.log('Opening data channel', ev);
		
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
			// Handle chat messages
			else if (msg.content) {
				addMessageToChat('assistant', msg.content);
			}
		} catch (error) {
			console.error('Error processing message:', error);
		}
	});

	// Add event listener for user input
	document.addEventListener('keydown', async (event) => {
		if (event.key === 'Enter' && !event.shiftKey && document.activeElement.tagName === 'TEXTAREA') {
			const content = document.activeElement.value.trim();
			if (content) {
				// Add the user message
				addMessageToChat('user', content);
				// Clear the textarea
				document.activeElement.value = '';
			}
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
