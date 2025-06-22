// Function to integrate with the processData function to check for critical threats
function checkForCriticalThreats(data) {
  // Look for critical patterns that warrant immediate alerts
  
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
  
  // Check for unusual port activity
  const commonPorts = [22, 80, 443, 3306, 3389, 8080];
  const unusualPorts = data.filter(entry => !commonPorts.includes(entry.port));
  
  if (unusualPorts.length > 0) {
    // Group by port
    const portCounts = {};
    unusualPorts.forEach(entry => {
      portCounts[entry.port] = (portCounts[entry.port] || 0) + 1;
    });
    
    // Alert for unusual port with multiple attempts
    Object.keys(portCounts).forEach(port => {
      if (portCounts[port] >= 3) {
        showRealTimeAlert(`⚠️ Warning: Unusual activity detected on port ${port} (${portCounts[port]} attempts)`, 'warning');
      }
    });
  }
  
  // Alert for nighttime activity
  const nighttimeActivity = data.filter(entry => {
    const hour = new Date(entry.timestamp).getHours();
    return hour >= 0 && hour <= 5;
  });
  
  if (nighttimeActivity.length >= 3) {
    showRealTimeAlert(`⚠️ Suspicious: ${nighttimeActivity.length} login attempts detected during night hours (12AM-5AM)`, 'warning');
  }
}

