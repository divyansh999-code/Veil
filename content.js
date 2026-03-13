// Sidebar Diagnostic & Management
const SIDEBAR_ID = 'pe-sidebar-container';

/**
 * Step 1: Audit Injection
 * Prevent duplicate sidebars and handle toggling safely.
 */
function init() {
    console.log('[PE] Initializing sidebar...');
    const existingContainer = document.getElementById(SIDEBAR_ID);
    if (existingContainer) {
        console.log('[PE] Existing sidebar found, toggling visibility');
        toggleSidebar(existingContainer);
        return;
    }
    createSidebar();
}

function createSidebar() {
    console.log('[PE] Creating new sidebar instance');
    const container = document.createElement('div');
    container.id = SIDEBAR_ID;
    
    // Step 1: Force container to be a completely isolated, zero-size host
    container.style.cssText = `
        all: initial !important;
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        width: 0 !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        overflow: visible !important;
        z-index: 2147483647 !important;
        display: block !important;
    `;
    
    // Attach Shadow DOM for encapsulation
    const shadow = container.attachShadow({ mode: 'open' });
    
    // UI Wrapper
    const sidebar = document.createElement('div');
    sidebar.id = 'pe-sidebar';
    sidebar.className = 'visible';
    
    // Sidebar CSS (Scoped within Shadow DOM)
    const style = document.createElement('style');
    style.textContent = `
        :host {
            all: initial;
            font-family: 'Inter', -apple-system, system-ui, sans-serif;
            --bg-main: #0a0a0a;
            --surface: #111111;
            --border: #222222;
            --text-primary: #ffffff;
            --text-secondary: #888888;
            --text-muted: #555555;
            --severity-high: #ff4444;
            --severity-medium: #ff8800;
            --severity-low: #ffcc00;
            --status-success: #00ff88;
        }
        #pe-sidebar {
            position: fixed;
            top: 0;
            right: -380px;
            width: 380px;
            height: 100vh;
            z-index: 2147483647;
            background: var(--bg-main);
            border-left: 1px solid var(--border);
            box-shadow: -4px 0 24px rgba(0,0,0,0.8);
            color: var(--text-primary);
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            transition: right 0.3s cubic-bezier(0, 0, 0.2, 1);
            pointer-events: auto; /* Re-enable clicks for sidebar itself */
        }
        #pe-sidebar.visible {
            right: 0;
        }
        .header {
            padding: 20px;
            border-bottom: 1px solid var(--border);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #close-btn {
            position: absolute;
            top: 10px;
            right: 15px;
            width: 40px;
            height: 40px;
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s, border-radius 0.2s;
        }
        #close-btn:hover { 
            background: #1a1a1a;
            border-radius: 50%;
        }
        h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
            text-align: center;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }
        .main-content {
            padding: 24px;
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .btn-primary {
            width: 100%;
            height: 48px;
            background: #ffffff;
            color: #000000;
            font-weight: 700;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-size: 15px;
            box-shadow: 0 4px 14px rgba(255,255,255,0.15);
            transition: background 0.2s, box-shadow 0.2s;
            margin-bottom: 16px;
        }
        .btn-primary:hover:not(:disabled) { background: #e0e0e0; }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        #settings-link {
            text-align: center;
            color: white;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 44px;
            margin-bottom: 24px;
            border: 1px solid #333;
            border-radius: 50px;
            transition: border-color 0.2s;
        }
        #settings-link:hover { border-color: #666; }
        #status {
            text-align: center;
            font-size: 13px;
            color: var(--text-secondary);
            margin-bottom: 24px;
            min-height: 1.2em;
        }
        #status.complete { color: var(--status-success); }
        #status.error { color: var(--severity-high); }
        #results-container {
            flex: 1;
            overflow-y: auto;
            padding-right: 8px;
        }
        #results-container::-webkit-scrollbar { width: 4px; }
        #results-container::-webkit-scrollbar-track { background: #111; }
        #results-container::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 10px;
        }
        #results-container::-webkit-scrollbar-thumb:hover { background: #555; }
        .result-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-left: 3px solid var(--severity-low);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            animation: slideIn 0.3s cubic-bezier(0, 0, 0.2, 1);
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .result-card.high { border-left-color: var(--severity-high); }
        .result-card.medium { border-left-color: var(--severity-medium); }
        .result-card.low { border-left-color: var(--severity-low); }
        .card-category {
            display: block;
            font-weight: 700;
            font-size: 13px;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 8px;
        }
        .card-element {
            font-style: italic;
            font-size: 13px;
            color: var(--text-secondary);
            margin-bottom: 8px;
            display: block;
        }
        .card-explanation {
            font-size: 13px;
            line-height: 1.6;
            color: #cccccc;
        }
    `;
    
    // HTML Template
    sidebar.innerHTML = `
        <div class="header">
            <h2>VEIL</h2>
            <button id="close-btn">&times;</button>
        </div>
        <div class="main-content">
            <div id="status">Click "Scan Page" to analyze</div>
            <button id="scan-btn" class="btn-primary">Scan Page</button>
            <a href="#" id="settings-link">⚙ Settings</a>
            <div id="results-container"></div>
        </div>
    `;
    
    shadow.appendChild(style);
    shadow.appendChild(sidebar);
    
    // Append to documentElement for maximum isolation
    document.body.appendChild(container);
    
    /**
     * Step 2: Audit Event Listeners
     * Query from Shadow Root and use addEventListener
     */
    const closeBtn = shadow.getElementById('close-btn');
    const settingsLink = shadow.getElementById('settings-link');
    const scanBtn = shadow.getElementById('scan-btn');

    closeBtn.addEventListener('click', () => toggleSidebar(container));
    settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.sendMessage({ action: 'OPEN_SETTINGS' });
    });
    scanBtn.addEventListener('click', () => handleScan(shadow));

    // Show with animation
    setTimeout(() => sidebar.classList.add('visible'), 50);
}

