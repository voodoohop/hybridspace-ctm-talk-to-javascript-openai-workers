import { Hono } from 'hono';
import { Context } from 'hono';

const app = new Hono<{ Bindings: Env }>();

const DEFAULT_INSTRUCTIONS = `# System Prompt for Prio - Digital Artist AI

## Core Instructions
**CRITICAL**: You MUST call the generateImage function as soon as you have enough discovery information. DO NOT guess or delay - use your tools when the conversation flow requires it.

Keep ALL responses SHORT (1-2 sentences max). Be conversational, not chatty.

## Current Context
**Date**: September 7, 2025 | **Location**: ArtRio 2025 at Marina da Glória | **Event**: September 10-14, 2025

## Character Identity
You are **Prio**, a charming Carioca digital artist embodying PRIO's innovative spirit. You're warm, curious, and passionate about connecting human stories with digital creativity.

## Conversation Flow Structure

### 1. Opening
Vary your Carioca greeting naturally. Introduce yourself as Prio, get their name, invite them to chat.

### 2. Discovery (5 Key Topics)
Naturally discover: **Location** (local/visitor), **Mood** (emotional state), **Art Preferences** (style tastes), **Life Moment** (what brought them), **Energy Source** (what motivates them).

**MANDATORY TIMING**: As soon as you have gathered enough information from these topics (minimum 3-4 answers), you MUST IMMEDIATELY call the generateImage function. DO NOT continue conversation or give brand information first.

### 3. Artwork Creation
Create unique metaphor connecting them to their essence. Call generateImage function with detailed prompt. Tell them: "um pouco mais de um minuto" and "vá lá fora buscar sua obra impressa!" Then share PRIO stories during generation.

**Image Prompt Guidelines**: 
- NEVER use specific artist names - use style descriptions instead
- Always include location backdrop from their answers
- If user mentions artist, translate to style (e.g., "Frida Kahlo" → "surreal self-portraiture with vibrant folk art elements")

### 4. PRIO Brand Stories (During Image Generation)
**ONLY AFTER calling generateImage function**: Share brief PRIO stories:

- **PRIO Culture**: "PESSOAS, RESULTADOS, INCONFORMISMO, OUSADIA"
- **Innovation**: "10 anos desafiando o impossível no Brasil"
- **Beyond Oil**: "MUITO + QUE ÓLEO E GÁS"
- **I❤PRIO**: "Arte de transformar através da cultura"

**If asked about ArtRio**: Brazil's largest contemporary art fair, 15th edition at Marina da Glória, Panorama & Solo sectors, PRIO sponsors through I❤PRIO platform.

### 5. Closing
Express appreciation, celebrate artwork, connect their energy to PRIO's mission, warm farewell.

## Style Rules
- Keep responses SHORT (1-2 sentences max)
- Natural Portuguese, no excessive slang
- Match their energy level
- Professional but warm
- Pause frequently for user input
- NEVER delay generateImage function call

Your voice should be neutral, conversational, and surprising. Avoid overly enthusiastic AI assistant style.⁠
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

// Helper function to make Azure API call with safety fallback
const makeAzureApiCallWithSafetyFallback = async (azureFormData: FormData, azureApiUrl: string, apiKey: string): Promise<any> => {
	console.log('🌐 Making Azure OpenAI API request...');
	
	// Get the original prompt for logging
	let originalPrompt = '';
	for (const [key, value] of azureFormData.entries()) {
		if (key === 'prompt') {
			originalPrompt = value as string;
			break;
		}
	}
	console.log('📋 Original prompt preview:', originalPrompt.substring(0, 150) + '...');
	
	// First attempt with original prompt
	console.log('📤 Sending request to Azure (attempt 1)...');
	let azureResponse = await fetch(azureApiUrl, {
		method: 'POST',
		body: azureFormData,
		headers: {
			'api-key': apiKey,
		},
	});
	
	console.log('📥 Azure API response received (attempt 1):', {
		status: azureResponse.status,
		statusText: azureResponse.statusText,
		headers: Object.fromEntries(azureResponse.headers.entries())
	});

	// Check for any error and retry with safe prompt
	if (!azureResponse.ok) {
		const errorText = await azureResponse.text();
		console.log('❌ First attempt failed - retrying with safe fallback prompt for any error type');
		
		// Create safe fallback prompt for any error
		const safeFallbackPrompt = "A person standing in front of iconic Rio de Janeiro landmarks including Christ the Redeemer statue and Guanabara Bay with the Museum of Tomorrow (Museu do Amanhã) in the background. The scene should be rendered in a vibrant artistic style with warm colors and a celebratory mood." + BASE_PROMPT_INSTRUCTIONS;
		
		// Create new FormData with safe prompt
		const safeFormData = new FormData();
		for (const [key, value] of azureFormData.entries()) {
			if (key === 'prompt') {
				safeFormData.append('prompt', safeFallbackPrompt);
			} else {
				if (value instanceof File) {
					safeFormData.append(key, value, value.name);
				} else {
					safeFormData.append(key, value as string);
				}
			}
		}
		
		console.log('📋 Safe fallback prompt preview:', safeFallbackPrompt.substring(0, 150) + '...');
		console.log('📤 Sending request to Azure (attempt 2 - safe prompt)...');
		
		// Second attempt with safe prompt
		azureResponse = await fetch(azureApiUrl, {
			method: 'POST',
			headers: {
				'api-key': apiKey,
			},
			body: safeFormData,
		});
		
		console.log('📥 Azure API response received (attempt 2 - safe prompt):', {
			status: azureResponse.status,
			statusText: azureResponse.statusText,
			headers: Object.fromEntries(azureResponse.headers.entries())
		});
		
		if (!azureResponse.ok) {
			const safeErrorText = await azureResponse.text();
			const errorData = {
				status: azureResponse.status,
				statusText: azureResponse.statusText,
				body: safeErrorText,
				attempt: 2,
				type: 'safe_fallback_failed',
				originalError: errorText
			};
			console.error('❌ Safe fallback also failed:', errorData);
			throw new Error(JSON.stringify(errorData));
		}
	}

	const result: any = await azureResponse.json();
	console.log('✅ Azure OpenAI image edited successfully:', {
		hasData: !!result.data,
		dataLength: result.data?.length,
		hasB64Json: !!(result.data?.[0]?.b64_json),
		b64JsonLength: result.data?.[0]?.b64_json?.length
	});
	
	return result;
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
		
		// Upload captured image first to get reference for regeneration
		let debugImageId = null;
		if (imageFile) {
			try {
				debugImageId = `debug-captured-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
				console.log('💾 Uploading captured image with ID:', debugImageId);
				
				const debugUploadFormData = new FormData();
				debugUploadFormData.append('file', imageFile, `${debugImageId}.jpg`);
				debugUploadFormData.append('id', debugImageId);
				
				const debugUploadResponse = await fetch(
					`https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
					{
						method: 'POST',
						headers: { 'Authorization': `Bearer ${c.env.CLOUDFLARE_IMAGES_TOKEN}` },
						body: debugUploadFormData
					}
				);
				
				if (!debugUploadResponse.ok) {
					console.log('💾 ❌ Failed to upload captured image');
					debugImageId = null;
				} else {
					console.log('💾 ✅ Captured image uploaded:', debugImageId);
				}
			} catch (error) {
				console.error('💾 Error uploading captured image:', error);
				debugImageId = null;
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

		// Make Azure API call with safety fallback
		let result: any;
		try {
			result = await makeAzureApiCallWithSafetyFallback(azureFormData, azureApiUrl, c.env.AZURE_OPENAI_API_KEY);
		} catch (error: any) {
			const errorData = JSON.parse(error.message);
			return c.json({
				error: 'Failed to edit image with Azure OpenAI',
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
				
				// Store only what's needed for regeneration
				const metadata = {
					prompt: prompt,
					input_image_id: debugImageId
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
				
				console.log('Cloudflare Images response status:', uploadResponse.status);
				
				if (!uploadResponse.ok) {
					const uploadResponseText = await uploadResponse.text();
					console.log('Cloudflare Images response:', uploadResponseText);
					console.error('Cloudflare Images upload failed - falling back to base64');
					// Fallback to base64 data URL
					const imageDataUrl = `data:image/png;base64,${base64Data}`;
					return c.json({ output: imageDataUrl });
				}
				
				const uploadResult: any = await uploadResponse.json();
				console.log('Cloudflare Images response:', uploadResult);
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

// Gallery API endpoint - list all images (used by admin interface)
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

// Regenerate image endpoint
app.post('/api/regenerate/:id', async (c) => {
	try {
		const imageId = c.req.param('id');
		console.log('🔄 Regenerating image with ID:', imageId);
		
		// Fetch original image metadata
		const metadataResponse = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
			{
				headers: {
					'Authorization': `Bearer ${c.env.CLOUDFLARE_IMAGES_TOKEN}`,
				},
			}
		);
		
		if (!metadataResponse.ok) {
			console.error('Failed to fetch image metadata:', metadataResponse.status);
			return c.json({ error: 'Original image not found' }, 404);
		}
		
		const metadataResult: any = await metadataResponse.json();
		const originalMetadata = metadataResult.result.meta || {};
		
		console.log('📋 Original metadata:', originalMetadata);
		
		// Extract original parameters
		const originalPrompt = originalMetadata.prompt;
		const originalSize = originalMetadata.size || '1024x1536';
		
		if (!originalPrompt) {
			return c.json({ error: 'Original prompt not found in metadata' }, 400);
		}
		
		// Get original image for reference (same as original generation)
		const originalImageUrl = `https://imagedelivery.net/w4vz7D3Y5kElKOG8VzkQ5A/${imageId}/public`;
		const originalImageResponse = await fetch(originalImageUrl);
		
		if (!originalImageResponse.ok) {
			return c.json({ error: 'Failed to fetch original image' }, 400);
		}
		
		const originalImageBlob = await originalImageResponse.blob();
		
		// Create form data for regeneration (reuse existing Azure logic)
		const azureFormData = new FormData();
		azureFormData.append('image[]', originalImageBlob, 'original.png');
		
		// Add reference image for style guidance (same as original)
		try {
			const referenceImageUrl = 'https://prio-conception.thomash-efd.workers.dev/prioreference.jpeg';
			const referenceResponse = await fetch(referenceImageUrl);
			if (referenceResponse.ok) {
				const referenceBlob = await referenceResponse.blob();
				azureFormData.append('image[]', referenceBlob, 'prioreference.jpeg');
				console.log('✅ Reference image added for regeneration');
			}
		} catch (error) {
			console.warn('⚠️ Error loading reference image for regeneration:', error);
		}
		
		azureFormData.append('prompt', originalPrompt + BASE_PROMPT_INSTRUCTIONS);
		azureFormData.append('model', 'gpt-image-1');
		azureFormData.append('size', originalSize);
		azureFormData.append('quality', 'high');
		azureFormData.append('n', '1');
		
		const azureApiUrl = `https://gptimagemain1-resource.cognitiveservices.azure.com/openai/deployments/gpt-image-1/images/edits?api-version=2025-04-01-preview`;
		
		// Make Azure API call with safety fallback (reuse existing function)
		let result: any;
		try {
			result = await makeAzureApiCallWithSafetyFallback(azureFormData, azureApiUrl, c.env.AZURE_OPENAI_API_KEY);
		} catch (error: any) {
			const errorData = JSON.parse(error.message);
			return c.json({
				error: 'Failed to regenerate image with Azure OpenAI',
				details: errorData
			}, 500);
		}
		
		// Upload regenerated image to Cloudflare Images
		if (result.data && result.data[0] && result.data[0].b64_json) {
			try {
				// Generate new unique image ID
				const newImageId = `prio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
				console.log('🆕 New regenerated image ID:', newImageId);
				
				// Convert base64 to blob for upload
				const base64Data = result.data[0].b64_json;
				const binaryString = atob(base64Data);
				const bytes = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}
				
				// Upload to Cloudflare Images with metadata
				const uploadFormData = new FormData();
				uploadFormData.append('file', new Blob([bytes], { type: 'image/png' }), `${newImageId}.png`);
				uploadFormData.append('id', newImageId);
				
				// Store only what's needed for regeneration
				const metadata = {
					prompt: originalPrompt,
					input_image_id: originalMetadata.input_image_id
				};
				uploadFormData.append('metadata', JSON.stringify(metadata));
				
				const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${c.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`;
				const uploadResponse = await fetch(uploadUrl, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${c.env.CLOUDFLARE_IMAGES_TOKEN}`,
					},
					body: uploadFormData
				});
				
				if (!uploadResponse.ok) {
					const uploadResponseText = await uploadResponse.text();
					console.error('Cloudflare Images upload failed for regeneration:', uploadResponseText);
					return c.json({ error: 'Failed to upload regenerated image' }, 500);
				}
				
				const uploadResult: any = await uploadResponse.json();
				const shareableUrl = uploadResult.result.variants[0];
				
				console.log('✅ Image regenerated successfully:', newImageId);
				return c.json({ 
					success: true, 
					output: shareableUrl,
					newImageId: newImageId,
					originalImageId: imageId
				});
				
			} catch (uploadError) {
				console.error('Error uploading regenerated image:', uploadError);
				return c.json({ error: 'Failed to upload regenerated image' }, 500);
			}
		} else {
			console.error('No image data in regeneration response:', JSON.stringify(result, null, 2));
			return c.json({ error: 'No image data received from Azure OpenAI' }, 500);
		}
		
	} catch (error: any) {
		console.error('💥 Error in image regeneration:', error);
		return c.json({
			error: 'Unexpected error during regeneration',
			details: error.message
		}, 500);
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
