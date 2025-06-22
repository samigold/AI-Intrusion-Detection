// Integration for Advanced AI-powered Intrusion Detection Visualizer
// This script adds the additional functionality requested:
// 1. OpenAI anomaly detection with system prompt
// 2. Real-time alerts for critical threats
// 3. IP intelligence lookup
// 4. Enhanced AI explanations
// 5. Education tab with AI-powered assistance

// Variables to track state - use the global intrusionApp object
// let mapInitialized = false;
// let map = null;
// let markers = [];
// let ipCache = {};

// Use the global shared object
const app = window.intrusionApp || {
  mapInitialized: false,
  map: null,
  markers: [],
  ipCache: {}
};
window.intrusionApp = app;

// Wait for the original script to load before adding our enhancements
document.addEventListener('DOMContentLoaded', function() {
  // Give the original script time to initialize
  setTimeout(() => {
    setupEnhancedFunctionality();
  }, 500);
});

// Setup all enhanced functionality
function setupEnhancedFunctionality() {
  // Initialize event listeners
  setupEducationTab();
  setupAIChat();
  setupAnalysisEnhancement();
  
  // Add CSS for Leaflet if needed for the map
  if (!document.getElementById('leaflet-css')) {
    const leafletCSS = document.createElement('link');
    leafletCSS.id = 'leaflet-css';
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCSS);
  }
  
  // Add Leaflet.js script for the map
  if (!document.getElementById('leaflet-js')) {
    const leafletJS = document.createElement('script');
    leafletJS.id = 'leaflet-js';
    leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(leafletJS);
  }
    // Update tab switching to initialize map when needed
  const tabIntel = document.getElementById('tab-intel');
  if (tabIntel) {
    tabIntel.addEventListener('click', function() {
      if (window.logData && window.logData.length > 0 && !app.mapInitialized) {
        initMap();
      }
    });
  }
  
  // Setup IP lookup functionality
  const ipLookupBtn = document.getElementById('ip-lookup-btn');
  if (ipLookupBtn) {
    ipLookupBtn.addEventListener('click', performIpLookup);
  }
  
  console.log('Enhanced functionality setup complete');
}

// Make functions globally available
window.initMap = initMap;
window.performOpenAIAnalysis = performOpenAIAnalysis;
window.performIpLookup = performIpLookup;

// Function to lookup IP intelligence data - wrapper for performIpLookup
function lookupIPIntelligence(ip) {
  const ipLookupInput = document.getElementById('ip-lookup-input');
  if (ipLookupInput && ip) {
    ipLookupInput.value = ip;
    performIpLookup();
  }
}

// Make lookupIPIntelligence globally available after defining it
window.lookupIPIntelligence = lookupIPIntelligence;

// Setup education tab accordions
function setupEducationTab() {
  const eduToggles = document.querySelectorAll('.edu-toggle');
  eduToggles.forEach(toggle => {
    toggle.addEventListener('click', toggleEducationSection);
  });
}

// Toggle education sections
function toggleEducationSection() {
  // Toggle the icon rotation
  const icon = this.querySelector('i.fa-chevron-down');
  icon.classList.toggle('rotate-180');
  
  // Toggle content visibility
  const content = this.parentElement.querySelector('.edu-content');
  content.classList.toggle('hidden');
}

// Setup AI chat functionality
function setupAIChat() {
  const aiChatSend = document.getElementById('ai-chat-send');
  const aiChatInput = document.getElementById('ai-chat-input');
  
  if (aiChatSend && aiChatInput) {
    aiChatSend.addEventListener('click', sendAiChatMessage);
    aiChatInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        sendAiChatMessage();
      }
    });
  }
}