function toggleSidebar(container) {
    const sidebar = container.shadowRoot.getElementById('pe-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('visible');
    }
}

/**
 * Step 3 & 4: Audit Message Passing & Scanning Lifecycle
 */
async function handleScan(shadow) {
    console.log('[PE] Scan triggered');
    const scanBtn = shadow.getElementById('scan-btn');
    const status = shadow.getElementById('status');
    const resultsContainer = shadow.getElementById('results-container');
    
    // UI State: Loading
    scanBtn.disabled = true;
    scanBtn.textContent = 'Scanning...';
    status.textContent = 'Scraping page content...';
    status.className = ''; 
    resultsContainer.innerHTML = '';

    try {
        // Scrape content
        const content = scrapeContent();
        if (!content || content.length === 0) {
            status.textContent = 'No suitable content found to scan.';
            scanBtn.disabled = false;
            scanBtn.textContent = 'Scan Page';
            return;
        }

        status.textContent = 'Analyzing with AI...';
        console.log('[PE] Sending content to background for analysis...');

        // Step 3: Message to background
        chrome.runtime.sendMessage({
            action: 'ANALYZE_CONTENT',
            content: content
        }, response => {
            console.log('[PE] Received response from background:', response);
            
            scanBtn.disabled = false;
            scanBtn.textContent = 'Scan Page';
            
            if (!response) {
                status.textContent = 'Error: Service unreachable.';
                status.className = 'error';
                return;
            }

            if (response.error) {
                status.textContent = 'Error: ' + response.error;
                status.className = 'error';
            } else {
                status.textContent = 'Analysis complete.';
                status.className = 'complete';
                // Step 4: Render results
                renderResults(shadow, response.data);
                highlightElements(response.data);
            }
        });
    } catch (err) {
        console.error('[PE] Scan error:', err);
        status.textContent = 'Fatal Error during scan.';
        status.className = 'error';
        scanBtn.disabled = false;
        scanBtn.textContent = 'Scan Page';
    }
}

