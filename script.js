// Global variables
let logData = [];
let charts = {};
let currentPage = 1;
const rowsPerPage = 10;
let aiEnabled = true; // Flag to toggle AI analysis
let useOpenAI = false; // Flag to toggle between local AI and OpenAI
// OpenAI API key is stored only in localStorage, never in the code

// DOM Elements
const fileUpload = document.getElementById('file-upload');
const analyzeBtn = document.getElementById('analyze-btn');
const fileInfo = document.getElementById('file-info');
const fileName = document.getElementById('file-name');
const dashboard = document.getElementById('dashboard');
const noDataSection = document.getElementById('no-data');
const tableBody = document.getElementById('log-table-body');
const tableSearch = document.getElementById('table-search');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const visibleRowsCount = document.getElementById('visible-rows');
const totalRowsCount = document.getElementById('total-rows');
const logDetailModal = document.getElementById('log-detail-modal');
const logDetailContent = document.getElementById('log-detail-content');
const closeModalBtn = document.getElementById('close-modal-btn');
const closeModalX = document.getElementById('close-modal');
const aiToggle = document.getElementById('ai-toggle');
const openaiToggle = document.getElementById('openai-toggle');
const openaiKeyContainer = document.getElementById('openai-key-container');
const openaiKeyInput = document.getElementById('openai-key');
const saveKeyBtn = document.getElementById('save-key-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const exportJsonBtn = document.getElementById('export-json-btn');

// Tab elements
const tabVis = document.getElementById('tab-vis');
const tabIntel = document.getElementById('tab-intel');
const tabEdu = document.getElementById('tab-edu');
const tabContentVis = document.getElementById('tab-content-vis');
const tabContentIntel = document.getElementById('tab-content-intel');
const tabContentEdu = document.getElementById('tab-content-edu');

// IP Intelligence elements
const ipLookupInput = document.getElementById('ip-lookup-input');
const ipLookupBtn = document.getElementById('ip-lookup-btn');
const ipDetails = document.getElementById('ip-details');
const ipHistoryTable = document.getElementById('ip-history-table');

// Education elements
const eduToggles = document.querySelectorAll('.edu-toggle');
const aiChatInput = document.getElementById('ai-chat-input');
const aiChatSend = document.getElementById('ai-chat-send');
const aiChatMessages = document.getElementById('ai-chat-messages');

// Stats elements
const totalEventsEl = document.getElementById('total-events');
const anomaliesCountEl = document.getElementById('anomalies-count');
const uniqueIpsEl = document.getElementById('unique-ips');
const failedLoginsEl = document.getElementById('failed-logins');

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  console.log("Initializing application...");
    // Load saved API key if available
  const savedKey = localStorage.getItem('openai_api_key');
  if (savedKey) {
    openaiKeyInput.value = savedKey;
    // API key is stored in localStorage only
  }
  
  // File upload event listeners
  fileUpload.addEventListener('change', handleFileSelect);
  analyzeBtn.addEventListener('click', analyzeData);
  
  // Make sure file upload is working
  setTimeout(() => {
    if (typeof debugFileUpload === 'function') {
      console.log("Running file upload debug function...");
      debugFileUpload();
    } else {
      console.warn("debugFileUpload function not available");
    }
  }, 1000);
  
  // Tab navigation
  tabVis.addEventListener('click', () => switchTab('vis'));
  tabIntel.addEventListener('click', () => switchTab('intel'));
  tabEdu.addEventListener('click', () => switchTab('edu'));
  
  // Export buttons
  exportPdfBtn.addEventListener('click', generateInfographicPDF);
  exportJsonBtn.addEventListener('click', exportJsonData);
  
  // IP Lookup
  ipLookupBtn.addEventListener('click', performIpLookup);
  
  // Education accordions
  eduToggles.forEach(toggle => {
    toggle.addEventListener('click', toggleEducationSection);
  });
  
  // AI Chat
  aiChatSend.addEventListener('click', sendAiChatMessage);
  aiChatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      sendAiChatMessage();
    }
  });
  
  // AI toggle
  aiToggle.addEventListener('change', function() {
    aiEnabled = this.checked;
    
    // Disable OpenAI toggle if AI is disabled
    openaiToggle.disabled = !this.checked;
    if (!this.checked) {
      openaiToggle.checked = false;
      openaiKeyContainer.classList.add('hidden');
    }
    
    // Show or hide a notification about AI status
    const message = document.createElement('div');
    message.className = 'fixed bottom-4 right-4 bg-cyber-gray p-4 rounded-lg shadow-lg border border-cyber-green/30 text-white z-50 flex items-center';
    message.innerHTML = `
      <i class="fas fa-${aiEnabled ? 'robot' : 'power-off'} text-cyber-green mr-3"></i>
      <span>AI Analysis ${aiEnabled ? 'Enabled' : 'Disabled'}</span>
    `;
    document.body.appendChild(message);
    
    // Remove the message after 2 seconds
    setTimeout(() => {
      document.body.removeChild(message);
    }, 2000);
  });
  
  // OpenAI toggle
  openaiToggle.addEventListener('change', function() {
    useOpenAI = this.checked;
    
    // Show/hide API key input
    if (this.checked) {
      openaiKeyContainer.classList.remove('hidden');
    } else {
      openaiKeyContainer.classList.add('hidden');
    }
    
    // Show notification
    const message = document.createElement('div');
    message.className = 'fixed bottom-4 right-4 bg-cyber-gray p-4 rounded-lg shadow-lg border border-cyber-green/30 text-white z-50 flex items-center';
    message.innerHTML = `
      <i class="fas fa-${useOpenAI ? 'brain' : 'microchip'} text-cyber-green mr-3"></i>
      <span>Using ${useOpenAI ? 'OpenAI' : 'Local'} Analysis</span>
    `;
    document.body.appendChild(message);
    
    // Remove the message after 2 seconds
    setTimeout(() => {
      document.body.removeChild(message);
    }, 2000);
  });
    // Save API key
  saveKeyBtn.addEventListener('click', function() {
    const key = openaiKeyInput.value.trim();
    if (key) {
      localStorage.setItem('openai_api_key', key);
      
      // Show confirmation
      const message = document.createElement('div');
      message.className = 'fixed bottom-4 right-4 bg-cyber-gray p-4 rounded-lg shadow-lg border border-cyber-green/30 text-white z-50 flex items-center';
      message.innerHTML = `
        <i class="fas fa-check-circle text-cyber-green mr-3"></i>
        <span>API Key Saved</span>
      `;
      document.body.appendChild(message);
      
      // Remove the message after 2 seconds
      setTimeout(() => {
        document.body.removeChild(message);
      }, 2000);
    }
  });
  
  // PDF Export
  exportPdfBtn.addEventListener('click', generateInfographicPDF);
  
  // Table search and pagination
  tableSearch.addEventListener('input', handleTableSearch);
  prevPageBtn.addEventListener('click', () => changePage(-1));
  nextPageBtn.addEventListener('click', () => changePage(1));
  
  // Modal close buttons
  closeModalBtn.addEventListener('click', closeModal);
  closeModalX.addEventListener('click', closeModal);
  
  // Click outside modal to close
  logDetailModal.addEventListener('click', function(e) {
    if (e.target === logDetailModal) {
      closeModal();
    }
  });
  
  // Escape key to close modal
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !logDetailModal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