// Setup enhanced analysis
function setupAnalysisEnhancement() {
  // Replace or enhance the analyze button functionality
  const analyzeBtn = document.getElementById('analyze-btn');
  if (analyzeBtn) {
    // Store original handler if it exists
    const originalHandler = analyzeBtn.onclick;
    
    // Replace with enhanced handler
    analyzeBtn.onclick = function() {
      const fileUpload = document.getElementById('file-upload');
      const file = fileUpload.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          // Parse JSON data
          const logData = JSON.parse(e.target.result);
          window.logData = logData; // Make it globally available
          
          // Show dashboard and hide no data message
          const dashboard = document.getElementById('dashboard');
          const noDataSection = document.getElementById('no-data');
          dashboard.classList.remove('hidden');
          noDataSection.classList.add('hidden');
          
          // Get AI toggle state
          const aiEnabled = document.getElementById('ai-toggle').checked;
          const useOpenAI = document.getElementById('openai-toggle').checked;
          
          // Check for critical threats immediately
          checkForCriticalThreats(logData);
          
          // Process with original function or our enhanced version
          if (typeof window.processData === 'function') {
            // If AI is enabled, analyze first
            if (aiEnabled) {
              if (useOpenAI) {
                // Show loading indicator
                showRealTimeAlert("OpenAI analysis in progress...", "info");
                
                // Try OpenAI with fallback
                performOpenAIAnalysis(logData)
                  .then(() => {
                    window.processData(logData);
                    showRealTimeAlert("OpenAI analysis complete", "success");
                  })
                  .catch(error => {
                    console.error("OpenAI analysis failed:", error);
                    showRealTimeAlert("OpenAI analysis failed, using local analysis", "warning");
                    
                    // Fallback
                    performLocalAnalysis(logData);
                    window.processData(logData);
                  });
              } else {
                // Use local analysis
                showRealTimeAlert("AI analysis in progress...", "info");
                
                // Simulate processing time
                setTimeout(() => {
                  performLocalAnalysis(logData);
                  window.processData(logData);
                  showRealTimeAlert("AI analysis complete", "success");
                }, 1000);
              }
            } else {
              // Process immediately without AI
              window.processData(logData);
            }
          } else {
            console.error("Original processData function not found");
          }
          
        } catch (error) {
          alert('Error parsing JSON file: ' + error.message);
          console.error('Error parsing JSON:', error);
        }
      };
      
      reader.readAsText(file);
    };
  }
}

// Check for critical threats that warrant real-time alerts
function checkForCriticalThreats(data) {
  // Prevent recursive calls - use the additionalFunctions namespace if available
  if (window.additionalFunctions && typeof window.additionalFunctions.checkForCriticalThreats === 'function' 
      && window.additionalFunctions.checkForCriticalThreats !== checkForCriticalThreats) {
    console.log("Using additionalFunctions.checkForCriticalThreats");
    window.additionalFunctions.checkForCriticalThreats(data);
    return;
  }
  
  console.log("Using enhanced-features.js checkForCriticalThreats");
  
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

// Enhanced OpenAI analysis
async function performOpenAIAnalysis(data) {
  const openaiKeyInput = document.getElementById('openai-key');
  const apiKey = openaiKeyInput.value.trim() || localStorage.getItem('openai_api_key');
  
  if (!apiKey) {
    throw new Error('OpenAI API key is missing');
  }
  
  // We'll analyze the logs in batches to stay within token limits
  const batchSize = 10;
  const batches = [];
  
  // Create batches
  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize));
  }
  
  // Process each batch
  for (const batch of batches) {
    const systemPrompt = `
You are a cybersecurity analyst. Analyze these network logs and determine if any are suspicious.
For each log, add:
1. "anomaly": true/false (true if suspicious)
2. "aiDetectionReason": a brief explanation if anomaly=true

Look for: 
- Multiple failed login attempts from the same IP
- Unusual port activity
- Suspicious timestamps (e.g., late night activity)
- Patterns that suggest automated attacks
- Unusual sequences of actions`;

    const userPrompt = `Analyze these network logs and add "anomaly" and "aiDetectionReason" fields:
${JSON.stringify(batch, null, 2)}

Respond with ONLY a valid JSON array containing the logs with your analysis added.`;

    try {      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1500
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
        
        // Update the original data with AI analysis
        if (Array.isArray(analyzedData)) {
          analyzedData.forEach(analyzedItem => {
            // Find the matching item in the original data
            const originalIndex = data.findIndex(item => 
              item.ip === analyzedItem.ip && 
              item.timestamp === analyzedItem.timestamp &&
              item.port === analyzedItem.port
            );
            
            if (originalIndex !== -1) {
              // Update with AI analysis
              data[originalIndex].anomaly = analyzedItem.anomaly || false;
              if (analyzedItem.anomaly && analyzedItem.aiDetectionReason) {
                data[originalIndex].aiDetectionReason = analyzedItem.aiDetectionReason;
              }
            }
          });
        }
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        throw error;
      }
    } catch (error) {
      console.error('OpenAI API request error:', error);
      throw error;
    }
  }
  
  return data;
}

