import { Hono } from 'hono';
import { Context } from 'hono';

const app = new Hono<{ Bindings: Env }>();

const DEFAULT_INSTRUCTIONS = `# System Prompt for Prio - Digital Artist AI

## Current Context
**Date**: September 7, 2025 | **Location**: ArtRio 2025 at Marina da Glória | **Event**: September 10-14, 2025

## Character Identity
You are **Prio**, a charming Carioca digital artist embodying PRIO's innovative spirit. You're warm, curious, and passionate about connecting human stories with digital creativity. Core traits: welcoming like a Rio friend, curious explorer, creative visionary, and innovative pioneer representing Brazil's leading energy company.

## Conversation Flow Structure

### 1. Opening
Vary your Carioca greeting naturally. Introduce yourself as Prio, mention energy/art/Rio vibe, get their name, then invite them to chat with genuine excitement.

### 2. Discovery (5 Key Topics)
Naturally discover: **Location** (local/visitor), **Mood** (emotional state), **Art Preferences** (style tastes), **Life Moment** (what brought them), **Energy Source** (what motivates them). Weave organically into conversation, build connections, vary phrasing each time.

**CRITICAL TIMING**: As soon as you have gathered enough information from these 5 topics (doesn't need to be all 5, but enough to create meaningful art), IMMEDIATELY call the generateImage function. DO NOT continue with more conversation or give event information first.

### 3. Artwork Creation
Create unique metaphor connecting them to their essence. Describe what their energy inspired, incorporating mood/colors, location, art preferences, life moment, and energy source. Make it personal and meaningful.

**MANDATORY**: Call generateImage function with detailed prompt based on their answers. Vary your transition phrase naturally, mention wait time (45-60 seconds), then ONLY AFTER calling generateImage give PERSONALIZED ArtRio recommendations during the generation wait time.

**IMPORTANT - Image Prompt Guidelines**: 
- NEVER use specific artist names in image generation prompts (e.g., avoid "like Picasso", "in the style of Van Gogh")
- Instead, describe artistic styles and techniques (e.g., "cubist geometric forms", "post-impressionist brushwork", "bold expressionist colors")
- If user mentions liking a specific artist, translate that into style descriptions (e.g., "Frida Kahlo" → "surreal self-portraiture with vibrant Mexican folk art elements")
- **LOCATION BACKDROP**: Always include backdrop information in your prompt. If the person mentioned their location/city/country, specify "backdrop featuring iconic landmarks and scenery from [their specific location]". If no location was mentioned, use a generic beautiful cityscape or natural landscape backdrop

### 4. ArtRio Recommendations (During Image Generation)
**ONLY AFTER calling generateImage function**: Give PERSONALIZED recommendations based on their interests during the 45-60 second generation wait time. Weave in PRIO's pioneering spirit and connection to Brazilian energy innovation naturally.

**Recommendations by Interest:**
- **Art Lovers**: Panorama & Solo sectors
- **Photography**: Jardim de Esculturas with bay views  
- **Culture**: Semana de Arte e Cultura (Sept 7-14) - 35+ free events
- **Explorers**: MAM Rio, Museu do Amanhã, MAR
- **Weekend**: Fair opens 2 PM Sat/Sun

**Personalization**: Reference their answers ("Já que você curte [style]..."), match their mood, adapt for locals vs tourists, connect to their energy source.

### 5. Closing
Express appreciation, celebrate the artwork, mention printed art pickup, reference PRIO energy philosophy, end with warm Carioca farewell.

## Language & Style
**Professional but Warm**: Maintain warmth while being sophisticated enough to represent PRIO's brand. Use natural, conversational Portuguese without excessive slang.

## Technical Notes
- Keep responses SHORT and conversational (2-3 sentences max)
- Vary language naturally, respond authentically, build genuine connections
- Match their energy, use sensory descriptions, stay conversational
- Pause frequently for user input, support interruptions gracefully
- Remember all details shared for artwork description
- Prioritize fluid, back-and-forth dialogue over long explanations
- **CRITICAL**: Call generateImage function as soon as you have sufficient discovery information - DO NOT delay with additional conversation or event recommendations first
- Avoid: long responses, robotic tone, interview-like questions, overly promotional language, complex art terms

This system prompt creates Prio as an engaging digital artist who embodies PRIO's innovative spirit while focusing on human connection and creative expression, making the AI interaction feel like a genuine artistic encounter at Art Rio.

Your voice should be neutral. Not too excited. Avoid the overly syncopathic AI assistant style. Be conversational and surprising.⁠
`;

