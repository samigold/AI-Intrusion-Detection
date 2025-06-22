# AI-powered Intrusion Detection Visualizer

A clean and responsive dashboard interface for visualizing network logs and detecting potential security threats with AI assistance.

## Features

- **File Upload**: Upload JSON files containing network log data
- **Interactive Visualizations**: View bar charts, pie charts, and timeline graphs of your network activity
- **Data Table**: Browse through log entries with pagination and search functionality
- **AI-powered Anomaly Detection**: Automatically identifies suspicious patterns in your data
- **OpenAI Integration**: Optional advanced analysis using OpenAI's GPT models
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Cybersecurity-themed interface with dark mode colors

## AI Capabilities

The visualizer includes built-in AI capabilities to analyze network logs and detect potentially suspicious activities:

### Local AI Analysis
- **Frequency Analysis**: Detects IPs with abnormally high numbers of failed login attempts
- **Temporal Analysis**: Identifies login attempts occurring at suspicious hours (midnight to 5am)
- **Success Rate Analysis**: Flags IPs with suspiciously low login success rates
- **Contextual Explanations**: Provides reasons why specific events were flagged as anomalies

### OpenAI Integration (Optional)
- **Advanced Pattern Recognition**: Leverages OpenAI's GPT models for sophisticated analysis
- **Natural Language Explanations**: Provides detailed, human-readable explanations of detected anomalies
- **Contextual Understanding**: Identifies complex patterns that simple rule-based systems might miss
- **Complementary Analysis**: Works alongside local analysis for comprehensive threat detection

To use OpenAI integration:
1. Toggle the "Use OpenAI" switch in the upload section
2. Enter your OpenAI API key (stored locally in your browser)
3. Upload and analyze your data as normal

The AI analysis can be toggled on/off using the switch in the upload section.

## How to Use

1. Open `index.html` in a modern web browser
2. Click on the upload area or "Choose File" button to select your JSON log file
3. Click "Analyze Data" to process the file and display visualizations
4. Explore the charts and table to identify patterns and potential security issues
5. Use the search box to filter log entries
6. Click "View" on any log entry to see its complete details
7. Click the "Export Infographic PDF" button to generate a professional security report

## PDF Export Feature

The application can generate professional security infographic PDFs for reports and documentation:

- **One-Click Export**: Convert your analysis into a shareable PDF with a single click
- **Professional Layout**: Includes charts, statistics, and key security findings
- **Top Security Concerns**: Highlights the most critical security issues detected
- **Branded Reports**: Includes header, footer, and timestamps for documentation
- **Shareable Format**: Perfect for security briefings and management reports

The PDF includes:
- Summary statistics of all events and anomalies
- Bar chart of failed login attempts by IP
- Pie chart of normal vs. anomalous events
- List of top security concerns with detailed explanations

## JSON Format

The visualizer expects JSON files with network logs in the following format:

```json
[
  {
    "ip": "192.168.1.105",
    "port": 22,
    "timestamp": "2025-06-21T08:12:34.567Z",
    "action": "login_attempt",
    "success": false,
    "anomaly": false
  },
  ...
]
```

Each log entry should contain:
- `ip` (string): The source IP address
- `port` (number): The port number used
- `timestamp` (ISO string): When the event occurred
- `action` (string): Type of action (e.g., "login_attempt", "web_request")
- `success` (boolean): Whether the action was successful
- `anomaly` (boolean): Whether the event is flagged as suspicious by an AI model

## Sample Data

A sample JSON file (`sample-logs.json`) is included in this repository for testing purposes.

## Technologies Used

- **HTML5** for structure
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **Font Awesome** for icons
- **JavaScript** (vanilla) for functionality

## License

This project is open source and available for personal and commercial use.

## Created by

AI-powered Intrusion Detection Visualizer © 2025