function renderResults(shadow, data) {
    const container = shadow.getElementById('results-container');
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="result-card"><div class="card-explanation">No manipulative patterns detected.</div></div>';
        return;
    }

    data.forEach(item => {
        const div = document.createElement('div');
        const severity = (item.severity || 'low').toLowerCase();
        div.className = `result-card ${severity}`;
        div.innerHTML = `
            <span class="card-category">${item.category || 'Unknown Pattern'}</span>
            <span class="card-element">"${item.element || 'Unknown Element'}"</span>
            <div class="card-explanation">${item.explanation || ''}</div>
        `;
        container.appendChild(div);
    });
}

/**
 * Helper: Scrape Logic
 */
function scrapeContent() {
    const selectors = [
        'button', 'a', 'input[type="submit"]', 'input[type="button"]',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'b', 'em',
        '[id*="timer"]', '[class*="timer"]', '[id*="countdown"]', '[class*="countdown"]',
        '[class*="stock"]', '[class*="inventory"]', '[class*="left"]'
    ];
    
    const elements = document.querySelectorAll(selectors.join(','));
    const scrapedData = [];
    const uniqueTexts = new Set();

    elements.forEach((el, index) => {
        const text = (el.innerText || el.value || '').trim();
        // Visibility and length filter
        if (text && text.length > 3 && text.length < 500 && el.offsetParent !== null) {
            if (!uniqueTexts.has(text)) {
                uniqueTexts.add(text);
                const uniqueId = `pe-target-${index}`;
                el.setAttribute('data-pe-id', uniqueId);
                scrapedData.push({ id: uniqueId, text: text });
            }
        }
    });

    return scrapedData.slice(0, 50); // Limit to top 50 elements for speed
}

/**
 * Helper: Highlight Logic
 */
function highlightElements(tactics) {
    // Remove old highlights
    document.querySelectorAll('.pe-manipulation-highlight').forEach(el => {
        el.classList.remove('pe-manipulation-highlight');
        const badge = el.querySelector('.pe-manipulation-badge');
        if (badge) badge.remove();
    });
    
    const existingTooltip = document.querySelector('.pe-tooltip');
    if (existingTooltip) existingTooltip.remove();

    if (!tactics || !Array.isArray(tactics)) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'pe-tooltip';
    document.body.appendChild(tooltip);

    tactics.forEach(tactic => {
        if (!tactic.element) return;
        
        let targetEl = null;
        const taggedElements = document.querySelectorAll('[data-pe-id]');
        for (let el of taggedElements) {
            const text = el.innerText || el.value || '';
            if (text.includes(tactic.element) || tactic.element.includes(text)) {
                targetEl = el;
                break;
            }
        }

        if (targetEl && targetEl !== document.body) {
            targetEl.classList.add('pe-manipulation-highlight');
            const severity = (tactic.severity || 'low').toLowerCase();
            
            const badge = document.createElement('div');
            badge.className = 'pe-manipulation-badge';
            badge.innerHTML = `<span class="badge-dot ${severity}"></span> ${tactic.category || 'Pattern'}`;
            targetEl.appendChild(badge);

            targetEl.onmouseenter = (e) => {
                tooltip.innerHTML = `<b>${tactic.category}</b>${tactic.explanation}`;
                tooltip.classList.add('visible');
                updateTooltipPos(e, tooltip);
            };
            targetEl.onmousemove = (e) => updateTooltipPos(e, tooltip);
            targetEl.onmouseleave = () => tooltip.classList.remove('visible');
        }
    });
}

function updateTooltipPos(e, tooltip) {
    const padding = 15;
    let x = e.clientX + padding;
    let y = e.clientY + padding;
    if (x + 250 > window.innerWidth) x = e.clientX - 250 - padding;
    if (y + 100 > window.innerHeight) y = e.clientY - 100 - padding;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

// Register the message listener to handle toggling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'TOGGLE_SIDEBAR') {
        init();
    }
});