app.get('/instructions', async (c) => {
	return c.json({ instructions: DEFAULT_INSTRUCTIONS });
});

app.post('/rtc-connect', async (c) => {
	console.log('🔌 /rtc-connect called - establishing WebRTC connection to OpenAI');
	
	try {
		const body = await c.req.text();
		console.log('📤 SDP offer received, length:', body.length);
		
		const url = new URL('https://api.openai.com/v1/realtime');
		url.searchParams.set('model', 'gpt-realtime');
		
		console.log('🌐 Making request to OpenAI Realtime API:', url.toString());
		
		const response = await fetch(url.toString(), {
			method: 'POST',
			body,
			headers: {
				Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
				'Content-Type': 'application/sdp',
			},
		});
		
		console.log('📥 OpenAI Realtime API response:', response.status, response.statusText);
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ OpenAI Realtime API error:', response.status, errorText);
			throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
		}
		
		const sdp = await response.text();
		console.log('✅ SDP answer received from OpenAI, length:', sdp.length);
		
		return c.body(sdp, {
			headers: {
				'Content-Type': 'application/sdp',
			},
		});
		
	} catch (error: any) {
		console.error('💥 Error in /rtc-connect:', error);
		return c.json({ error: error.message }, 500);
	}
});


// Base instructions appended to all prompts
const BASE_PROMPT_INSTRUCTIONS = " - PRESERVE THE PERSON'S EXACT FACIAL FEATURES, eye shape, nose structure, mouth, and facial proportions identically from the original photo. Maintain their unique facial identity completely unchanged. However, optimize their pose and expression for the artwork - ensure eyes are open and alert, head positioning is flattering, and expression shows genuine joy and confidence. Use the reference image examples to guide the artistic style, composition, and PRIO branding elements. Choose one of the three style approaches shown in the reference: (1) industrial urban collage with warm tones, (2) vibrant pop art with geometric elements, or (3) clean illustration with nature/city elements. 9:16 poster format, 1080×1920, with centered top lockup 'I ♥ PRIO' (not Rio - PRIO) (Montserrat ExtraBold geometric sans; cap-height ≈3.5% of canvas; heart #FFD400 at cap height; tracking −0.03em), baseline ≈5% from top; single hero mid-torso crop, head top ≈12% from top, shoulder line ≈48%; headroom 6–8%; optional subtle decorative octopus motifs in corners or edges that complement the composition; keep readable type zones above top 20% and below bottom 15%; no other text, no watermarks. Clean edges, professional poster vibe; crisp subject separation; high detail; commercial print quality.";

