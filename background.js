const categoriesList = "Fake Urgency, Guilt Tripping, Social Proof Manipulation, Hidden Costs, Fear of Missing Out, Misleading Discounts, Dark Pattern Navigation, Emotional Manipulation";

const promptTemplate = `
Analyze the following webpage content and identify psychological manipulation tactics. 
For each tactic found, return JSON with ONLY a JSON array of objects containing:
- element: The exact text snippet from the input that is manipulative.
- category: MUST BE EXACTLY one of: ${categoriesList}.
- explanation: One sentence explaining why the text is manipulative.
- severity: "high", "medium", or "low".

If none are found, return an empty array [].
Respond ONLY with the JSON array, no markdown wrappers, no introductory text.

Content to analyze:
`;

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_SIDEBAR' }).catch(() => {
        // If message fails, the content script might not be loaded yet, inject it
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }).then(() => {
            // After injection, we need to send the toggle message to show the sidebar
            chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_SIDEBAR' });
        });
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ANALYZE_CONTENT') {
        analyzeWithAI(request.content)
            .then(data => sendResponse({ data: data }))
            .catch(err => sendResponse({ error: err.message }));
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'OPEN_SETTINGS') {
        chrome.runtime.openOptionsPage();
    }
});

async function analyzeWithAI(contentData) {
    if (!contentData || contentData.length === 0) {
        return [];
    }

    const textsToAnalyze = contentData.map(c => c.text).filter(Boolean);
    const contentText = textsToAnalyze.join('\n');
    
    // Safety truncate to avoid hitting prompt limits on basic API keys
    const truncatedContent = contentText.substring(0, 8000); 
    const fullPrompt = promptTemplate + truncatedContent;

    const storageData = await chrome.storage.local.get(['aiProvider', 'apiKey']);
    const provider = storageData.aiProvider || 'groq'; // Default format
    const apiKey = storageData.apiKey;

    if (!apiKey) {
        throw new Error('API Key missing. Please set it in Settings.');
    }

    let parsedResponse = [];

    try {
        let rawResponse = '';
        
        switch (provider) {
            case 'groq':
                rawResponse = await callOpenAICompatibleAPI('https://api.groq.com/openai/v1/chat/completions', apiKey, fullPrompt, 'llama-3.3-70b-versatile');
                break;
            case 'openai':
                rawResponse = await callOpenAICompatibleAPI('https://api.openai.com/v1/chat/completions', apiKey, fullPrompt, 'gpt-3.5-turbo');
                break;
            case 'gemini':
                rawResponse = await callGeminiAPI(apiKey, fullPrompt);
                break;
            case 'claude':
                rawResponse = await callClaudeAPI(apiKey, fullPrompt);
                break;
            default:
                throw new Error('Unsupported provider.');
        }

        rawResponse = String(rawResponse).trim();
        
        // Strip markdown backticks if present
        if (rawResponse.startsWith('```json')) rawResponse = rawResponse.substring(7);
        else if (rawResponse.startsWith('```')) rawResponse = rawResponse.substring(3);
        if (rawResponse.endsWith('```')) rawResponse = rawResponse.slice(0, -3);
        
        rawResponse = rawResponse.trim();

        // Check if Empty
        if (!rawResponse || rawResponse === '[]') return [];

        parsedResponse = JSON.parse(rawResponse);

        // Standardize output
        if (!Array.isArray(parsedResponse)) {
             if (parsedResponse.tactics && Array.isArray(parsedResponse.tactics)) {
                 parsedResponse = parsedResponse.tactics;
             } else {
                 parsedResponse = [parsedResponse];
             }
        }
    } catch (e) {
        console.error("AI Analysis Error:", e);
        throw new Error('Failed to parse AI response: ' + (e.message || 'Unknown error'));
    }

    return parsedResponse;
}

async function callOpenAICompatibleAPI(url, key, prompt, model) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: "system", content: "You are an expert at identifying psychological manipulation patterns in UI/UX. Return response strictly as a JSON array as requested." },
                { role: "user", content: prompt }
            ]
        })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `API error: ${res.statusText}`);
    }
    const data = await res.json();
    return data.choices[0].message.content;
}

async function callGeminiAPI(key, prompt) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Gemini API error: ${res.statusText}`);
    }
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
}

async function callClaudeAPI(key, prompt) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerously-allow-browser': 'true'
        },
        body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1500,
            system: "You are an expert identifying psychological manipulation patterns. Return ONLY a valid JSON array.",
            messages: [{ role: 'user', content: prompt }]
        })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Claude API error: ${res.statusText}`);
    }
    const data = await res.json();
    return data.content[0].text;
}