// File Handling
function handleFileSelect(e) {
  console.log("File select handler called", e);
  const file = e.target.files[0];
  if (file) {
    console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
    fileName.textContent = file.name;
    fileInfo.classList.remove('hidden');
    analyzeBtn.disabled = false;
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      const message = document.createElement('div');
      message.className = 'mt-2 text-cyber-red text-sm';
      message.innerHTML = '⚠️ Warning: The selected file doesn\'t appear to be a JSON file. Make sure it contains valid JSON data.';
      
      // Remove any previous warning
      const existingWarning = fileInfo.querySelector('.text-cyber-red');
      if (existingWarning) {
        fileInfo.removeChild(existingWarning);
      }
      
      fileInfo.appendChild(message);
    }
  } else {
    fileInfo.classList.add('hidden');
    analyzeBtn.disabled = true;
  }
}

function analyzeData() {
  const file = fileUpload.files[0];
  if (!file) return;
  
  // Show loading message
  const loadingMessage = document.createElement('div');
  loadingMessage.className = 'loading-message fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
  loadingMessage.innerHTML = `
    <div class="bg-cyber-gray rounded-lg p-6 shadow-xl flex items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-green mr-4"></div>
      <p class="text-white">Analyzing log data...</p>
    </div>
  `;
  document.body.appendChild(loadingMessage);
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      console.log("File read successfully, parsing JSON");
      // Parse JSON data
      const jsonContent = e.target.result;
      console.log("File content length:", jsonContent.length);
      
      if (!jsonContent || jsonContent.trim() === '') {
        throw new Error("The file is empty");
      }
      
      logData = JSON.parse(jsonContent);
      console.log("JSON parsed successfully, records:", logData.length);
      
      // Remove loading message
      const loadingElem = document.querySelector('.loading-message');
      if (loadingElem && loadingElem.parentNode) {
        loadingElem.parentNode.removeChild(loadingElem);
      }
      
      // Show dashboard and hide no data message
      dashboard.classList.remove('hidden');
      noDataSection.classList.add('hidden');
        // Check for critical threats that need real-time alerts
      if (window.additionalFunctions && typeof window.additionalFunctions.checkForCriticalThreats === 'function') {
        // Use the namespaced function to avoid conflicts
        window.additionalFunctions.checkForCriticalThreats(logData);
      } else {
        // Fallback to showRealTimeAlert directly for critical threats
        checkForSimpleCriticalThreats(logData);
      }
      
      // Run AI analysis if enabled
      if (aiEnabled) {
        performAIAnalysis(logData);
      } else {
        // Process and visualize data immediately if AI is disabled
        processData(logData);
      }
    } catch (error) {
      // Remove loading message if it exists
      const loadingElem = document.querySelector('.loading-message');
      if (loadingElem && loadingElem.parentNode) {
        loadingElem.parentNode.removeChild(loadingElem);
      }
      
      console.error('Error parsing JSON:', error);
      
      // Show detailed error message
      showRealTimeAlert(`Error parsing JSON file: ${error.message}. Please make sure it's a valid JSON file.`, 'critical');
    }
  };
  
  reader.onerror = function() {
    // Remove loading message
    const loadingElem = document.querySelector('.loading-message');
    if (loadingElem && loadingElem.parentNode) {
      loadingElem.parentNode.removeChild(loadingElem);
    }
    
    console.error("Error reading file:", reader.error);
    showRealTimeAlert(`Error reading file: ${reader.error}`, 'critical');
  };
  
  try {
    reader.readAsText(file);
  } catch (err) {
    // Remove loading message if it exists
    const loadingElem = document.querySelector('.loading-message');
    if (loadingElem && loadingElem.parentNode) {
      loadingElem.parentNode.removeChild(loadingElem);
    }
    
    console.error("Exception when starting file read:", err);
    showRealTimeAlert(`Failed to read file: ${err.message}`, 'critical');
  }
}

// Data Processing
function processData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    alert('The uploaded file does not contain valid log data (expected an array of log entries)');
    return;
  }
  
  // Update stats
  updateStats(data);
  
  // Create visualizations
  createBarChart(data);
  createPieChart(data);
  createTimelineChart(data);
  
  // Populate table
  populateTable(data);
  
  // Check for critical threats and show real-time alerts
  checkForCriticalThreats(data);
}

// AI Analysis Functions
function performAIAnalysis(data) {
  // Display loading message
  const alertMessage = document.createElement('div');
  alertMessage.className = 'fixed bottom-4 right-4 bg-cyber-gray p-4 rounded-lg shadow-lg border border-cyber-green/30 text-white z-50 flex items-center';
  alertMessage.innerHTML = `
    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-cyber-green mr-3"></div>
    <span>AI analysis in progress...</span>
  `;
  document.body.appendChild(alertMessage);
    // Use OpenAI if enabled, otherwise use local analysis
  if (useOpenAI && localStorage.getItem('openai_api_key')) {
    // Use setTimeout to simulate async behavior and avoid blocking UI
    setTimeout(() => {
      performOpenAIAnalysis(data)
        .then(() => {
          finishAnalysis(data, alertMessage);
        })
        .catch(error => {
          console.error('OpenAI analysis error:', error);
          // Fallback to local analysis
          document.body.removeChild(alertMessage);
          const errorMessage = document.createElement('div');
          errorMessage.className = 'fixed bottom-4 right-4 bg-cyber-gray p-4 rounded-lg shadow-lg border border-cyber-red/30 text-white z-50 flex items-center';
          errorMessage.innerHTML = `
            <i class="fas fa-exclamation-circle text-cyber-red mr-3"></i>
            <div>
              <p class="font-medium">OpenAI Connection Error</p>
              <p class="text-sm text-gray-400">Falling back to local analysis</p>
            </div>
          `;
          document.body.appendChild(errorMessage);
          
          // Remove error message after 3 seconds
          setTimeout(() => {
            document.body.removeChild(errorMessage);
            performLocalAIAnalysis(data);
            finishAnalysis(data, null);
          }, 3000);
        });
    }, 500);
  } else {
    // Use setTimeout to avoid blocking the UI and simulate AI processing
    setTimeout(() => {
      performLocalAIAnalysis(data);
      finishAnalysis(data, alertMessage);
    }, 1500);
  }
}