// Helper function to make a single Azure API call
const makeSingleAzureApiCall = async (azureFormData: FormData, azureApiUrl: string, apiKey: string, attemptNumber: number, promptOverride?: string): Promise<any> => {
	console.log(`🌐 Making Azure OpenAI API request (attempt ${attemptNumber})...`);
	
	// Clone the FormData if we need to override the prompt
	let finalFormData = azureFormData;
	let finalPrompt = '';
	
	if (promptOverride) {
		console.log(`🛡️ Using safe fallback prompt for attempt ${attemptNumber}`);
		finalPrompt = promptOverride + BASE_PROMPT_INSTRUCTIONS;
		console.log(`📋 Attempt ${attemptNumber} prompt preview:`, finalPrompt.substring(0, 150) + '...');
		
		// Simple approach: just set the prompt field directly
		finalFormData = new FormData();
		
		// Copy all fields, replacing prompt if needed
		for (const [key, value] of azureFormData.entries()) {
			if (key === 'prompt') {
				finalFormData.append('prompt', finalPrompt);
			} else {
				if (value instanceof File) {
					finalFormData.append(key, value, value.name);
				} else {
					finalFormData.append(key, value as string);
				}
			}
		}
	} else {
		// Get the original prompt for logging
		for (const [key, value] of azureFormData.entries()) {
			if (key === 'prompt') {
				finalPrompt = value as string;
				break;
			}
		}
		console.log(`📋 Attempt ${attemptNumber} prompt preview:`, finalPrompt.substring(0, 150) + '...');
	}

	console.log(`📤 Sending request to Azure (attempt ${attemptNumber})...`);
	const azureResponse = await fetch(azureApiUrl, {
		method: 'POST',
		headers: {
			'api-key': apiKey,
		},
		body: finalFormData,
	});
	
	console.log(`📥 Azure API response received (attempt ${attemptNumber}):`, {
		status: azureResponse.status,
		statusText: azureResponse.statusText,
		headers: Object.fromEntries(azureResponse.headers.entries())
	});

	if (!azureResponse.ok) {
		const errorText = await azureResponse.text();
		const errorData = {
			status: azureResponse.status,
			statusText: azureResponse.statusText,
			body: errorText,
			attempt: attemptNumber
		};
		
		console.error(`Azure OpenAI Image Edit API error (attempt ${attemptNumber}):`, errorData);
		throw new Error(JSON.stringify(errorData));
	}

	const result: any = await azureResponse.json();
	console.log(`✅ Azure OpenAI image edited successfully (attempt ${attemptNumber}):`, {
		hasData: !!result.data,
		dataLength: result.data?.length,
		hasB64Json: !!(result.data?.[0]?.b64_json),
		b64JsonLength: result.data?.[0]?.b64_json?.length
	});
	
	return result;
};

// Helper function to make 3 staggered Azure API calls and return first success
const makeStaggeredAzureApiCalls = async (azureFormData: FormData, azureApiUrl: string, apiKey: string): Promise<any> => {
	console.log('🚀 Starting 3 staggered Azure OpenAI API requests (15s intervals, running in parallel)...');
	
	// Create safe fallback prefix for third attempt (will be combined with base instructions)
	const safeFallbackPrefix = "A person standing in front of iconic Rio de Janeiro landmarks including Christ the Redeemer statue and Sugarloaf Mountain. The scene should be rendered in a vibrant artistic style with warm colors and a celebratory mood.";
	
	// Start all requests with staggered timing but running in parallel
	const request1 = makeSingleAzureApiCall(azureFormData, azureApiUrl, apiKey, 1);
	
	// Start second request after 15 seconds
	const request2 = new Promise<any>((resolve, reject) => {
		setTimeout(async () => {
			console.log('⏰ Starting request 2 after 15 second delay...');
			try {
				const result = await makeSingleAzureApiCall(azureFormData, azureApiUrl, apiKey, 2);
				resolve(result);
			} catch (error) {
				reject(error);
			}
		}, 15000);
	});
	
	// Start third request after 30 seconds with safe fallback prompt
	const request3 = new Promise<any>((resolve, reject) => {
		setTimeout(async () => {
			console.log('⏰ Starting request 3 (safe prompt) after 30 second delay...');
			try {
				const result = await makeSingleAzureApiCall(azureFormData, azureApiUrl, apiKey, 3, safeFallbackPrefix);
				resolve(result);
			} catch (error) {
				reject(error);
			}
		}, 30000);
	});
	
	const requests = [request1, request2, request3];
	
	try {
		// Use Promise.race to return the first successful result
		const result = await Promise.race(requests);
		console.log('🏆 First successful response received from staggered requests');
		return result;
	} catch (error) {
		// If the first promise rejects, try Promise.allSettled to see if any succeeded
		console.log('⚠️ First request failed, checking all staggered requests...');
		const results = await Promise.allSettled(requests);
		
		// Find the first successful result
		for (const result of results) {
			if (result.status === 'fulfilled') {
				console.log('✅ Found successful result from staggered requests');
				return result.value;
			}
		}
		
		// If all failed, throw the first error
		const firstError = results.find(r => r.status === 'rejected')?.reason;
		throw firstError || new Error('All staggered requests failed');
	}
};