// Function to show real-time alerts
function showRealTimeAlert(message, type = 'warning') {
  // Create alert element
  const alertElement = document.createElement('div');
  alertElement.className = 'fixed top-4 right-4 z-50 max-w-md transform transition-transform duration-300 translate-x-full';
  
  // Set color based on alert type
  let color, icon;
  switch (type) {
    case 'critical':
      color = 'cyber-red';
      icon = 'exclamation-triangle';
      break;
    case 'warning':
      color = 'yellow-500';
      icon = 'exclamation-circle';
      break;
    case 'info':
      color = 'cyber-blue';
      icon = 'info-circle';
      break;
    default:
      color = 'cyber-green';
      icon = 'check-circle';
  }
  
  // Set content
  alertElement.innerHTML = `
    <div class="bg-cyber-gray p-4 rounded-lg shadow-lg border border-${color} flex items-start space-x-4">
      <div class="flex-shrink-0">
        <i class="fas fa-${icon} text-${color} text-xl"></i>
      </div>
      <div class="flex-grow">
        <p class="text-white font-medium">${message}</p>
        <div class="mt-1 w-full bg-gray-700 rounded-full h-1">
          <div class="bg-${color} h-1 rounded-full progress-bar"></div>
        </div>
      </div>
      <button class="flex-shrink-0 text-gray-400 hover:text-white close-alert">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // Add to DOM
  document.body.appendChild(alertElement);
  
  // Animate in
  setTimeout(() => {
    alertElement.classList.remove('translate-x-full');
  }, 10);
  
  // Add closing functionality
  const closeBtn = alertElement.querySelector('.close-alert');
  closeBtn.addEventListener('click', () => {
    alertElement.classList.add('translate-x-full');
    setTimeout(() => {
      if (alertElement.parentNode) {
        document.body.removeChild(alertElement);
      }
    }, 300);
  });
  
  // Auto close after 8 seconds
  const progressBar = alertElement.querySelector('.progress-bar');
  progressBar.style.transition = 'width 8s linear';
  setTimeout(() => {
    progressBar.style.width = '0%';
  }, 100);
  
  setTimeout(() => {
    alertElement.classList.add('translate-x-full');
    setTimeout(() => {
      if (alertElement.parentNode) {
        document.body.removeChild(alertElement);
      }
    }, 300);
  }, 8000);
}

// Debug file upload functionality
function debugFileUpload() {
  console.log("Debugging file upload functionality...");
  
  // Check if file upload element exists
  const fileUpload = document.getElementById('file-upload');
  if (!fileUpload) {
    console.error("File upload element not found!");
    // Try to locate the element by another means or create it
    return;
  }
  
  console.log("File upload element found:", fileUpload);
  
  // Check if event listeners are attached
  const oldOnChange = fileUpload.onchange;
  const hasEventListeners = fileUpload.getAttribute('listenerAttached') === 'true';
  
  console.log("Has existing event listener:", !!oldOnChange || hasEventListeners);
  
  // Ensure the file input accepts JSON files
  fileUpload.accept = ".json";
  
  // Remove any existing event listeners and add a fresh one
  fileUpload.removeEventListener('change', handleFileSelect);
  
  // Add our own enhanced handler
  fileUpload.addEventListener('change', function(e) {
    console.log("File selection event triggered");
    const file = e.target.files[0];
    
    if (file) {
      console.log("Selected file:", file.name, "Size:", file.size, "Type:", file.type);
      
      // Update UI to show the selected file
      const fileName = document.getElementById('file-name');
      const fileInfo = document.getElementById('file-info');
      const analyzeBtn = document.getElementById('analyze-btn');
      
      if (fileName) fileName.textContent = file.name;
      if (fileInfo) fileInfo.classList.remove('hidden');
      if (analyzeBtn) analyzeBtn.disabled = false;
      
      // Validate JSON file
      if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
        showRealTimeAlert("⚠️ Warning: The selected file doesn't appear to be a JSON file. Please select a valid JSON file.", 'warning');
      }
    } else {
      console.log("No file selected");
      const fileInfo = document.getElementById('file-info');
      const analyzeBtn = document.getElementById('analyze-btn');
      
      if (fileInfo) fileInfo.classList.add('hidden');
      if (analyzeBtn) analyzeBtn.disabled = true;
    }
  });
  
  fileUpload.setAttribute('listenerAttached', 'true');
  console.log("Enhanced file upload handler installed");
  
  // Also enhance the drop zone functionality
  enhanceDropZoneFunctionality();
  
  // Show a success message
  showRealTimeAlert("✅ File upload functionality has been repaired.", 'info');
}

// Enhance the drop zone functionality
function enhanceDropZoneFunctionality() {
  const dropZone = document.querySelector('label[for="file-upload"]');
  if (!dropZone) return;
  
  // Add proper drag and drop event listeners
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Highlight drop zone when item is dragged over it
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight() {
    dropZone.classList.add('border-cyber-green');
    dropZone.classList.remove('border-cyber-green/40');
  }
  
  function unhighlight() {
    dropZone.classList.remove('border-cyber-green');
    dropZone.classList.add('border-cyber-green/40');
  }
  
  // Handle dropped files
  dropZone.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const fileUpload = document.getElementById('file-upload');
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
      fileUpload.files = files; // Transfer the dropped files to the input
      
      // Trigger the change event manually
      const event = new Event('change', { bubbles: true });
      fileUpload.dispatchEvent(event);
    }
  }
  
  console.log("Enhanced drop zone functionality installed");
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
  
  // Process the message  let response;
  const apiKey = localStorage.getItem('openai_api_key');
  if (useOpenAI && apiKey) {
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

// Function to create a "Load Sample Data" button to help with JSON upload issues
function addSampleDataButton() {
  const uploadSection = document.querySelector('.bg-cyber-gray.rounded-lg.p-6.shadow-lg.border.border-cyber-green\\/20');
  if (!uploadSection) return;
  
  const existingButton = document.getElementById('load-sample-btn');
  if (existingButton) return; // Already added
  
  // Create the button
  const sampleBtn = document.createElement('button');
  sampleBtn.id = 'load-sample-btn';
  sampleBtn.className = 'px-4 py-2 mt-4 bg-cyber-blue text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors flex items-center';
  sampleBtn.innerHTML = '<i class="fas fa-file-import mr-2"></i>Load Sample Data';
  
  // Add click handler
  sampleBtn.addEventListener('click', loadSampleData);
  
  // Add to the page
  uploadSection.appendChild(sampleBtn);
  
  // Show a helper message
  const helperMsg = document.createElement('p');
  helperMsg.className = 'text-sm text-gray-400 mt-2';
  helperMsg.innerHTML = 'Having trouble uploading? Click the button above to load sample data.';
  uploadSection.appendChild(helperMsg);
  
  console.log("Added sample data button for troubleshooting");
}

// Function to load sample data if the user is having trouble with the file upload
function loadSampleData() {
  console.log("Loading sample data...");
  
  // Show loading state
  const loadingMessage = document.createElement('div');
  loadingMessage.className = 'fixed bottom-4 right-4 bg-cyber-gray p-4 rounded-lg shadow-lg border border-cyber-green/30 text-white z-50 flex items-center';
  loadingMessage.innerHTML = `
    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-cyber-green mr-3"></div>
    <span>Loading sample data...</span>
  `;
  document.body.appendChild(loadingMessage);
  
  // Try to load the included sample data
  fetch('./sample-logs.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load sample data: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      // Remove loading message
      document.body.removeChild(loadingMessage);
      
      // Process the sample data
      logData = data;
      
      // Show success message
      showRealTimeAlert("✅ Sample data loaded successfully!", 'info');
      
      // Update UI
      const fileInfoEl = document.getElementById('file-info');
      const fileNameEl = document.getElementById('file-name');
      if (fileInfoEl) fileInfoEl.classList.remove('hidden');
      if (fileNameEl) fileNameEl.textContent = 'sample-logs.json';
      
      // Show dashboard and hide no data message
      const dashboard = document.getElementById('dashboard');
      const noDataSection = document.getElementById('no-data');
      if (dashboard) dashboard.classList.remove('hidden');
      if (noDataSection) noDataSection.classList.add('hidden');
      
      // Process the data
      if (typeof checkForCriticalThreats === 'function') {
        checkForCriticalThreats(logData);
      }
      
      // Get AI toggle state
      const aiToggle = document.getElementById('ai-toggle');
      const aiEnabled = aiToggle ? aiToggle.checked : true;
      
      if (aiEnabled && typeof performAIAnalysis === 'function') {
        performAIAnalysis(logData);
      } else if (typeof processData === 'function') {
        processData(logData);
      }
    })
    .catch(error => {
      // Remove loading message
      document.body.removeChild(loadingMessage);
      
      console.error("Error loading sample data:", error);
      showRealTimeAlert(`Error loading sample data: ${error.message}`, 'critical');
      
      // Fallback to hardcoded sample data if fetch fails
      loadHardcodedSampleData();
    });
}

// Function to load hardcoded minimal sample data as a last resort
function loadHardcodedSampleData() {
  console.log("Using hardcoded sample data...");
  
  // Create a minimal sample dataset
  const sampleData = [
    {
      "ip": "192.168.1.105",
      "port": 22,
      "timestamp": "2025-06-21T08:12:34.567Z",
      "action": "login_attempt",
      "success": false,
      "anomaly": false
    },
    {
      "ip": "192.168.1.105",
      "port": 22,
      "timestamp": "2025-06-21T08:13:15.123Z",
      "action": "login_attempt",
      "success": false,
      "anomaly": false
    },
    {
      "ip": "192.168.1.105",
      "port": 22,
      "timestamp": "2025-06-21T08:14:22.890Z",
      "action": "login_attempt",
      "success": false,
      "anomaly": true
    },
    {
      "ip": "10.0.0.15",
      "port": 443,
      "timestamp": "2025-06-21T10:45:12.345Z",
      "action": "web_request",
      "success": true,
      "anomaly": false
    },
    {
      "ip": "172.16.0.87",
      "port": 3389,
      "timestamp": "2025-06-21T14:22:45.678Z",
      "action": "rdp_connection",
      "success": true,
      "anomaly": false
    }
  ];
  
  // Process the sample data
  logData = sampleData;
  
  // Show success message
  showRealTimeAlert("✅ Fallback sample data loaded!", 'info');
  
  // Update UI
  const fileInfoEl = document.getElementById('file-info');
  const fileNameEl = document.getElementById('file-name');
  if (fileInfoEl) fileInfoEl.classList.remove('hidden');
  if (fileNameEl) fileNameEl.textContent = 'sample-data.json';
  
  // Show dashboard and hide no data message
  const dashboard = document.getElementById('dashboard');
  const noDataSection = document.getElementById('no-data');
  if (dashboard) dashboard.classList.remove('hidden');
  if (noDataSection) noDataSection.classList.add('hidden');
  
  // Process the data
  if (typeof processData === 'function') {
    processData(logData);
  }
}

// Add the sample data button when the page loads
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(addSampleDataButton, 1000);
});

// Make functions globally available
window.loadSampleData = loadSampleData;
window.addSampleDataButton = addSampleDataButton;

// Make functions available globally
window.checkForCriticalThreats = checkForCriticalThreats;
window.showRealTimeAlert = showRealTimeAlert;
window.debugFileUpload = debugFileUpload;
window.enhanceDropZoneFunctionality = enhanceDropZoneFunctionality;

// Toggle education sections in the education tab
function toggleEducationSection() {
  // Toggle the icon rotation
  const icon = this.querySelector('i.fa-chevron-down');
  icon.classList.toggle('rotate-180');
  
  // Toggle content visibility
  const content = this.parentElement.querySelector('.edu-content');
  content.classList.toggle('hidden');
}

// Make sure the showRealTimeAlert function is available
if (typeof showRealTimeAlert !== 'function') {
  // Define it if it's missing
  function showRealTimeAlert(message, type = 'warning') {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = 'fixed top-4 right-4 z-50 max-w-md transform transition-transform duration-300';
    
    // Set color based on alert type
    let color, icon;
    switch (type) {
      case 'critical':
        color = 'cyber-red';
        icon = 'exclamation-triangle';
        break;
      case 'warning':
        color = 'yellow-500';
        icon = 'exclamation-circle';
        break;
      case 'info':
        color = 'cyber-blue';
        icon = 'info-circle';
        break;
      default:
        color = 'cyber-green';
        icon = 'check-circle';
    }
    
    // Set content
    alertElement.innerHTML = `
      <div class="bg-cyber-gray p-4 rounded-lg shadow-lg border border-${color} flex items-start space-x-4">
        <div class="flex-shrink-0">
          <i class="fas fa-${icon} text-${color} text-xl"></i>
        </div>
        <div class="flex-grow">
          <p class="text-white font-medium">${message}</p>
          <div class="mt-1 w-full bg-gray-700 rounded-full h-1">
            <div class="bg-${color} h-1 rounded-full progress-bar"></div>
          </div>
        </div>
        <button class="flex-shrink-0 text-gray-400 hover:text-white close-alert">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    // Add to DOM
    document.body.appendChild(alertElement);
    
    // Animate in
    setTimeout(() => {
      alertElement.classList.remove('translate-x-full');
    }, 10);
    
    // Add closing functionality
    const closeBtn = alertElement.querySelector('.close-alert');
    closeBtn.addEventListener('click', () => {
      alertElement.classList.add('translate-x-full');
      setTimeout(() => {
        if (alertElement.parentNode) {
          document.body.removeChild(alertElement);
        }
      }, 300);
    });
    
    // Auto close after 8 seconds
    const progressBar = alertElement.querySelector('.progress-bar');
    progressBar.style.transition = 'width 8s linear';
    setTimeout(() => {
      progressBar.style.width = '0%';
    }, 10);
    
    setTimeout(() => {
      alertElement.classList.add('translate-x-full');
      setTimeout(() => {
        if (alertElement.parentNode) {
          document.body.removeChild(alertElement);
        }
      }, 300);
    }, 8000);
    
    return alertElement;
  }
  
  // Make it globally available
  window.showRealTimeAlert = showRealTimeAlert;
}

// Make this function globally available to avoid conflicts with enhanced-features.js
window.additionalFunctions = window.additionalFunctions || {};
window.additionalFunctions.checkForCriticalThreats = checkForCriticalThreats;
