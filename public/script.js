// Initialize containers and load history when DOM is ready
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

	// Add mute toggle button
	const muteContainer = document.createElement('div');
	muteContainer.style.position = 'fixed';
	muteContainer.style.top = '20px';
	muteContainer.style.right = '20px';
	muteContainer.style.zIndex = '1000';
	document.body.appendChild(muteContainer);

	const muteButton = document.createElement('button');
	muteButton.innerHTML = '🎤 Mute';
	muteButton.style.padding = '10px 20px';
	muteButton.style.fontSize = '16px';
	muteButton.style.borderRadius = '5px';
	muteButton.style.border = '1px solid #ccc';
	muteButton.style.backgroundColor = '#fff';
	muteButton.style.cursor = 'pointer';
	muteContainer.appendChild(muteButton);

	let isMuted = false;
	let audioContext;
	let mediaStreamSource;

	// Storage configuration
	const STORAGE_KEYS = {
		IMAGES: 'generatedImages4',
		CHAT: 'chatHistory4'
	};

	// Load saved images from localStorage
	function loadSavedImages() {
		try {
			const savedImages = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMAGES) || '[]');
			savedImages.forEach(({ url, prompt, timestamp }) => {
				addImageToPage(url, prompt, timestamp);
			});
			// Scroll to the bottom after loading images
			window.scrollTo(0, document.body.scrollHeight);
		} catch (error) {
			console.error('Error loading saved images:', error);
		}
	}

	// Add image to page and optionally save to localStorage
	function addImageToPage(url, prompt, timestamp = new Date().toISOString()) {
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
		const truncatedPrompt = prompt.length > 100 ? prompt.substring(0, 100) + '...' : prompt;
		promptText.textContent = `Prompt: ${truncatedPrompt}`;
		
		const dateText = document.createElement('div');
		dateText.style.fontSize = '12px';
		dateText.style.color = '#999';
		dateText.textContent = new Date(timestamp).toLocaleString();
		
		imgWrapper.appendChild(img);
		imgWrapper.appendChild(promptText);
		imgWrapper.appendChild(dateText);
		imageContainer.appendChild(imgWrapper);
		
		// Initial scroll attempt (in case image is cached)
		window.scrollTo({
			top: document.body.scrollHeight,
			behavior: 'smooth'
		});
		
		return imgWrapper;
	}

	// Save image to localStorage
	function saveImageToStorage(url, prompt) {
		try {
			const savedImages = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMAGES) || '[]');
			const timestamp = new Date().toISOString();
			savedImages.push({ url, prompt, timestamp });
			localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(savedImages));
		} catch (error) {
			console.error('Error saving image to localStorage:', error);
		}
	}

	// Chat history functions
	function loadChatHistory() {
		try {
			const chatHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT) || '[]');
			chatHistory.forEach(message => {
				addMessageToChat(message.role, message.content, message.timestamp, false);
			});
			// Scroll to the bottom after loading chat
			window.scrollTo(0, document.body.scrollHeight);
		} catch (error) {
			console.error('Error loading chat history:', error);
		}
	}

	function saveChatMessage(role, content) {
		try {
			const chatHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT) || '[]');
			const message = {
				role,
				content,
				timestamp: new Date().toISOString()
			};
			chatHistory.push(message);
			localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatHistory));
			addMessageToChat(role, content, message.timestamp);
		} catch (error) {
			console.error('Error saving chat message:', error);
		}
	}

	function addMessageToChat(role, content, timestamp, shouldScroll = true) {
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
		contentDiv.style.marginBottom = '5px';
		
		const timeDiv = document.createElement('div');
		timeDiv.textContent = new Date(timestamp).toLocaleString();
		timeDiv.style.fontSize = '12px';
		timeDiv.style.color = '#999';
		
		messageDiv.appendChild(contentDiv);
		messageDiv.appendChild(timeDiv);
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
		changeBackgroundColor: ({ color }) => {
			document.body.style.backgroundColor = color;
			return { success: true, color };
		},
		changeTextColor: ({ color }) => {
			document.body.style.color = color;
			return { success: true, color };
		},
		generateImage: async ({ prompt, // required
			steps = 50, 
			width = 1024, 
			height = 1024, 
			guidance = 4, 
			model_version = "lora", 
			finetune_strength = 1.3, 
			use_complex_style = true 
		}) => {
			if (!prompt) {
				throw new Error('prompt is required for image generation');
			}
			const promptElement = addPromptToPage(prompt);
			try {
				console.log('Sending image generation request with params:', {
					prompt, steps, width, height, guidance, model_version, 
					finetune_strength, use_complex_style
				});
				
				const response = await fetch('/generate-image', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						prompt,
						steps,
						width,
						height,
						guidance,
						model_version,
						finetune_strength,
						use_complex_style
					})
				});
				
				const result = await response.json();
				
				if (!response.ok) {
					console.error('Image generation failed:', result);
					const errorMessage = result.message || result.error || 'Unknown error occurred';
					throw new Error(`Failed to generate image: ${errorMessage}`);
				}
				
				console.log('Image generated successfully:', result);
				
				if (!result.output) {
					throw new Error('No output URL received from the image generation service');
				}

				// After successful image generation, remove the temporary prompt element
				promptElement.remove();
				const imageUrl = result.output;
				addImageToPage(imageUrl, prompt);
				saveImageToStorage(imageUrl, prompt);
				
				// Scroll to the bottom after adding the new image
				window.scrollTo({
					top: document.body.scrollHeight,
					behavior: 'smooth'
				});

				return { success: true, imageUrl };
			} catch (error) {
				console.error('Error in generateImage:', error);
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

	dataChannel.addEventListener('open', (ev) => {
		console.log('Opening data channel', ev);
		const event = {
			type: 'session.update',
			session: {
				modalities: ['text', 'audio'],
				tools: [
					{
						type: 'function',
						name: 'changeBackgroundColor',
						description: 'Change the background color of the page',
						parameters: {
							type: 'object',
							properties: {
								color: {
									type: 'string',
									description: 'The color to change the background to',
								},
							},
							required: ['color'],
						},
					},
					{
						type: 'function',
						name: 'changeTextColor',
						description: 'Change the text color of the page',
						parameters: {
							type: 'object',
							properties: {
								color: {
									type: 'string',
									description: 'The color to change the text to',
								},
							},
							required: ['color'],
						},
					},
					{
						type: 'function',
						name: 'generateImage',
						description: 'Generate an image using the hybrid-space-bfl model',
						parameters: {
							type: 'object',
							properties: {
								prompt: {
									type: 'string',
									description: 'The prompt to generate an image for',
								},
								steps: {
									type: 'number',
									description: 'Number of inference steps',
									default: 50
								},
								width: {
									type: 'number',
									description: 'Width of the generated image',
									default: 1024
								},
								height: {
									type: 'number',
									description: 'Height of the generated image',
									default: 1024
								},
								guidance: {
									type: 'number',
									description: 'Guidance scale for generation',
									default: 4
								},
								model_version: {
									type: 'string',
									description: 'Version of the model to use',
									default: 'lora'
								},
								finetune_strength: {
									type: 'number',
									description: 'Strength of the fine-tuning',
									default: 1.3
								},
								use_complex_style: {
									type: 'boolean',
									description: 'Whether to use complex style',
									default: true
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
				saveChatMessage('assistant', msg.content);
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
				// Save the user message
				saveChatMessage('user', content);
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

	// Add mute toggle functionality
	muteButton.addEventListener('click', () => {
		isMuted = !isMuted;
		muteButton.innerHTML = isMuted ? '🔇 Unmute' : '🎤 Mute';
		muteButton.style.backgroundColor = isMuted ? '#ffebee' : '#fff';
		
		// Add visual feedback when muted
		if (isMuted) {
			addMessageToChat('system', 'Microphone muted - OpenAI will not receive audio until unmuted');
		} else {
			addMessageToChat('system', 'Microphone unmuted - OpenAI will now receive audio');
		}
	});

	// Load both chat and images
	loadChatHistory();
	loadSavedImages();
});