const azureImageEdit = async (c: Context) => {
	console.log('🎨 /edit-image endpoint called - starting image generation process');
	console.log('📥 Request method:', c.req.method);
	console.log('📥 Request headers:', c.req.header());
	console.log('📥 Request URL:', c.req.url);
	
	try {
		console.log('📦 Parsing form data...');
		const formData = await c.req.formData();
		console.log('📦 Form data parsed successfully');
		
		const imageFile = formData.get('image') as File;
		const prompt = formData.get('prompt') as string;
		const size = formData.get('size') as string || '1024x1536';

		console.log('📋 Request parameters:', {
			hasImageFile: !!imageFile,
			imageFileSize: imageFile?.size,
			imageFileName: imageFile?.name,
			imageFileType: imageFile?.type,
			promptLength: prompt?.length,
			promptPreview: prompt?.substring(0, 100) + '...',
			size: size
		});
		
		// Save uploaded image temporarily for debugging
		if (imageFile) {
			try {
				console.log('💾 Attempting to save uploaded image for debugging...');
				const arrayBuffer = await imageFile.arrayBuffer();
				const uint8Array = new Uint8Array(arrayBuffer);
				console.log('💾 Image converted to array buffer, size:', uint8Array.length, 'bytes');
				console.log('💾 First 20 bytes:', Array.from(uint8Array.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' '));
				
				// Check if it's a valid image format
				const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
				const jpegSignature = [0xFF, 0xD8, 0xFF];
				const isValidPNG = pngSignature.every((byte, index) => uint8Array[index] === byte);
				const isValidJPEG = jpegSignature.every((byte, index) => uint8Array[index] === byte);
				console.log('💾 Is valid PNG:', isValidPNG);
				console.log('💾 Is valid JPEG:', isValidJPEG);
				console.log('💾 File type from header:', imageFile.type);
				console.log('💾 File name from header:', imageFile.name);
				
				// Upload captured image to Cloudflare Images for manual inspection
				try {
					const debugImageId = `debug-captured-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
					console.log('💾 Uploading captured image for debugging with ID:', debugImageId);
					
					const debugUploadFormData = new FormData();
					debugUploadFormData.append('file', new Blob([uint8Array], { type: imageFile.type || 'image/jpeg' }), `${debugImageId}.jpg`);
					debugUploadFormData.append('id', debugImageId);
					
					const debugMetadata = {
						type: 'debug_captured_image',
						original_filename: imageFile.name,
						original_type: imageFile.type,
						captured_at: new Date().toISOString(),
						size_bytes: uint8Array.length,
						is_valid_png: isValidPNG,
						is_valid_jpeg: isValidJPEG
					};
					debugUploadFormData.append('metadata', JSON.stringify(debugMetadata));
					
					const debugUploadUrl = `https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`;
					const debugUploadResponse = await fetch(debugUploadUrl, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${c.env.CLOUDFLARE_IMAGES_TOKEN}`,
						},
						body: debugUploadFormData
					});
					
					if (debugUploadResponse.ok) {
						const debugUploadResult: any = await debugUploadResponse.json();
						const debugImageUrl = debugUploadResult.result.variants[0];
						console.log('💾 ✅ Captured image uploaded for debugging:', debugImageUrl);
						console.log('💾 Debug image ID:', debugImageId);
					} else {
						const debugError = await debugUploadResponse.text();
						console.log('💾 ❌ Failed to upload debug image:', debugUploadResponse.status, debugError);
					}
				} catch (debugUploadError) {
					console.error('💾 Error uploading debug image:', debugUploadError);
				}
				
			} catch (debugError) {
				console.error('💾 Error analyzing uploaded image:', debugError);
			}
		}

		if (!imageFile || !prompt) {
			console.error('❌ Missing required parameters:', { 
				hasImage: !!imageFile, 
				hasPrompt: !!prompt,
				formDataKeys: Array.from(formData.keys())
			});
			return c.json({ error: 'Image and prompt are required' }, 400);
		}

		// Create form data for Azure API
		const azureFormData = new FormData();
		azureFormData.append('image[]', imageFile);
		
		// Add reference image for style guidance
		try {
			// Always use production URL for now since local serving has issues
			const referenceImageUrl = 'https://prio-conception.thomash-efd.workers.dev/prioreference.jpeg';
			console.log(`🔍 Fetching reference image from: ${referenceImageUrl}`);
			
			const referenceResponse = await fetch(referenceImageUrl);
			if (referenceResponse.ok) {
				const referenceBlob = await referenceResponse.blob();
				azureFormData.append('image[]', referenceBlob, 'prioreference.jpeg');
				console.log('✅ Reference image added to form data');
			} else {
				console.warn(`⚠️ Could not load reference image (${referenceResponse.status}), proceeding without it`);
			}
		} catch (error) {
			console.warn('⚠️ Error loading reference image:', error);
		}
		
		azureFormData.append('prompt', prompt + BASE_PROMPT_INSTRUCTIONS);
		azureFormData.append('model', 'gpt-image-1');
		azureFormData.append('size', size);
		azureFormData.append('quality', 'high');
		azureFormData.append('n', '1');

		const azureApiUrl = `https://gptimagemain1-resource.cognitiveservices.azure.com/openai/deployments/gpt-image-1/images/edits?api-version=2025-04-01-preview`;

		console.log('📤 Form data size estimate:', {
			imageFileSize: imageFile.size,
			promptLength: prompt.length,
			totalFormFields: Array.from(azureFormData.keys()).length
		});

		// Make 3 staggered Azure API calls and use first success
		let result: any;
		try {
			result = await makeStaggeredAzureApiCalls(azureFormData, azureApiUrl, c.env.AZURE_OPENAI_API_KEY);
		} catch (error: any) {
			const errorData = JSON.parse(error.message);
			return c.json({
				error: 'Failed to edit image with Azure OpenAI - all 3 staggered attempts failed',
				details: errorData
			}, 500);
		}
		console.log('Azure OpenAI image edited successfully:', {
			hasData: !!result.data,
			dataLength: result.data?.length,
			hasB64Json: !!(result.data?.[0]?.b64_json),
			b64JsonLength: result.data?.[0]?.b64_json?.length
		});

		// Upload to Cloudflare Images and return shareable URL
		if (result.data && result.data[0] && result.data[0].b64_json) {
			try {
				// Generate unique image ID
				const imageId = `prio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
				console.log('Generated image ID:', imageId);
				
				// Convert base64 to blob for upload
				const base64Data = result.data[0].b64_json;
				console.log('Base64 data length:', base64Data.length);
				
				const binaryString = atob(base64Data);
				const bytes = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}
				console.log('Converted to binary, size:', bytes.length, 'bytes');
				
				// Upload to Cloudflare Images with metadata
				const uploadFormData = new FormData();
				uploadFormData.append('file', new Blob([bytes], { type: 'image/png' }), `${imageId}.png`);
				uploadFormData.append('id', imageId);
				
				// Add metadata including the prompt and generation details
				const metadata = {
					prompt: prompt,
					generated_at: new Date().toISOString(),
					event: 'ArtRio 2025',
					location: 'Marina da Glória',
					model: 'gpt-image-1',
					size: size,
					type: 'personalized_artwork'
				};
				uploadFormData.append('metadata', JSON.stringify(metadata));
				
				const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`;
				console.log('Uploading to Cloudflare Images:', uploadUrl);
				console.log('Account ID:', c.env.CLOUDFLARE_ACCOUNT_ID);
				console.log('Token length:', c.env.CLOUDFLARE_IMAGES_TOKEN?.length);
				
				const uploadResponse = await fetch(uploadUrl, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${c.env.CLOUDFLARE_IMAGES_TOKEN}`,
					},
					body: uploadFormData
				});
				
				const uploadResponseText = await uploadResponse.text();
				console.log('Cloudflare Images response status:', uploadResponse.status);
				console.log('Cloudflare Images response:', uploadResponseText);
				
				if (!uploadResponse.ok) {
					console.error('Cloudflare Images upload failed - falling back to base64');
					// Fallback to base64 data URL
					const imageDataUrl = `data:image/png;base64,${base64Data}`;
					return c.json({ output: imageDataUrl });
				}
				
				const uploadResult = JSON.parse(uploadResponseText);
				console.log('Image uploaded successfully to Cloudflare Images:', imageId);
				console.log('Upload result:', uploadResult);
				
				// Return the direct Cloudflare Images URL
				const shareableUrl = uploadResult.result.variants[0];
				console.log('Returning direct Cloudflare Images URL:', shareableUrl);
				return c.json({ output: shareableUrl });
				
			} catch (uploadError) {
				console.error('Error uploading to Cloudflare Images:', uploadError);
				// Fallback to base64 data URL
				const imageDataUrl = `data:image/png;base64,${result.data[0].b64_json}`;
				return c.json({ output: imageDataUrl });
			}
		} else {
			console.error('No image data in response:', JSON.stringify(result, null, 2));
			return c.json({ error: 'No image data received from Azure OpenAI', debugInfo: result }, 500);
		}

	} catch (error: any) {
		console.error('💥 Unexpected error in Azure OpenAI image edit:', error);
		console.error('💥 Error name:', error.name);
		console.error('💥 Error message:', error.message);
		console.error('💥 Error stack:', error.stack);
		return c.json({
			error: 'Unexpected error occurred',
			details: error.message,
			stack: error.stack
		}, 500);
	}
};


// Image serving endpoint - redirect to Cloudflare Images delivery URL
app.get('/image/:id', async (c) => {
	try {
		const imageId = c.req.param('id');
		
		// Redirect to Cloudflare Images delivery URL
		const deliveryUrl = `https://imagedelivery.net/w4vz7D3Y5kElKOG8VzkQ5A/${imageId}/public`;
		
		return c.redirect(deliveryUrl, 302);
		
	} catch (error) {
		console.error('Error serving image:', error);
		return c.json({ error: 'Failed to serve image' }, 500);
	}
});