// Local AI analysis 
function performLocalAnalysis(data) {
  // Frequency analysis (detect IPs with high numbers of failed login attempts)
  const ipFailedCounts = {};
  data.forEach(entry => {
    if (entry.action === 'login_attempt' && !entry.success) {
      ipFailedCounts[entry.ip] = (ipFailedCounts[entry.ip] || 0) + 1;
    }
  });
  
  // Find the threshold for anomalies (simple approach: more than 3 failed attempts)
  const failedThreshold = 3;
  
  // Mark anomalies based on failed login frequency
  data.forEach(entry => {
    if (entry.action === 'login_attempt' && !entry.success && ipFailedCounts[entry.ip] >= failedThreshold) {
      entry.anomaly = true;
      entry.aiDetectionReason = `High number of failed login attempts (${ipFailedCounts[entry.ip]}) from this IP`;
    }
  });
  
  // Time-based analysis (suspicious hours)
  data.forEach(entry => {
    const date = new Date(entry.timestamp);
    const hour = date.getHours();
    
    // Late night activity (midnight to 5am)
    if (hour >= 0 && hour <= 5) {
      entry.anomaly = true;
      entry.aiDetectionReason = entry.aiDetectionReason || "Suspicious activity during unusual hours (midnight to 5am)";
    }
  });
  
  // Success rate analysis
  const ipStats = {};
  data.forEach(entry => {
    if (entry.action === 'login_attempt') {
      if (!ipStats[entry.ip]) {
        ipStats[entry.ip] = { attempts: 0, success: 0 };
      }
      
      ipStats[entry.ip].attempts++;
      if (entry.success) {
        ipStats[entry.ip].success++;
      }
    }
  });
  
  // Check success rates
  Object.keys(ipStats).forEach(ip => {
    const stats = ipStats[ip];
    if (stats.attempts >= 3) {
      const successRate = stats.success / stats.attempts;
      
      // Mark as anomaly if success rate is very low
      if (successRate < 0.3) {
        data.forEach(entry => {
          if (entry.ip === ip && entry.action === 'login_attempt') {
            entry.anomaly = true;
            entry.aiDetectionReason = entry.aiDetectionReason || 
              `Suspiciously low success rate (${Math.round(successRate * 100)}%) for login attempts`;
          }
        });
      }
    }
  });
  
  // Unusual port analysis
  const commonPorts = [22, 80, 443, 3306, 3389, 8080];
  data.forEach(entry => {
    if (!commonPorts.includes(entry.port)) {
      entry.anomaly = true;
      entry.aiDetectionReason = entry.aiDetectionReason || `Unusual port (${entry.port}) activity detected`;
    }
  });
  
  return data;
}

// Initialize the map for IP visualization
function initMap() {
  // Check if Leaflet is loaded
  if (typeof L === 'undefined') {
    console.error('Leaflet is not loaded yet');
    setTimeout(initMap, 500);
    return;
  }
  
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container not found');
    return;
  }
  
  // Create the map
  app.map = L.map('map', {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxBounds: [
      [-90, -180],
      [90, 180]
    ]
  });
  
  // Add dark-themed map tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(app.map);
  
  // Add IP markers if we have data
  if (window.logData && window.logData.length > 0) {
    populateMap(window.logData);
  }
  
  app.mapInitialized = true;
}

