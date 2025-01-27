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

			// Add the generated image to the page
			const img = document.createElement('img');
			img.onerror = (error) => {
				console.error('Failed to load image:', error);
				const errorDiv = document.createElement('div');
				errorDiv.style.color = 'red';
				errorDiv.textContent = 'Failed to load the generated image. Please try again.';
				document.body.appendChild(errorDiv);
			};
			// The output is the direct URL string
			img.src = result.output;
			img.alt = `Generated image for prompt: ${prompt}`;
			img.style.maxWidth = '100%';
			img.style.height = 'auto';
			img.style.margin = '20px 0';
			img.style.display = 'block';
			document.body.appendChild(img);
			
			return { success: true, imageUrl: result.output };
		} catch (error) {
			console.error('Error in generateImage:', error);
			throw error;
		}
	},
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

function configureData() {
	console.log('Configuring data channel');
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
}

dataChannel.addEventListener('open', (ev) => {
	console.log('Opening data channel', ev);
	configureData();
});

// {
//     "type": "response.function_call_arguments.done",
//     "event_id": "event_Ad2gt864G595umbCs2aF9",
//     "response_id": "resp_Ad2griUWUjsyeLyAVtTtt",
//     "item_id": "item_Ad2gsxA84w9GgEvFwW1Ex",
//     "output_index": 1,
//     "call_id": "call_PG12S5ER7l7HrvZz",
//     "name": "get_weather",
//     "arguments": "{\"location\":\"Portland, Oregon\"}"
// }

dataChannel.addEventListener('message', async (ev) => {
	const msg = JSON.parse(ev.data);
	// Handle function calls
	if (msg.type === 'response.function_call_arguments.done') {
		const fn = fns[msg.name];
		if (fn !== undefined) {
			console.log(`Calling local function ${msg.name} with ${msg.arguments}`);
			const args = JSON.parse(msg.arguments);
			const result = await fn(args);
			console.log('result', result);
			// Let OpenAI know that the function has been called and share it's output
			const event = {
				type: 'conversation.item.create',
				item: {
					type: 'function_call_output',
					call_id: msg.call_id, // call_id from the function_call message
					output: JSON.stringify(result), // result of the function
				},
			};
			dataChannel.send(JSON.stringify(event));
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