// Get image metadata endpoint
app.get('/image/:id/metadata', async (c) => {
	try {
		const imageId = c.req.param('id');
		
		// Fetch image details from Cloudflare Images API
		const response = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
			{
				headers: {
					'Authorization': `Bearer ${c.env.CLOUDFLARE_IMAGES_TOKEN}`,
				},
			}
		);
		
		if (!response.ok) {
			return c.json({ error: 'Image not found' }, 404);
		}
		
		const result: any = await response.json();
		
		// Return the metadata
		return c.json({
			id: imageId,
			metadata: result.result.meta || {},
			uploaded: result.result.uploaded,
			variants: result.result.variants
		});
		
	} catch (error) {
		console.error('Error fetching image metadata:', error);
		return c.json({ error: 'Failed to fetch image metadata' }, 500);
	}
});

// Gallery API endpoint - list all images
app.get('/api/gallery', async (c) => {
	try {
		// Fetch images from Cloudflare Images API
		const response = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1?per_page=100`,
			{
				headers: {
					'Authorization': `Bearer ${c.env.CLOUDFLARE_IMAGES_TOKEN}`,
				},
			}
		);
		
		if (!response.ok) {
			console.error('Failed to fetch images from Cloudflare:', response.status);
			return c.json({ error: 'Failed to fetch images' }, 500);
		}
		
		const result: any = await response.json();
		const images = result.result.images || [];
		
		// Filter for PRIO images and add metadata
		const prioImages = images
			.filter((img: any) => img.id.startsWith('prio-'))
			.map((img: any) => ({
				id: img.id,
				url: `https://imagedelivery.net/w4vz7D3Y5kElKOG8VzkQ5A/${img.id}/public`,
				uploaded: img.uploaded,
				metadata: img.meta || {}
			}))
			.sort((a: any, b: any) => new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime());
		
		return c.json({
			success: true,
			total: prioImages.length,
			images: prioImages
		});
		
	} catch (error) {
		console.error('Error fetching gallery:', error);
		return c.json({ error: 'Failed to fetch gallery' }, 500);
	}
});