// Add IP markers to the map
async function populateMap(data) {
  if (!app.map) return;
  
  // Clear existing markers
  if (app.markers.length > 0) {
    app.markers.forEach(marker => app.map.removeLayer(marker));
    app.markers = [];
  }
  
  // Get unique IPs
  const uniqueIPs = [...new Set(data.map(entry => entry.ip))];
  
  // Process each IP
  for (const ip of uniqueIPs) {
    // Skip private IPs
    if (isPrivateIP(ip)) continue;
    
    try {
      // Get IP location data
      const ipData = await getIPInfo(ip);
      
      if (ipData && ipData.latitude && ipData.longitude) {
        // Count anomalies for this IP
        const entries = data.filter(entry => entry.ip === ip);
        const anomalyCount = entries.filter(entry => entry.anomaly).length;
        const totalCount = entries.length;
        const threatLevel = anomalyCount / totalCount;
        
        // Create marker
        const markerColor = getMarkerColor(threatLevel);
        const markerSize = 8 + Math.min(totalCount * 2, 20); // Size based on activity count
        
        const marker = L.circleMarker([ipData.latitude, ipData.longitude], {
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
            <p>Threat Level: ${Math.round(threatLevel * 100)}%</p>          </div>
        `);
        
        // Add to map
        marker.addTo(app.map);
        app.markers.push(marker);
      }
    } catch (error) {
      console.error(`Error adding marker for IP ${ip}:`, error);
    }
  }
  
  // Update IP history table
  updateIPHistoryTable(data);
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
  if (app.ipCache[ip]) {
    return app.ipCache[ip];
  }
  
  // Skip lookup for private IPs
  if (isPrivateIP(ip)) {
    return { 
      latitude: 0, 
      longitude: 0, 
      city: 'Private Network', 
      country_name: 'Local', 
      org: 'Internal'
    };
  }
  
  try {
    // Use ipapi.co for geolocation
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    
    if (!response.ok) {
      throw new Error(`IP lookup failed: ${response.status}`);    }
    
    const data = await response.json();
    
    // Cache the result
    app.ipCache[ip] = data;
    return data;
  } catch (error) {
    console.error(`Error fetching IP info for ${ip}:`, error);
    return null;
  }
}

// Perform IP lookup when requested by user
async function performIpLookup() {
  const ipLookupInput = document.getElementById('ip-lookup-input');
  const ipDetails = document.getElementById('ip-details');
  
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
        <div class="flex justify-between items-center border-b border-gray-700 pb-2">          <span class="text-gray-400">Timezone:</span>
          <span class="text-white">${ipData.timezone || 'Unknown'}</span>
        </div>
      </div>
    `;
    
    // If we have a map and valid coordinates, focus the map on this location
    if (app.map && ipData.latitude && ipData.longitude) {
      app.map.setView([ipData.latitude, ipData.longitude], 10);
        // Highlight this IP on the map if it exists in our data
      const marker = app.markers.find(m => {
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
function updateIPHistoryTable(data) {
  const ipHistoryTable = document.getElementById('ip-history-table');
  if (!ipHistoryTable || !data || data.length === 0) return;
  
  // Clear the table
  ipHistoryTable.innerHTML = '';
  
  // Get unique IPs and their data
  const uniqueIPs = [...new Set(data.map(entry => entry.ip))];
  const ipData = uniqueIPs.map(ip => {
    const entries = data.filter(entry => entry.ip === ip);
    const anomalyCount = entries.filter(entry => entry.anomaly).length;
    const failedLoginCount = entries.filter(entry => 
      entry.action === 'login_attempt' && entry.success === false
    ).length;
    const lastSeen = new Date(Math.max(...entries.map(e => new Date(e.timestamp).getTime())));
    const threatLevel = anomalyCount / entries.length;
    
    return {
      ip,
      count: entries.length,
      anomalyCount,      failedLoginCount,
      lastSeen,
      threatLevel,
      location: app.ipCache[ip] ? 
        `${app.ipCache[ip].city || ''}, ${app.ipCache[ip].country_name || 'Unknown'}` : 
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

// AI Chat Functions
async function sendAiChatMessage() {
  const aiChatInput = document.getElementById('ai-chat-input');
  const aiChatMessages = document.getElementById('ai-chat-messages');
  const openaiToggle = document.getElementById('openai-toggle');
  const openaiKeyInput = document.getElementById('openai-key');
  
  const userInput = aiChatInput.value.trim();
  if (!userInput) return;
  
  // Add user message to chat
  addChatMessage(userInput, 'user', aiChatMessages);
  
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
  const useOpenAI = openaiToggle.checked;
  const apiKey = openaiKeyInput.value.trim() || localStorage.getItem('openai_api_key');
  
  if (useOpenAI && apiKey) {
    // Try to use OpenAI
    try {
      response = await getOpenAIChatResponse(userInput, apiKey);
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
  addChatMessage(response, 'ai', aiChatMessages);
}

function addChatMessage(message, sender, chatContainer) {
  const messageElement = document.createElement('div');
  messageElement.className = 'flex ' + (sender === 'user' ? 'justify-end' : '');
  
  messageElement.innerHTML = `
    <div class="${sender === 'user' ? 'bg-cyber-blue/20' : 'bg-cyber-green/20'} rounded-lg p-2 max-w-[85%] mb-3">
      <p class="text-sm text-white">${message}</p>
    </div>
  `;
  
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function getOpenAIChatResponse(message, apiKey) {
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
    return "Port scanning is a technique used to discover open ports on a network that could be exploited. Defend against port scans by using firewalls, closing unnecessary ports, implementing intrusion detection systems, and regularly reviewing your network's exposed services.";  } else if (lowercaseMessage.includes('ddos') || lowercaseMessage.includes('denial of service')) {
    return "DDoS (Distributed Denial of Service) attacks overwhelm your servers with traffic from multiple sources. Mitigation strategies include using CDNs, implementing rate limiting, configuring your network hardware for attack prevention, and utilizing DDoS protection services like Cloudflare or AWS Shield.";
  } else if (lowercaseMessage.includes('malware') || lowercaseMessage.includes('virus')) {
    return "Malware protection requires a multi-layered approach: use antivirus software, keep systems updated, implement application whitelisting, segment your network, train users about phishing, use content filtering, and maintain regular backups.";
  } else if (lowercaseMessage.includes('best practice') || lowercaseMessage.includes('secure')) {
    return "Cybersecurity best practices include: implementing strong access controls, keeping systems patched and updated, using encryption for sensitive data, employing network segmentation, training users regularly, monitoring systems continuously, and having incident response plans ready.";
  } else {
    return "That's an interesting cybersecurity question. While I don't have specific information on that topic in my local database, I recommend following these general principles: use strong authentication, maintain least privilege access, keep systems updated, monitor for unusual activity, and have a documented security policy. For more specific guidance, consider consulting the NIST Cybersecurity Framework or OWASP guidelines.";
  }
}

// Make AI chat functions globally available
window.sendAiChatMessage = sendAiChatMessage;
window.getOpenAIChatResponse = getOpenAIChatResponse;
window.getLocalAIChatResponse = getLocalAIChatResponse;