// Perform analysis using OpenAI API
async function performOpenAIAnalysis(data) {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey || apiKey.trim() === '') {
    // Show a user-friendly message about the missing API key
    showRealTimeAlert('OpenAI API key is required. Please enter your API key in the settings.', 'warning');
    throw new Error('OpenAI API key is missing');
  }
  
  // Prepare a sample of data to send to OpenAI
  // We limit the size to avoid token limits
  const sampleData = data.slice(0, 20);
  
  // Create a structured analysis prompt
  const prompt = `
You are a cybersecurity AI analyzing network logs for suspicious activities.
Analyze the following logs and identify any potential security threats or anomalies.
For each suspicious entry, add an "anomaly" field set to true and an "aiDetectionReason" field with your explanation.

Log data:
${JSON.stringify(sampleData, null, 2)}

Respond with ONLY a valid JSON array of the same logs with your analysis added. 
Do not include any explanations outside the JSON structure.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity AI expert that analyzes network logs to detect intrusions and anomalies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const result = await response.json();
    const aiResponse = result.choices[0].message.content;
    
    // Parse the response and update our data
    try {
      const analyzedData = JSON.parse(aiResponse);
      
      // Transfer OpenAI's analysis to our full dataset
      if (Array.isArray(analyzedData)) {
        analyzedData.forEach(analyzedItem => {
          // Find matching items in our full dataset
          const matches = data.filter(item => 
            item.ip === analyzedItem.ip && 
            item.timestamp === analyzedItem.timestamp &&
            item.action === analyzedItem.action
          );
          
          // Apply OpenAI's analysis to all matching items
          if (analyzedItem.anomaly === true) {
            matches.forEach(match => {
              match.anomaly = true;
              match.aiDetectionReason = analyzedItem.aiDetectionReason || "Detected by OpenAI analysis";
            });
          }
        });
        
        // If OpenAI didn't find enough anomalies, run local analysis as a backup
        const anomaliesFound = data.filter(entry => entry.anomaly === true).length;
        if (anomaliesFound < 3) {
          performLocalAIAnalysis(data);
        }
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      // Fallback to local analysis
      performLocalAIAnalysis(data);
    }
  } catch (error) {
    console.error('OpenAI API request error:', error);
    throw error;
  }
}

// Perform analysis using local algorithms
function performLocalAIAnalysis(data) {
  // Run our local analysis algorithms
  detectAnomaliesByFrequency(data);
  detectAnomaliesByTimeBehavior(data);
  detectAnomaliesBySuccessRate(data);
}

// Finish up the analysis process
function finishAnalysis(data, alertMessage) {
  // Remove loading message if it exists
  if (alertMessage && alertMessage.parentNode) {
    document.body.removeChild(alertMessage);
  }
  
  // Update UI with AI detection results
  const anomalyCount = data.filter(entry => entry.anomaly === true).length;
  
  // Show completion message
  const completionMessage = document.createElement('div');
  completionMessage.className = 'fixed bottom-4 right-4 bg-cyber-gray p-4 rounded-lg shadow-lg border border-cyber-green/30 text-white z-50';  completionMessage.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-${useOpenAI && localStorage.getItem('openai_api_key') ? 'brain' : 'robot'} text-cyber-green mr-3"></i>
      <div>
        <p class="font-medium">AI Analysis Complete</p>
        <p class="text-sm text-gray-400">Detected ${anomalyCount} anomalies using ${useOpenAI && localStorage.getItem('openai_api_key') ? 'OpenAI' : 'local'} analysis</p>
      </div>
    </div>
  `;
  document.body.appendChild(completionMessage);
  
  // Remove the completion message after 5 seconds
  setTimeout(() => {
    document.body.removeChild(completionMessage);
  }, 5000);
  
  // Refresh visuals
  updateStats(data);
  createPieChart(data);
  populateTable(data);
}

// Detect IPs with abnormally high frequency of failed login attempts
function detectAnomaliesByFrequency(data) {
  // Count failed login attempts by IP
  const ipCounts = {};
  const loginAttempts = data.filter(entry => entry.action === 'login_attempt');
  
  loginAttempts.forEach(entry => {
    if (!entry.success) {
      ipCounts[entry.ip] = (ipCounts[entry.ip] || 0) + 1;
    }
  });
  
  // Calculate threshold (basic Z-score approach)
  const counts = Object.values(ipCounts);
  if (counts.length === 0) return;
  
  const average = counts.reduce((sum, count) => sum + count, 0) / counts.length;
  const squareDiffs = counts.map(count => Math.pow(count - average, 2));
  const variance = squareDiffs.reduce((sum, diff) => sum + diff, 0) / counts.length;
  const stdDev = Math.sqrt(variance);
  
  // 2 standard deviations above mean is suspicious
  const threshold = average + (2 * stdDev);
  
  // Flag anomalies
  Object.keys(ipCounts).forEach(ip => {
    if (ipCounts[ip] >= threshold && ipCounts[ip] >= 3) {
      // Flag all failed login attempts from this IP as anomalies
      data.forEach(entry => {
        if (entry.ip === ip && entry.action === 'login_attempt' && !entry.success) {
          entry.anomaly = true;
          entry.aiDetectionReason = "Unusually high number of failed login attempts";
        }
      });
    }
  });
}

// Detect login attempts occurring at suspicious times
function detectAnomaliesByTimeBehavior(data) {
  const loginAttempts = data.filter(entry => entry.action === 'login_attempt');
  
  loginAttempts.forEach(entry => {
    const date = new Date(entry.timestamp);
    const hour = date.getHours();
    
    // Flagging activity during unusual hours (midnight to 5am) as potentially suspicious
    if (hour >= 0 && hour <= 5) {
      entry.anomaly = true;
      entry.aiDetectionReason = entry.aiDetectionReason || "Login attempt during suspicious hours (midnight to 5am)";
    }
  });
}

// Detect IPs with very low success rates
function detectAnomaliesBySuccessRate(data) {
  // Group attempts by IP
  const ipAttempts = {};
  
  data.forEach(entry => {
    if (entry.action === 'login_attempt') {
      if (!ipAttempts[entry.ip]) {
        ipAttempts[entry.ip] = { total: 0, success: 0 };
      }
      
      ipAttempts[entry.ip].total++;
      if (entry.success) {
        ipAttempts[entry.ip].success++;
      }
    }
  });
  
  // Check success rate
  Object.keys(ipAttempts).forEach(ip => {
    const attempts = ipAttempts[ip];
    
    // If there are at least 3 attempts and success rate is below 30%
    if (attempts.total >= 3 && (attempts.success / attempts.total) < 0.3) {
      // Flag all attempts from this IP
      data.forEach(entry => {
        if (entry.ip === ip && entry.action === 'login_attempt') {
          entry.anomaly = true;
          entry.aiDetectionReason = entry.aiDetectionReason || "Suspiciously low success rate for login attempts";
        }
      });
    }
  });
}

// Stats Update
function updateStats(data) {
  // Total events
  totalEventsEl.textContent = data.length;
  
  // Count anomalies
  const anomalies = data.filter(entry => entry.anomaly === true).length;
  anomaliesCountEl.textContent = anomalies;
  
  // Count unique IPs
  const uniqueIps = [...new Set(data.map(entry => entry.ip))].length;
  uniqueIpsEl.textContent = uniqueIps;
  
  // Count failed logins
  const failedLogins = data.filter(entry => 
    entry.action === 'login_attempt' && entry.success === false
  ).length;
  failedLoginsEl.textContent = failedLogins;
}