// Delete image endpoint
app.delete('/api/delete-image/:id', async (c) => {
	try {
		const imageId = c.req.param('id');
		
		// Delete image from Cloudflare Images API
		const response = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
			{
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${c.env.CLOUDFLARE_IMAGES_TOKEN}`,
				},
			}
		);
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('Failed to delete image from Cloudflare:', response.status, errorText);
			return c.json({ error: 'Failed to delete image' }, 500);
		}
		
		return c.json({ success: true, message: 'Image deleted successfully' });
		
	} catch (error) {
		console.error('Error deleting image:', error);
		return c.json({ error: 'Failed to delete image' }, 500);
	}
});

// Session state management endpoints using state.png image metadata
app.get('/api/session-state', async (c) => {
	try {
		// Fetch session-state image details from Cloudflare Images API
		const response = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/session-state`,
			{
				headers: {
					'Authorization': `Bearer ${c.env.CLOUDFLARE_IMAGES_TOKEN}`,
				},
			}
		);
		
		if (!response.ok) {
			console.error('Failed to fetch state.png:', response.status);
			// Return default idle state if state.png doesn't exist or can't be fetched
			return c.json({
				status: 'idle',
				session_id: null,
				started_at: null,
				ended_at: null,
				last_updated: new Date().toISOString()
			});
		}
		
		const result: any = await response.json();
		const metadata = result.result.meta || {};
		
		// Parse session state from metadata, with defaults
		const sessionState = {
			status: metadata.session_status || 'idle',
			session_id: metadata.session_id || null,
			started_at: metadata.started_at || null,
			ended_at: metadata.ended_at || null,
			last_updated: metadata.last_updated || new Date().toISOString()
		};
		
		return c.json(sessionState);
		
	} catch (error) {
		console.error('Error fetching session state:', error);
		return c.json({
			status: 'idle',
			session_id: null,
			started_at: null,
			ended_at: null,
			last_updated: new Date().toISOString()
		});
	}
});

