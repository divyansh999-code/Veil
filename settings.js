document.addEventListener('DOMContentLoaded', () => {
    const providerSelect = document.getElementById('provider');
    const apiKeyInput = document.getElementById('apiKey');
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    // Load existing settings
    chrome.storage.local.get(['aiProvider', 'apiKey'], (result) => {
        if (result.aiProvider) providerSelect.value = result.aiProvider;
        if (result.apiKey) apiKeyInput.value = result.apiKey;
    });

    saveBtn.addEventListener('click', () => {
        const provider = providerSelect.value;
        const key = apiKeyInput.value.trim();

        if (!key) {
            statusDiv.textContent = 'Please enter a valid API key.';
            statusDiv.style.color = '#ff4a4a';
            return;
        }

        chrome.storage.local.set({
            aiProvider: provider,
            apiKey: key
        }, () => {
            statusDiv.textContent = 'Settings saved successfully!';
            statusDiv.style.color = '#0fa';
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 3000);
        });
    });
});