// Chart Creation
function createBarChart(data) {
  // Filter login attempts that failed
  const failedLogins = data.filter(entry => 
    entry.action === 'login_attempt' && entry.success === false
  );
    // Count failed attempts by IP
  const ipCounts = {};
  failedLogins.forEach(entry => {
    ipCounts[entry.ip] = (ipCounts[entry.ip] || 0) + 1;
  });
  
  // Sort by count and take top 10
  const sortedIps = Object.keys(ipCounts)
    .sort((a, b) => ipCounts[b] - ipCounts[a])
    .slice(0, 10);
  
  const barData = {
    labels: sortedIps,
    datasets: [{
      label: 'Failed Login Attempts',
      data: sortedIps.map(ip => ipCounts[ip]),
      backgroundColor: 'rgba(0, 255, 140, 0.5)',
      borderColor: 'rgba(0, 255, 140, 1)',
      borderWidth: 1
    }]
  };
  
  const ctx = document.getElementById('bar-chart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (charts.barChart) {
    charts.barChart.destroy();
  }
  
  // Create new chart
  charts.barChart = new Chart(ctx, {
    type: 'bar',
    data: barData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(30, 32, 35, 0.8)',
          titleColor: '#00ff8c',
          bodyColor: '#ffffff',
          borderColor: '#00ff8c',
          borderWidth: 1
        }
      },      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });
}

function createPieChart(data) {
  // Count normal vs anomalous events
  const anomalies = data.filter(entry => entry.anomaly === true).length;
  const normal = data.length - anomalies;
  
  const pieData = {
    labels: ['Normal', 'Anomalous'],
    datasets: [{
      data: [normal, anomalies],
      backgroundColor: [
        'rgba(10, 132, 255, 0.7)',
        'rgba(255, 59, 48, 0.7)'
      ],
      borderColor: [
        'rgba(10, 132, 255, 1)',
        'rgba(255, 59, 48, 1)'
      ],
      borderWidth: 1
    }]
  };
  
  const ctx = document.getElementById('pie-chart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (charts.pieChart) {
    charts.pieChart.destroy();
  }
    // Create new chart
  charts.pieChart = new Chart(ctx, {
    type: 'pie',
    data: pieData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(255, 255, 255, 0.7)',
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(30, 32, 35, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#00ff8c',
          borderWidth: 1
        }
      }
    }
  });
}

