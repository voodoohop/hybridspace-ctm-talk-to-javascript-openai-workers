// Initialize containers and load history when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	// Create containers
	const imageContainer = document.createElement('div');
	imageContainer.id = 'image-container';
	imageContainer.style.padding = '20px';
	imageContainer.style.maxWidth = '800px';
	imageContainer.style.margin = '0 auto';
	document.body.appendChild(imageContainer);
	
	console.log('🏗️ Created image container:', imageContainer);

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
		IMAGES: 'generatedImages6',
		CHAT: 'chatHistory6'+Math.random()
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
		const truncatedPrompt = prompt.length > 200 ? prompt.substring(0, 200) + '...' : prompt;
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
	function showBullets(promptOrParams) {
		console.log('📋 showBullets received:', promptOrParams);
		
		let prompt;
		
		// Handle different parameter formats
		if (promptOrParams === null || promptOrParams === undefined) {
			prompt = "No content provided";
			console.log('⚠️ No content provided to showBullets');
		} else if (typeof promptOrParams === 'string') {
			// Direct string input
			prompt = promptOrParams;
			console.log('📝 String content detected');
		} else if (Array.isArray(promptOrParams)) {
			// Array of bullet points
			prompt = promptOrParams;
			console.log('📝 Array of bullets detected');
		} else if (typeof promptOrParams === 'object') {
			// Object with parameters
			if (promptOrParams.prompt) {
				prompt = promptOrParams.prompt;
				console.log('📝 Object with prompt property detected');
			} else if (promptOrParams.content) {
				prompt = promptOrParams.content;
				console.log('📝 Object with content property detected');
			} else if (promptOrParams.bullets) {
				prompt = promptOrParams.bullets;
				console.log('📝 Object with bullets property detected');
			} else {
				// Fallback: stringify the entire object
				prompt = JSON.stringify(promptOrParams, null, 2);
				console.log('⚠️ Unknown object format, stringifying');
			}
		} else {
			// Fallback for any other type
			prompt = String(promptOrParams);
			console.log('⚠️ Unknown type, converting to string');
		}
		
		// Clear previous bullet points
		const existingBullets = document.querySelectorAll('.bullet-container');
		existingBullets.forEach(bullet => bullet.remove());
		console.log('🧹 Cleared previous bullet points:', existingBullets.length);
		
		// Debug check for imageContainer
		if (!imageContainer || !imageContainer.appendChild) {
			console.error('❌ imageContainer is not available or not a DOM element:', imageContainer);
			// Fallback to body if imageContainer is not available
			const container = document.body;
			console.log('⚠️ Using document.body as fallback container');
			
			const promptElement = document.createElement('div');
			promptElement.className = 'bullet-container';
			promptElement.style.margin = '20px auto';
			promptElement.style.maxWidth = '800px';
			promptElement.style.padding = '20px';
			promptElement.style.borderRadius = '8px';
			promptElement.style.backgroundColor = '#f0f0f0';
			promptElement.style.textAlign = 'left';
			promptElement.style.fontSize = '20px';
			promptElement.style.lineHeight = '1.4';
			promptElement.style.border = '3px solid red'; // Make it very visible for debugging
			
			// Handle array of bullet points
			if (Array.isArray(prompt)) {
				console.log('🔧 Creating bullet list from array:', prompt);
				const bulletList = document.createElement('ul');
				bulletList.style.paddingLeft = '20px';
				bulletList.style.margin = '0';
				
				prompt.forEach(item => {
					const bulletPoint = document.createElement('li');
					bulletPoint.textContent = item;
					bulletPoint.style.marginBottom = '10px';
					bulletList.appendChild(bulletPoint);
				});
				
				promptElement.appendChild(bulletList);
			} else {
				// Convert newlines to line breaks for bullet points
				console.log('🔧 Creating formatted text from string');
				promptElement.innerHTML = prompt.replace(/\n/g, '<br>');
			}
			
			container.appendChild(promptElement);
			console.log('✅ Bullet points added to document.body as fallback');
			return promptElement;
		}
		
		console.log('🔍 imageContainer check passed, creating bullet element');
		const promptElement = document.createElement('div');
		promptElement.className = 'bullet-container';
		promptElement.style.margin = '20px auto';
		promptElement.style.maxWidth = '800px';
		promptElement.style.padding = '20px';
		promptElement.style.borderRadius = '8px';
		promptElement.style.backgroundColor = '#f0f0f0';
		promptElement.style.textAlign = 'left';
		promptElement.style.fontSize = '20px';
		promptElement.style.lineHeight = '1.4';
		promptElement.style.border = '1px solid #ccc'; // Add border for visibility
		
		// Handle array of bullet points
		if (Array.isArray(prompt)) {
			console.log('🔧 Creating bullet list from array:', prompt);
			const bulletList = document.createElement('ul');
			bulletList.style.paddingLeft = '20px';
			bulletList.style.margin = '0';
			
			prompt.forEach(item => {
				const bulletPoint = document.createElement('li');
				bulletPoint.textContent = item;
				bulletPoint.style.marginBottom = '10px';
				bulletList.appendChild(bulletPoint);
			});
			
			promptElement.appendChild(bulletList);
		} else {
			// Convert newlines to line breaks for bullet points
			console.log('🔧 Creating formatted text from string');
			promptElement.innerHTML = prompt.replace(/\n/g, '<br>');
		}
		
		// Add a timestamp for debugging
		const timestamp = document.createElement('div');
		timestamp.textContent = new Date().toLocaleTimeString();
		timestamp.style.fontSize = '12px';
		timestamp.style.color = '#999';
		timestamp.style.marginTop = '10px';
		promptElement.appendChild(timestamp);
		
		console.log('🔍 About to append to imageContainer:', imageContainer);
		imageContainer.appendChild(promptElement);
		console.log('✅ Bullet points added to imageContainer');
		
		// Force layout update
		promptElement.offsetHeight;
		
		window.scrollTo(0, document.body.scrollHeight);
		console.log('✅ Bullet points displayed successfully');
		
		// Double-check if the element is in the DOM
		setTimeout(() => {
			const added = document.querySelector('.bullet-container');
			console.log('🔍 Bullet container in DOM after timeout:', added ? 'Yes' : 'No');
		}, 100);
		
		return promptElement;
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

	// Display all messages prominently
	function displayMessage(message, type = 'info') {
		const messageContainer = document.createElement('div');
		messageContainer.style.margin = '20px auto';
		messageContainer.style.maxWidth = '800px';
		messageContainer.style.padding = '20px';
		messageContainer.style.borderRadius = '8px';
		messageContainer.style.backgroundColor = type === 'info' ? '#e3f2fd' : '#f5f5f5';
		messageContainer.style.border = '2px solid ' + (type === 'info' ? '#2196F3' : '#9e9e9e');
		messageContainer.style.fontSize = '18px';
		messageContainer.style.lineHeight = '1.4';
		messageContainer.style.whiteSpace = 'pre-wrap';
		messageContainer.style.wordBreak = 'break-word';
		
		// Add a timestamp
		const timestamp = document.createElement('div');
		timestamp.textContent = new Date().toLocaleTimeString();
		timestamp.style.fontSize = '12px';
		timestamp.style.color = '#666';
		timestamp.style.marginBottom = '10px';
		messageContainer.appendChild(timestamp);
		
		// Add message content
		if (typeof message === 'object') {
			const formattedMessage = JSON.stringify(message, null, 2);
			messageContainer.innerHTML += formattedMessage;
		} else {
			messageContainer.innerHTML += message;
		}
		
		// Add to page
		document.body.insertBefore(messageContainer, document.body.firstChild);
		return messageContainer;
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
		showBullets: showBullets,
	};

	// Create a WebRTC Agent
	const peerConnection = new RTCPeerConnection();
	console.log('🔍 Creating RTCPeerConnection');

	// On inbound audio add to page
	peerConnection.addEventListener('track', (event) => {
		console.log('🔊 Received audio track from server', event);
		const audioElement = document.createElement('audio');
		audioElement.autoplay = true;
		audioElement.srcObject = event.streams[0];
		document.body.appendChild(audioElement);
	});

	const dataChannel = peerConnection.createDataChannel('response');
	console.log('📡 Created data channel:', dataChannel);

	dataChannel.addEventListener('open', (ev) => {
		console.log('🟢 Opening data channel', ev);
		console.log('📊 Data channel state:', dataChannel.readyState);
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
									description: 'Version of the model to use lora/finetune/finetune_old',
									default: 'lora'
								},
								finetune_strength: {
									type: 'number',
									description: 'Strength of the fine-tuning',
									default: 1.3
								},
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
			console.log('📥 Raw message received:', ev.data);
			const msg = JSON.parse(ev.data);
			console.log('📨 Parsed message:', msg);
			console.log('📋 Message type:', msg.type);
			
			// Display all messages prominently
			// displayMessage(msg, 'info');
			
			// Extract transcript from various message types
			let transcript = null;
			
			if (msg.type === 'response.audio_transcript.done') {
				transcript = msg.transcript;
				console.log('🎤 Audio transcript received:', transcript);
			} 
			else if (msg.type === 'response.content_part.done' && msg.part && msg.part.type === 'audio') {
				transcript = msg.part.transcript;
				console.log('🎤 Audio content part received:', transcript);
			}
			else if (msg.type === 'response.output_item.done' && 
					msg.item && 
					msg.item.content && 
					msg.item.content.length > 0 && 
					msg.item.content[0].type === 'audio') {
				transcript = msg.item.content[0].transcript;
				console.log('🎤 Output item with audio received:', transcript);
			}
			else if (msg.type === 'response.done' && 
					msg.response && 
					msg.response.output && 
					msg.response.output.length > 0 && 
					msg.response.output[0].content && 
					msg.response.output[0].content.length > 0 && 
					msg.response.output[0].content[0].type === 'audio') {
				transcript = msg.response.output[0].content[0].transcript;
				console.log('🎤 Complete response with audio received:', transcript);
			}
			
			// If we found a transcript, display it prominently
			if (transcript) {
				console.log('📝 Displaying transcript:', transcript);
				saveChatMessage('assistant', transcript);
				
				// Only show the most recent transcript
				showBullets(transcript);
			}
			
			// Handle function calls
			if (msg.type === 'response.function_call_arguments.done') {
				console.log('🔧 Function call detected:', msg.name);
				console.log('📝 Function arguments:', msg.arguments);
				
				const call = {
					name: msg.name,
					parameters: JSON.parse(msg.arguments)
				};
				console.log('🛠️ Calling local function', call.name, 'with parameters:', call.parameters);
				
				const fn = fns[call.name];
				if (fn) {
					console.log('✅ Function found in local functions');
					try {
						console.log('⚙️ Executing function:', call.name, 'with parameters:', call.parameters);
						const fnResult = await fn(call.parameters);
						console.log('✨ Function result:', fnResult);
						
						const event = {
							type: 'conversation.item.create',
							item: {
								type: 'function_call_output',
								call_id: msg.call_id,
								output: JSON.stringify(fnResult)
							}
						};
						console.log('📤 Sending function result back to server:', event);
						dataChannel.send(JSON.stringify(event));
					} catch (err) {
						console.error('❌ Error in', call.name, err);
						console.error('🔍 Error details:', {
							message: err.message,
							stack: err.stack
						});
						
						const event = {
							type: 'conversation.item.create',
							item: {
								type: 'function_call_error',
								call_id: msg.call_id,
								error: err.message
							}
						};
						console.log('📤 Sending function error back to server:', event);
						dataChannel.send(JSON.stringify(event));
					}
				} else {
					console.error('❓ Function not found:', call.name);
				}
			} 
			// Handle chat messages
			else if (msg.content) {
				console.log('💬 AI Response content received:', msg.content);
				console.log('📏 Response length:', msg.content.length);
				console.log('🔤 First 100 chars:', msg.content.substring(0, 100));
				
				saveChatMessage('assistant', msg.content);
				console.log('💾 Saved to chat history');
				
				// Display AI response prominently on screen
				console.log('🖥️ Displaying response on screen');
				const promptElement = showBullets(msg.content);
				console.log('✅ Response displayed successfully');
				
				// Add a data attribute for debugging
				promptElement.setAttribute('data-timestamp', new Date().toISOString());
				promptElement.setAttribute('data-response-id', Date.now().toString());
				console.log('🏷️ Added debug attributes to response element');
			}
		} catch (error) {
			console.error('❌ Error processing message:', error);
			console.error('🔍 Error details:', {
				message: error.message,
				stack: error.stack,
				data: ev.data
			});
			
			// Display error message on screen
			// displayMessage(`Error processing message: ${error.message}\n\nRaw data: ${ev.data}`, 'error');
		}
	});

	// Add event listener for user input
	document.addEventListener('keydown', async (event) => {
		if (event.key === 'Enter' && !event.shiftKey && document.activeElement.tagName === 'TEXTAREA') {
			const content = document.activeElement.value.trim();
			console.log('⌨️ User input detected:', content);
			
			if (content) {
				console.log('📝 Processing user message:', content);
				// Save the user message
				saveChatMessage('user', content);
				console.log('💾 Saved user message to chat history');
				
				// Clear the textarea
				document.activeElement.value = '';
				console.log('🧹 Cleared input field');
			} else {
				console.log('⚠️ Empty user input, ignoring');
			}
		}
	});

	// Capture microphone
	console.log('🎤 Requesting microphone access');
	navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
		console.log('✅ Microphone access granted', stream);
		console.log('🔊 Audio tracks:', stream.getAudioTracks().length);
		
		// Add microphone to PeerConnection
		stream.getTracks().forEach((track) => {
			console.log('➕ Adding track to peer connection:', track.kind, track.id);
			peerConnection.addTransceiver(track, { direction: 'sendrecv' });
		});

		console.log('📡 Creating WebRTC offer');
		peerConnection.createOffer().then((offer) => {
			console.log('📄 Offer created:', offer);
			console.log('📝 Setting local description');
			peerConnection.setLocalDescription(offer);

			// Send WebRTC Offer to Workers Realtime WebRTC API Relay
			console.log('🚀 Sending WebRTC offer to server');
			fetch('/rtc-connect', {
				method: 'POST',
				body: offer.sdp,
				headers: {
					'Content-Type': 'application/sdp',
				},
			})
				.then((r) => {
					console.log('📥 Received response from server:', r.status, r.statusText);
					return r.text();
				})
				.then((answer) => {
					console.log('📄 Received WebRTC answer from server');
					console.log('📝 Answer SDP length:', answer.length);
					console.log('📝 First 100 chars of answer:', answer.substring(0, 100));
					
					// Accept answer from Realtime WebRTC API
					console.log('📝 Setting remote description');
					peerConnection.setRemoteDescription({
						sdp: answer,
						type: 'answer',
					});
					console.log('✅ Remote description set successfully');
				})
				.catch(error => {
					console.error('❌ Error in WebRTC connection:', error);
					console.error('🔍 Error details:', {
						message: error.message,
						stack: error.stack
					});
				});
		}).catch(error => {
			console.error('❌ Error creating offer:', error);
		});
	}).catch(error => {
		console.error('❌ Error accessing microphone:', error);
		console.error('🔍 Error details:', {
			message: error.message,
			stack: error.stack
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
