# FaceTrack Pro: Real-Time Facial Analysis System

## Project Overview
FaceTrack Pro is a sophisticated web-based facial analysis system that provides real-time face detection, emotion recognition, age estimation, and gender classification. This project demonstrates the practical application of computer vision and machine learning technologies in a modern web environment.

## Features
- **Real-time Face Detection**: Instant detection and tracking of multiple faces
- **Emotion Analysis**: Recognition of various emotional states (happy, sad, angry, etc.)
- **Demographic Analysis**: Age estimation and gender classification
- **Analytics Dashboard**: Comprehensive visualization of detection statistics
- **Session Recording**: Capability to record and review detection sessions
- **Customizable Settings**: Adjustable detection parameters and display options

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Face Detection**: face-api.js (TensorFlow.js-based)
- **Data Visualization**: Chart.js
- **Build Tool**: Vite
- **Date Handling**: date-fns
- **Icons**: Font Awesome

## System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Webcam access
- Minimum 4GB RAM recommended
- Processor: Intel Core i3/AMD Ryzen 3 or better

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Fredddric/FYP2025JAN22005516.git
cd FYP2025JAN22005516
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

### Main Interface
- **Live Feed**: Access real-time facial analysis through your webcam
- **Analytics**: View detailed statistics and trends
- **Session History**: Review recorded detection sessions
- **Settings**: Customize detection parameters

### Controls
- Start/Pause Detection
- Take Snapshots
- Record Sessions
- Adjust Detection Settings

## Project Structure
```
facetrack-pro/
├── index.html          # Main HTML file
├── main.js            # Core application logic
├── style.css         # Global styles
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## Technical Implementation

### Face Detection Pipeline
1. Video stream acquisition
2. Frame processing
3. Face detection using TinyFace detector
4. Feature extraction (landmarks, expressions)
5. Real-time analysis and visualization

### Analytics System
- Real-time emotion tracking
- Age distribution analysis
- Gender distribution statistics
- Session-based metrics

## Performance Optimization
- Efficient frame processing
- Optimized rendering pipeline
- Memory management for long sessions
- Responsive design for various devices


## Known Limitations
- Requires good lighting conditions
- Performance dependent on device capabilities
- Limited to browser-supported resolutions
- Face detection accuracy varies with angle and distance

## Contributing
Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## Acknowledgments
- face-api.js team for the core detection models
- TensorFlow.js community
- Chart.js contributors
- Open-source community

## Author
Fredric Lau
Sunway University
Final Year Project - 2025

## Project Status
Current Version: 1.0.0
---

For technical support or queries, please open an issue in the project repository.