function createTimelineChart(data) {
  // Filter login attempts
  const loginAttempts = data.filter(entry => entry.action === 'login_attempt');
  
  // Group by hour
  const timeGroups = {};
  loginAttempts.forEach(entry => {
    const date = new Date(entry.timestamp);
    const hour = date.toISOString().slice(0, 13); // Group by hour
    
    if (!timeGroups[hour]) {
      timeGroups[hour] = { success: 0, failed: 0 };
    }
    
    if (entry.success) {
      timeGroups[hour].success++;
    } else {
      timeGroups[hour].failed++;
    }
  });
  
  // Sort timestamps
  const sortedHours = Object.keys(timeGroups).sort();
  
  // Format labels for display
  const labels = sortedHours.map(hour => {
    const date = new Date(hour);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric'
    });
  });
  
  const timelineData = {
    labels: labels,
    datasets: [
      {
        label: 'Successful Logins',
        data: sortedHours.map(hour => timeGroups[hour].success),
        borderColor: 'rgba(0, 255, 140, 1)',
        backgroundColor: 'rgba(0, 255, 140, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Failed Logins',
        data: sortedHours.map(hour => timeGroups[hour].failed),
        borderColor: 'rgba(255, 59, 48, 1)',
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };
  
  const ctx = document.getElementById('timeline-chart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (charts.timelineChart) {
    charts.timelineChart.destroy();
  }
  // Create new chart
  charts.timelineChart = new Chart(ctx, {
    type: 'line',
    data: timelineData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(255, 255, 255, 0.7)',
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(30, 32, 35, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#00ff8c',
          borderWidth: 1,
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });
}

// Table Management
function populateTable(data) {
  // Set total rows count
  totalRowsCount.textContent = data.length;
  
  // Display first page
  currentPage = 1;
  displayTablePage();
  
  // Update pagination buttons
  updatePaginationButtons();
}

function displayTablePage() {
  // Clear table
  tableBody.innerHTML = '';
  
  // Filter data based on search
  const searchTerm = tableSearch.value.toLowerCase();
  const filteredData = logData.filter(entry => {
    return Object.values(entry).some(value => {
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm);
    });
  });
  
  // Calculate start and end indices for current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
  
  // Update visible rows count
  visibleRowsCount.textContent = filteredData.length > 0 
    ? `${startIndex + 1}-${endIndex} of ${filteredData.length}`
    : '0';
  totalRowsCount.textContent = logData.length;
  
  // Create table rows
  for (let i = startIndex; i < endIndex; i++) {
    const entry = filteredData[i];
    const row = document.createElement('tr');
    
    // Apply styling based on anomaly status
    if (entry.anomaly) {
      row.classList.add('bg-red-900/20');
    }
    
    // Format timestamp
    const timestamp = new Date(entry.timestamp).toLocaleString();
    
    // Create row content
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
        ${entry.anomaly 
          ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyber-red bg-opacity-20 text-cyber-red" title="${entry.aiDetectionReason || 'Anomaly detected'}"><i class="fas fa-exclamation-triangle mr-1"></i>Anomaly</span>` 
          : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 bg-opacity-20 text-green-500"><i class="fas fa-check-circle mr-1"></i>Normal</span>'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${timestamp}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${entry.ip}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${entry.port}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${entry.action}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        ${entry.success 
          ? '<span class="text-green-500"><i class="fas fa-check"></i></span>' 
          : '<span class="text-cyber-red"><i class="fas fa-times"></i></span>'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <button class="view-details-btn text-cyber-blue hover:text-cyber-green transition">
          <i class="fas fa-eye"></i> View
        </button>
      </td>
    `;
    
    // Add click event for viewing details
    const viewButton = row.querySelector('.view-details-btn');
    viewButton.addEventListener('click', () => showLogDetails(entry));
    
    tableBody.appendChild(row);
  }
  
  // Update pagination buttons
  updatePaginationButtons();
}

function handleTableSearch() {
  // Reset to first page when searching
  currentPage = 1;
  displayTablePage();
}

function changePage(direction) {
  // Filter data based on search for pagination calculation
  const searchTerm = tableSearch.value.toLowerCase();
  const filteredData = logData.filter(entry => {
    return Object.values(entry).some(value => {
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm);
    });
  });
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  
  // Change page if possible
  const newPage = currentPage + direction;
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    displayTablePage();
  }
}

function updatePaginationButtons() {
  // Filter data based on search for pagination calculation
  const searchTerm = tableSearch.value.toLowerCase();
  const filteredData = logData.filter(entry => {
    return Object.values(entry).some(value => {
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm);
    });
  });
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  
  // Update button states
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
  
  // Add visual indication of disabled state
  if (prevPageBtn.disabled) {
    prevPageBtn.classList.add('opacity-50');
  } else {
    prevPageBtn.classList.remove('opacity-50');
  }
  
  if (nextPageBtn.disabled) {
    nextPageBtn.classList.add('opacity-50');
  } else {
    nextPageBtn.classList.remove('opacity-50');
  }
}

// Modal Functions
function showLogDetails(entry) {
  // Format JSON for display
  const formattedJson = JSON.stringify(entry, null, 2);
  logDetailContent.textContent = formattedJson;
  
  // Show modal
  logDetailModal.classList.remove('hidden');
}

function closeModal() {
  logDetailModal.classList.add('hidden');
}

// PDF Generation Functions
function generateInfographicPDF() {
  if (!logData || logData.length === 0) {
    alert('No data available to generate PDF');
    return;
  }
  
  // Show loading message
  const loadingMessage = document.createElement('div');
  loadingMessage.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
  loadingMessage.innerHTML = `
    <div class="bg-cyber-gray rounded-lg p-6 shadow-xl flex items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-green mr-4"></div>
      <p class="text-white">Generating PDF Infographic...</p>
    </div>
  `;
  document.body.appendChild(loadingMessage);
  
  // Use setTimeout to allow the loading message to render
  setTimeout(() => {
    try {
      // Initialize jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // PDF dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      
      // Set document properties
      doc.setProperties({
        title: 'Intrusion Detection Analysis',
        subject: 'AI-powered Security Analysis Report',
        author: 'Intrusion Detection Visualizer',
        creator: 'Intrusion Detection Visualizer'
      });
      
      // Add header
      doc.setFillColor(30, 32, 35); // cyber-gray
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(0, 255, 140); // cyber-green
      doc.setFontSize(20);
      doc.text('Intrusion Detection Analysis', pageWidth / 2, 15, { align: 'center' });
      
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: 'center' });
      
      // Current Y position for content
      let yPos = 40;
      
      // Add summary statistics
      doc.setFontSize(16);
      doc.setTextColor(0, 255, 140);
      doc.text('Summary Statistics', margin, yPos);
      yPos += 10;
      
      // Statistics content
      const totalEvents = logData.length;
      const anomalies = logData.filter(entry => entry.anomaly === true).length;
      const uniqueIps = [...new Set(logData.map(entry => entry.ip))].length;
      const failedLogins = logData.filter(entry => 
        entry.action === 'login_attempt' && entry.success === false
      ).length;
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      
      const statItems = [
        { label: 'Total Events', value: totalEvents },
        { label: 'Anomalies Detected', value: anomalies },
        { label: 'Unique IP Addresses', value: uniqueIps },
        { label: 'Failed Login Attempts', value: failedLogins }
      ];
      
      // Create statistics grid
      const statBoxWidth = contentWidth / 2 - 5;
      const statBoxHeight = 15;
      let statX = margin;
      let statY = yPos;
      
      statItems.forEach((item, index) => {
        // Calculate position (2x2 grid)
        if (index % 2 === 0) {
          statX = margin;
        } else {
          statX = margin + statBoxWidth + 10;
        }
        
        if (index >= 2) {
          statY = yPos + statBoxHeight + 5;
        }
        
        // Draw stat box
        doc.setFillColor(30, 32, 35); // cyber-gray
        doc.roundedRect(statX, statY, statBoxWidth, statBoxHeight, 2, 2, 'F');
        
        // Add content
        doc.setTextColor(180, 180, 180);
        doc.setFontSize(8);
        doc.text(item.label, statX + 4, statY + 5);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text(item.value.toString(), statX + 4, statY + 12);
      });
      
      yPos = statY + statBoxHeight + 15;
      
      // Draw bar chart
      doc.setFontSize(16);
      doc.setTextColor(0, 255, 140);
      doc.text('Failed Login Attempts by IP', margin, yPos);
      yPos += 10;      // Get bar chart data
      const failedLoginAttempts = logData.filter(entry => 
        entry.action === 'login_attempt' && entry.success === false
      );
      
      // Count failed attempts by IP
      const ipCounts = {};
      failedLoginAttempts.forEach(entry => {
        ipCounts[entry.ip] = (ipCounts[entry.ip] || 0) + 1;
      });
      
      // Sort by count and take top 5
      const sortedIps = Object.keys(ipCounts)
        .sort((a, b) => ipCounts[b] - ipCounts[a])
        .slice(0, 5);
      
      // Draw bar chart
      const barChartHeight = 50;
      const barChartWidth = contentWidth;
      const barChartX = margin;
      const barChartY = yPos;
      
      // Find max value for scaling
      const maxCount = Math.max(...sortedIps.map(ip => ipCounts[ip]));
      
      // Draw bars
      const barWidth = barChartWidth / sortedIps.length - 10;
      sortedIps.forEach((ip, index) => {
        const count = ipCounts[ip];
        const barHeight = (count / maxCount) * barChartHeight;
        const barX = barChartX + (index * (barWidth + 10)) + 5;
        const barY = barChartY + (barChartHeight - barHeight);
        
        // Draw bar
        doc.setFillColor(0, 255, 140, 0.7); // cyber-green with transparency
        doc.rect(barX, barY, barWidth, barHeight, 'F');
        
        // Draw IP label
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(8);
        doc.text(ip, barX + barWidth / 2, barChartY + barChartHeight + 5, { align: 'center' });
        
        // Draw count
        doc.setTextColor(255, 255, 255);
        doc.text(count.toString(), barX + barWidth / 2, barY - 2, { align: 'center' });
      });
      
      // Draw axes
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.2);
      
      // X axis
      doc.line(barChartX, barChartY + barChartHeight, barChartX + barChartWidth, barChartY + barChartHeight);
      
      // Y axis
      doc.line(barChartX, barChartY, barChartX, barChartY + barChartHeight);
      
      yPos = barChartY + barChartHeight + 25;
      
      // Add pie chart for anomalies
      doc.setFontSize(16);
      doc.setTextColor(0, 255, 140);
      doc.text('Normal vs Anomalous Events', margin, yPos);
      yPos += 10;
      
      // Count normal vs anomalous events
      const normalCount = logData.length - anomalies;
      
      // Draw pie chart
      const pieChartRadius = 25;
      const pieChartX = pageWidth / 2;
      const pieChartY = yPos + pieChartRadius;
      
      // Draw pie sectors
      const normalRatio = normalCount / logData.length;
      const anomalyRatio = anomalies / logData.length;
      
      // Normal sector (blue)
      doc.setFillColor(10, 132, 255); // cyber-blue
      doc.circle(pieChartX, pieChartY, pieChartRadius, 'F');
      
      // Anomaly sector (red) - draw as arc over the blue circle
      if (anomalyRatio > 0) {
        doc.setFillColor(255, 59, 48); // cyber-red
        const startAngle = 0;
        const endAngle = 360 * anomalyRatio;
        
        // Convert to radians
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        // Draw arc
        doc.path([
          ['m', pieChartX, pieChartY], // move to center
          ['l', pieChartX + pieChartRadius * Math.cos(startRad), pieChartY + pieChartRadius * Math.sin(startRad)], // line to start of arc
          ['a', pieChartRadius, pieChartRadius, 0, endAngle > 180 ? 1 : 0, 1, 
            pieChartX + pieChartRadius * Math.cos(endRad), pieChartY + pieChartRadius * Math.sin(endRad)], // arc
          ['l', pieChartX, pieChartY] // line back to center
        ]).fill();
      }
      
      // Add legend
      const legendY = pieChartY + pieChartRadius + 10;
      
      // Normal legend
      doc.setFillColor(10, 132, 255);
      doc.rect(pieChartX - 40, legendY, 10, 5, 'F');
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(10);
      doc.text(`Normal (${normalCount})`, pieChartX - 25, legendY + 4);
      
      // Anomaly legend
      doc.setFillColor(255, 59, 48);
      doc.rect(pieChartX + 5, legendY, 10, 5, 'F');
      doc.text(`Anomalous (${anomalies})`, pieChartX + 20, legendY + 4);
      
      yPos = legendY + 25;
      
      // Add top anomalies section
      doc.setFontSize(16);
      doc.setTextColor(0, 255, 140);
      doc.text('Top Security Concerns', margin, yPos);
      yPos += 10;
      
      // Get anomalous entries
      const anomalousEntries = logData.filter(entry => entry.anomaly === true);
      
      // Group by IP and count
      const anomalyByIp = {};
      anomalousEntries.forEach(entry => {
        if (!anomalyByIp[entry.ip]) {
          anomalyByIp[entry.ip] = {
            count: 0,
            reasons: new Set()
          };
        }
        anomalyByIp[entry.ip].count++;
        if (entry.aiDetectionReason) {
          anomalyByIp[entry.ip].reasons.add(entry.aiDetectionReason);
        }
      });
      
      // Sort by count desc
      const topAnomalies = Object.keys(anomalyByIp)
        .sort((a, b) => anomalyByIp[b].count - anomalyByIp[a].count)
        .slice(0, 5);
      
      // Display top anomalies
      topAnomalies.forEach((ip, index) => {
        const { count, reasons } = anomalyByIp[ip];
        
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text(`${index + 1}. ${ip} - ${count} times`, margin, yPos);
        yPos += 8;
        
        // List reasons
        reasons.forEach(reason => {
          doc.setFontSize(10);
          doc.setTextColor(200, 200, 200);
          doc.text(`  - ${reason}`, margin + 10, yPos);
          yPos += 6;
        });
      });
      
      // Finalize PDF
      doc.save('intrusion_detection_analysis.pdf');
      
      // Remove loading message
      document.body.removeChild(loadingMessage);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Check console for details.');
      document.body.removeChild(loadingMessage);
    }
  }, 100);
}

// JSON Export Functions
function exportJsonData() {
  if (!logData || logData.length === 0) {
    alert('No data available to export');
    return;
  }
  
  // Convert log data to JSON string
  const jsonData = JSON.stringify(logData, null, 2);
  
  // Create a blob and link to download
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'intrusion_detection_analysis.json';
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// IP Intelligence and Map
// Using the mapInitialized, map, and markers variables from enhanced-features.js
// let mapInitialized = false; - Already defined in enhanced-features.js
// let map = null; - Already defined in enhanced-features.js
// let markers = []; - Already defined in enhanced-features.js
const ipCache = window.ipCache || {}; // Use the global one if available or create a new one

// Initialize the map for IP visualization
function initMap() {
  // Check if map already initialized in enhanced-features.js
  if (window.mapInitialized) {
    console.log("Map already initialized by enhanced-features.js");
    return;
  }
  
  // We'll use Leaflet.js for the map
  // Add leaflet CSS to the document
  if (!document.getElementById('leaflet-css')) {
    const leafletCSS = document.createElement('link');
    leafletCSS.id = 'leaflet-css';
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCSS);
  }
  
  // Add leaflet JS to the document
  if (!document.getElementById('leaflet-js')) {
    const leafletJS = document.createElement('script');
    leafletJS.id = 'leaflet-js';
    leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletJS.onload = createMap;
    document.head.appendChild(leafletJS);
  } else {
    createMap();
  }
}

// Create the actual map after Leaflet is loaded
function createMap() {  const mapContainer = document.getElementById('map');
  
  // Check if map is already initialized in enhanced-features.js
  if (window.intrusionApp && window.intrusionApp.mapInitialized) {
    console.log("Map already initialized by enhanced-features.js");
    return;
  }
  
  // Create the map
  const map = L.map('map', {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxBounds: [
      [-90, -180],
      [90, 180]
    ]
  });
  
  // Store in global app object
  if (window.intrusionApp) {
    window.intrusionApp.map = map;
    window.intrusionApp.mapInitialized = true;
  }
  
  // Add dark-themed map tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);
  
  // Add IP markers if we have data
  if (logData.length > 0) {
    populateMap();
  }
  
  mapInitialized = true;
}

// Add IP markers to the map
async function populateMap() {
  if (!map) return;
  
  // Clear existing markers
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  
  // Get unique IPs
  const uniqueIPs = [...new Set(logData.map(entry => entry.ip))];
  
  // Process each IP
  for (const ip of uniqueIPs) {
    // Skip private IPs
    if (isPrivateIP(ip)) continue;
    
    try {
      // Get IP location data
      const ipData = await getIPInfo(ip);
      
      if (ipData && ipData.lat && ipData.lon) {
        // Count anomalies for this IP
        const entries = logData.filter(entry => entry.ip === ip);
        const anomalyCount = entries.filter(entry => entry.anomaly).length;
        const totalCount = entries.length;
        const threatLevel = anomalyCount / totalCount;
        
        // Create marker
        const markerColor = getMarkerColor(threatLevel);
        const markerSize = 8 + Math.min(totalCount * 2, 20); // Size based on activity count
        
        const marker = L.circleMarker([ipData.lat, ipData.lon], {
          radius: markerSize,
          fillColor: markerColor,
          color: '#fff',
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.7
        });
        
        // Add popup with IP info
        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">${ip}</h3>
            <p>${ipData.city || ''}, ${ipData.country_name || 'Unknown'}</p>
            <p>Activity: ${totalCount} events</p>
            <p>Anomalies: ${anomalyCount}</p>
            <p>Threat Level: ${Math.round(threatLevel * 100)}%</p>
          </div>
        `);
        
        // Add to map
        marker.addTo(map);
        markers.push(marker);
      }
    } catch (error) {
      console.error(`Error adding marker for IP ${ip}:`, error);
    }
  }
  
  // Update IP history table
  updateIPHistoryTable();
}