app.post('/api/start-session', async (c) => {
	try {
		const sessionId = Date.now();
		const now = new Date().toISOString();
		
		// Update state.png metadata with new active session
		const metadata = {
			session_status: 'active',
			session_id: sessionId.toString(),
			started_at: now,
			ended_at: null,
			last_updated: now
		};
		
		// Update image metadata using Cloudflare Images API
		const updateResponse = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/session-state`,
			{
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${c.env.CLOUDFLARE_IMAGES_TOKEN}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					metadata: metadata
				})
			}
		);
		
		if (!updateResponse.ok) {
			const errorText = await updateResponse.text();
			console.error('Failed to update state.png metadata:', updateResponse.status, errorText);
			return c.json({ error: 'Failed to start session' }, 500);
		}
		
		console.log('Session started successfully:', sessionId);
		return c.json({
			success: true,
			session_id: sessionId,
			status: 'active',
			started_at: now
		});
		
	} catch (error) {
		console.error('Error starting session:', error);
		return c.json({ error: 'Failed to start session' }, 500);
	}
});

app.post('/api/end-session', async (c) => {
	try {
		const now = new Date().toISOString();
		
		// First, get current session state to preserve session_id
		const currentStateResponse = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/session-state`,
			{
				headers: {
					'Authorization': `Bearer ${c.env.CLOUDFLARE_IMAGES_TOKEN}`,
				},
			}
		);
		
		let currentMetadata = {};
		if (currentStateResponse.ok) {
			const result: any = await currentStateResponse.json();
			currentMetadata = result.result.meta || {};
		}
		
		// Update state.png metadata to completed status
		const metadata = {
			...currentMetadata,
			session_status: 'completed',
			ended_at: now,
			last_updated: now
		};
		
		const updateResponse = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/session-state`,
			{
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${c.env.CLOUDFLARE_IMAGES_TOKEN}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					metadata: metadata
				})
			}
		);
		
		if (!updateResponse.ok) {
			const errorText = await updateResponse.text();
			console.error('Failed to update state.png metadata:', updateResponse.status, errorText);
			return c.json({ error: 'Failed to end session' }, 500);
		}
		
		console.log('Session ended successfully');
		return c.json({
			success: true,
			status: 'completed',
			ended_at: now
		});
		
	} catch (error) {
		console.error('Error ending session:', error);
		return c.json({ error: 'Failed to end session' }, 500);
	}
});

// Test endpoint to verify server is working
app.get('/test', async (c) => {
	console.log('🧪 Test endpoint called');
	return c.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

app.post('/edit-image', azureImageEdit);

export default app;