// Get color for marker based on threat level
function getMarkerColor(threatLevel) {
  if (threatLevel >= 0.7) {
    return '#ff3b30'; // High threat - red
  } else if (threatLevel >= 0.3) {
    return '#ff9500'; // Medium threat - orange
  } else {
    return '#34c759'; // Low threat - green
  }
}

// Check if an IP is private/internal
function isPrivateIP(ip) {
  // Simple check for private IP ranges
  return ip.startsWith('10.') || 
         ip.startsWith('192.168.') || 
         ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
         ip.startsWith('127.') ||
         ip === 'localhost';
}

// Get IP information from cache or API
async function getIPInfo(ip) {
  // Return from cache if available
  if (ipCache[ip]) {
    return ipCache[ip];
  }
  
  // Skip lookup for private IPs
  if (isPrivateIP(ip)) {
    return { 
      lat: 0, 
      lon: 0, 
      city: 'Private Network', 
      country_name: 'Local', 
      org: 'Internal'
    };
  }
  
  try {
    // Use ipapi.co for geolocation (free tier has limits)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    
    if (!response.ok) {
      throw new Error(`IP lookup failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    ipCache[ip] = data;
    return data;
  } catch (error) {
    console.error(`Error fetching IP info for ${ip}:`, error);
    return null;
  }
}

// Perform IP lookup when requested by user
async function performIpLookup() {
  const ip = ipLookupInput.value.trim();
  
  if (!ip) {
    ipDetails.innerHTML = '<p class="text-cyber-red">Please enter an IP address</p>';
    return;
  }
  
  // Show loading state
  ipDetails.innerHTML = '<div class="flex justify-center items-center h-32"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-green"></div></div>';
  
  try {
    const ipData = await getIPInfo(ip);
    
    if (!ipData) {
      ipDetails.innerHTML = '<p class="text-cyber-red">Could not retrieve IP information</p>';
      return;
    }
    
    // Format and display IP info
    ipDetails.innerHTML = `
      <div class="space-y-3">
        <div class="flex justify-between items-center border-b border-gray-700 pb-2">
          <span class="text-gray-400">IP Address:</span>
          <span class="text-white font-medium">${ip}</span>
        </div>
        <div class="flex justify-between items-center border-b border-gray-700 pb-2">
          <span class="text-gray-400">Location:</span>
          <span class="text-white">${ipData.city || 'Unknown'}, ${ipData.region || ''} ${ipData.country_name || ''}</span>
        </div>
        <div class="flex justify-between items-center border-b border-gray-700 pb-2">
          <span class="text-gray-400">ISP/Organization:</span>
          <span class="text-white">${ipData.org || 'Unknown'}</span>
        </div>
        <div class="flex justify-between items-center border-b border-gray-700 pb-2">
          <span class="text-gray-400">Coordinates:</span>
          <span class="text-white">${ipData.latitude || 0}, ${ipData.longitude || 0}</span>
        </div>
        <div class="flex justify-between items-center border-b border-gray-700 pb-2">
          <span class="text-gray-400">Timezone:</span>
          <span class="text-white">${ipData.timezone || 'Unknown'}</span>
        </div>
      </div>
    `;
    
    // If we have a map and valid coordinates, focus the map on this location
    if (map && ipData.latitude && ipData.longitude) {
      map.setView([ipData.latitude, ipData.longitude], 10);
      
      // Highlight this IP on the map if it exists in our data
      const marker = markers.find(m => {
        const latLng = m.getLatLng();
        return latLng.lat === ipData.latitude && latLng.lng === ipData.longitude;
      });
      
      if (marker) {
        marker.openPopup();
      }
    }
    
  } catch (error) {
    console.error('IP lookup error:', error);
    ipDetails.innerHTML = `<p class="text-cyber-red">Error: ${error.message}</p>`;
  }
}

// Update the IP history table
function updateIPHistoryTable() {
  if (!ipHistoryTable || !logData || logData.length === 0) return;
  
  // Clear the table
  ipHistoryTable.innerHTML = '';
  
  // Get unique IPs and their data
  const uniqueIPs = [...new Set(logData.map(entry => entry.ip))];
  const ipData = uniqueIPs.map(ip => {
    const entries = logData.filter(entry => entry.ip === ip);
    const anomalyCount = entries.filter(entry => entry.anomaly).length;
    const failedLoginCount = entries.filter(entry => 
      entry.action === 'login_attempt' && entry.success === false
    ).length;
    const lastSeen = new Date(Math.max(...entries.map(e => new Date(e.timestamp).getTime())));
    const threatLevel = anomalyCount / entries.length;
    
    return {
      ip,
      count: entries.length,
      anomalyCount,
      failedLoginCount,
      lastSeen,
      threatLevel,
      location: ipCache[ip] ? 
        `${ipCache[ip].city || ''}, ${ipCache[ip].country_name || 'Unknown'}` : 
        'Unknown'
    };
  });
  
  // Sort by threat level (highest first)
  ipData.sort((a, b) => b.threatLevel - a.threatLevel);
  
  // Create table rows
  ipData.forEach(data => {
    const row = document.createElement('tr');
    
    // Apply styling based on threat level
    if (data.threatLevel >= 0.7) {
      row.classList.add('bg-red-900/20');
    } else if (data.threatLevel >= 0.3) {
      row.classList.add('bg-yellow-900/20');
    }
    
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${data.ip}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${data.location}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${data.count}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${data.failedLoginCount}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${data.lastSeen.toLocaleString()}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        ${getThreatBadge(data.threatLevel)}
      </td>
    `;
    
    ipHistoryTable.appendChild(row);
  });
}

// Generate a threat badge HTML
function getThreatBadge(threatLevel) {
  if (threatLevel >= 0.7) {
    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyber-red bg-opacity-20 text-cyber-red">High</span>';
  } else if (threatLevel >= 0.3) {
    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 bg-opacity-20 text-yellow-500">Medium</span>';
  } else {
    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 bg-opacity-20 text-green-500">Low</span>';
  }
}

// Export JSON data
function exportJsonData() {
  if (!logData || logData.length === 0) {
    alert('No data available to export');
    return;
  }
  
  // Create blob with JSON data
  const jsonString = JSON.stringify(logData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  a.href = url;
  a.download = `intrusion-analysis-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
  
  // Show success message
  const successMessage = document.createElement('div');
  successMessage.className = 'fixed bottom-4 right-4 bg-cyber-gray p-4 rounded-lg shadow-lg border border-cyber-green/30 text-white z-50 flex items-center';
  successMessage.innerHTML = `
    <i class="fas fa-check-circle text-cyber-green mr-3"></i>
    <span>JSON Data Exported Successfully</span>
  `;
  document.body.appendChild(successMessage);
  
  // Remove success message after 3 seconds
  setTimeout(() => {
    document.body.removeChild(successMessage);
  }, 3000);
}

// Tab Management
function switchTab(tabId) {
  // Update tab buttons
  [tabVis, tabIntel, tabEdu].forEach(tab => {
    tab.classList.remove('bg-cyber-green', 'text-cyber-dark');
    tab.classList.add('bg-cyber-gray', 'text-white');
  });
  
  // Hide all tab content
  [tabContentVis, tabContentIntel, tabContentEdu].forEach(content => {
    content.classList.add('hidden');
  });
  
  // Show selected tab
  if (tabId === 'vis') {
    tabVis.classList.remove('bg-cyber-gray', 'text-white');
    tabVis.classList.add('bg-cyber-green', 'text-cyber-dark');
    tabContentVis.classList.remove('hidden');
  } else if (tabId === 'intel') {
    tabIntel.classList.remove('bg-cyber-gray', 'text-white');
    tabIntel.classList.add('bg-cyber-green', 'text-cyber-dark');
    tabContentIntel.classList.remove('hidden');
    
    // Initialize map if not already done
    if (logData.length > 0 && !mapInitialized) {
      initMap();
    }
  } else if (tabId === 'edu') {
    tabEdu.classList.remove('bg-cyber-gray', 'text-white');
    tabEdu.classList.add('bg-cyber-green', 'text-cyber-dark');
    tabContentEdu.classList.remove('hidden');
  }
}

// Education Functions
function toggleEducationSection() {
  // Toggle the icon rotation
  const icon = this.querySelector('i.fa-chevron-down');
  icon.classList.toggle('rotate-180');
  
  // Toggle content visibility
  const content = this.parentElement.querySelector('.edu-content');
  content.classList.toggle('hidden');
}

// AI Chat Functions
async function sendAiChatMessage() {
  const userInput = aiChatInput.value.trim();
  if (!userInput) return;
  
  // Add user message to chat
  addChatMessage(userInput, 'user');
  
  // Clear input
  aiChatInput.value = '';
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'flex typing-indicator';
  typingIndicator.innerHTML = `
    <div class="bg-cyber-green/20 rounded-lg p-2 max-w-[85%]">
      <div class="flex space-x-2">
        <div class="w-2 h-2 rounded-full bg-cyber-green/70 animate-pulse"></div>
        <div class="w-2 h-2 rounded-full bg-cyber-green/70 animate-pulse delay-75"></div>
        <div class="w-2 h-2 rounded-full bg-cyber-green/70 animate-pulse delay-150"></div>
      </div>
    </div>
  `;
  aiChatMessages.appendChild(typingIndicator);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    // Process the message
  let response;
  if (useOpenAI && localStorage.getItem('openai_api_key')) {
    // Try to use OpenAI
    try {
      response = await getOpenAIChatResponse(userInput);
    } catch (error) {
      console.error('OpenAI chat error:', error);
      response = getLocalAIChatResponse(userInput);
    }
  } else {
    // Use local response
    response = getLocalAIChatResponse(userInput);
  }
  
  // Remove typing indicator
  if (typingIndicator.parentNode) {
    aiChatMessages.removeChild(typingIndicator);
  }
  
  // Add AI response to chat
  addChatMessage(response, 'ai');
}

function addChatMessage(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.className = 'flex ' + (sender === 'user' ? 'justify-end' : '');
  
  messageElement.innerHTML = `
    <div class="${sender === 'user' ? 'bg-cyber-blue/20' : 'bg-cyber-green/20'} rounded-lg p-2 max-w-[85%] mb-3">
      <p class="text-sm text-white">${message}</p>
    </div>
  `;
  
  aiChatMessages.appendChild(messageElement);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}

async function getOpenAIChatResponse(message) {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey || apiKey.trim() === '') {
    showRealTimeAlert('OpenAI API key is required. Please enter your API key in the settings.', 'warning');
    throw new Error('OpenAI API key is missing');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity expert assistant. Provide concise, accurate, and helpful information about network security, intrusion detection, and cybersecurity best practices. Keep responses under 3 paragraphs and focus on practical advice."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return getLocalAIChatResponse(message);
  }
}

function getLocalAIChatResponse(message) {
  // Simple keyword-based responses
  const lowercaseMessage = message.toLowerCase();
  
  if (lowercaseMessage.includes('brute force')) {
    return "Brute force attacks involve systematically trying all possible combinations of passwords until the correct one is found. To protect against them, use strong passwords, implement account lockouts after failed attempts, use multi-factor authentication, and consider IP-based rate limiting.";
  } else if (lowercaseMessage.includes('port scan')) {
    return "Port scanning is a technique used to discover open ports on a network that could be exploited. Defend against port scans by using firewalls, closing unnecessary ports, implementing intrusion detection systems, and regularly reviewing your network's exposed services.";
  } else if (lowercaseMessage.includes('ddos') || lowercaseMessage.includes('denial of service')) {
    return "DDoS (Distributed Denial of Service) attacks overwhelm your servers with traffic from multiple sources. Mitigation strategies include using CDNs, implementing rate limiting, configuring your network hardware for attack prevention, and utilizing DDoS protection services like Cloudflare or AWS Shield.";
  } else if (lowercaseMessage.includes('malware') || lowercaseMessage.includes('virus')) {
    return "Malware protection requires a multi-layered approach: use antivirus software, keep systems updated, implement application whitelisting, segment your network, train users about phishing, use content filtering, and maintain regular backups.";
  } else if (lowercaseMessage.includes('best practice') || lowercaseMessage.includes('secure')) {
    return "Cybersecurity best practices include: implementing strong access controls, keeping systems patched and updated, using encryption for sensitive data, employing network segmentation, training users regularly, monitoring systems continuously, and having incident response plans ready.";
  } else {
    return "That's an interesting cybersecurity question. While I don't have specific information on that topic in my local database, I recommend following these general principles: use strong authentication, maintain least privilege access, keep systems updated, monitor for unusual activity, and have a documented security policy. For more specific guidance, consider consulting the NIST Cybersecurity Framework or OWASP guidelines.";
 }
}

// Simple version of critical threat detection (fallback if additionalFunctions isn't available)
function checkForSimpleCriticalThreats(data) {
  console.log("Using simple critical threat detection");
  
  // Multiple failed logins from same IP
  const ipFailedCounts = {};
  data.forEach(entry => {
    if (entry.action === 'login_attempt' && !entry.success) {
      ipFailedCounts[entry.ip] = (ipFailedCounts[entry.ip] || 0) + 1;
    }
  });
  
  // Alert for IPs with many failed logins (potential brute force)
  Object.keys(ipFailedCounts).forEach(ip => {
    if (ipFailedCounts[ip] >= 5) {
      showRealTimeAlert(`🔥 Critical threat: Potential brute force attack detected from ${ip} (${ipFailedCounts[ip]} failed attempts)`, 'critical');
    }
  });
}

// Add a debug function to help with file upload issues
function debugFileUpload() {
  console.log("Debugging file upload functionality");
  
  // Check if the file upload element exists
  const fileUpload = document.getElementById('file-upload');
  if (!fileUpload) {
    console.error("File upload element not found");
    showRealTimeAlert("Error: File upload element not found", "critical");
    return;
  }
  
  console.log("File upload element found:", fileUpload);
  
  // Check event listeners
  console.log("Adding test event listener to file upload");
  fileUpload.addEventListener('change', function(e) {
    console.log("File upload change event triggered", e);
    if (e.target.files && e.target.files.length > 0) {
      console.log("File selected:", e.target.files[0].name);
    } else {
      console.log("No file selected");
    }
  });
  
  // Check analyze button
  const analyzeBtn = document.getElementById('analyze-btn');
  if (!analyzeBtn) {
    console.error("Analyze button not found");
    showRealTimeAlert("Error: Analyze button not found", "critical");
    return;
  }
  
  console.log("Analyze button found:", analyzeBtn);
  
  // Add a button to load sample data for testing
  addSampleDataButton();
}

// Add a sample data button to help users test functionality
function addSampleDataButton() {
  // Create a button element
  const sampleButton = document.createElement('button');
  sampleButton.innerHTML = '<i class="fas fa-vial mr-2"></i>Load Sample Data';
  sampleButton.className = 'ml-2 px-4 py-2 bg-cyber-blue text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors';
  sampleButton.title = "Load sample data for testing";
  
  // Add click event to load sample data
  sampleButton.addEventListener('click', function() {
    fetch('./sample-logs.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("Sample data loaded:", data);
        logData = data;
        
        // Show dashboard and hide no data message
        dashboard.classList.remove('hidden');
        noDataSection.classList.add('hidden');
        
        // Process the data
        processData(data);
        
        showRealTimeAlert("Sample data loaded successfully", "success");
      })
      .catch(error => {
        console.error('Error loading sample data:', error);
        showRealTimeAlert("Error loading sample data: " + error.message, "critical");
      });
  });
  
  // Find the upload section to add the button
  const uploadSection = document.querySelector('.flex.flex-col.md\\:flex-row.items-center.gap-4');
  if (uploadSection) {
    const buttonContainer = uploadSection.querySelector('.w-full.md\\:w-auto.flex.flex-col.gap-3');
    if (buttonContainer) {
      buttonContainer.appendChild(sampleButton);
    } else {
      uploadSection.appendChild(sampleButton);
    }
  }
}

// Call debug function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(debugFileUpload, 1000); // Delay to ensure all elements are loaded
});
