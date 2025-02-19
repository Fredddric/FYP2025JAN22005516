import * as faceapi from 'face-api.js';
import Chart from 'chart.js/auto';
import { format } from 'date-fns';

// Global variables
let isTracking = true;
let isRecording = false;
let sessionStart = new Date();
let totalFacesDetected = 0;
let detectionInterval = 100;
let minConfidence = 0.5;
let currentTab = 'live';
let recordingData = [];
let charts = {};

// Initialize the application
async function init() {
  await loadModels();
  initializeCharts();
  setupEventListeners();
  startSessionTimer();
  startVideo();
}

// Load face-api models
async function loadModels() {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      faceapi.nets.ageGenderNet.loadFromUri('/models')
    ]);
    console.log('Models loaded successfully');
  } catch (error) {
    console.error('Error loading models:', error);
  }
}

// Initialize charts
function initializeCharts() {
  // Real-time Emotion Chart
  const realtimeCtx = document.getElementById('emotionChart').getContext('2d');
  charts.realtime = new Chart(realtimeCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Happy',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Sad',
          data: [],
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1
        },
        {
          label: 'Angry',
          data: [],
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 1
        }
      },
      animation: {
        duration: 0
      }
    }
  });

  // Age Distribution Chart
  const ageCtx = document.getElementById('ageChart').getContext('2d');
  charts.age = new Chart(ageCtx, {
    type: 'bar',
    data: {
      labels: ['0-18', '19-30', '31-50', '51+'],
      datasets: [{
        label: 'Age Distribution',
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(33, 150, 243, 0.5)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Gender Distribution Chart
  const genderCtx = document.getElementById('genderChart').getContext('2d');
  charts.gender = new Chart(genderCtx, {
    type: 'doughnut',
    data: {
      labels: ['Male', 'Female'],
      datasets: [{
        data: [0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Tab navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      document.getElementById(currentTab).classList.add('active');
      document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');
    });
  });

  // Controls
  document.getElementById('toggleBtn').addEventListener('click', toggleTracking);
  document.getElementById('snapshotBtn').addEventListener('click', takeSnapshot);
  document.getElementById('recordBtn').addEventListener('click', toggleRecording);

  // Settings
  document.getElementById('detectionInterval').addEventListener('input', (e) => {
    detectionInterval = parseInt(e.target.value);
    document.getElementById('intervalValue').textContent = detectionInterval;
  });

  document.getElementById('minConfidence').addEventListener('input', (e) => {
    minConfidence = parseFloat(e.target.value);
    document.getElementById('confidenceValue').textContent = minConfidence;
  });
}

// Start video feed
async function startVideo() {
  const video = document.getElementById('video');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 720,
        height: 560,
        facingMode: "user"
      }
    });
    video.srcObject = stream;
    
    video.addEventListener('loadeddata', () => {
      startFaceDetection();
    });
  } catch (err) {
    console.error('Error accessing camera:', err);
  }
}

// Start face detection
function startFaceDetection() {
  const video = document.getElementById('video');
  const canvas = faceapi.createCanvasFromMedia(video);
  document.querySelector('.video-container').appendChild(canvas);
  
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    if (!isTracking) return;

    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions({ minConfidence })
    )
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    if (document.getElementById('showLandmarks').checked) {
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }
    if (document.getElementById('showExpressions').checked) {
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }

    updateStats(resizedDetections);
    updateCharts(resizedDetections);
    
    if (isRecording) {
      recordingData.push({
        timestamp: new Date(),
        detections: resizedDetections
      });
    }
  }, detectionInterval);
}

// Update statistics
function updateStats(detections) {
  if (!detections.length) {
    document.getElementById('stats').innerHTML = 'No faces detected';
    return;
  }

  totalFacesDetected += detections.length;
  document.getElementById('totalFaces').textContent = totalFacesDetected;

  const statsHTML = detections.map((detection, index) => {
    const expressions = detection.expressions;
    const dominantExpression = Object.entries(expressions)
      .reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    const age = Math.round(detection.age);
    const confidence = Math.round(detection.detection._score * 100);

    return `
      <div class="face-stats">
        <h4>Face ${index + 1}</h4>
        <p>Age: <span>~${age} years</span></p>
        <p>Gender: <span>${detection.gender} (${Math.round(detection.genderProbability * 100)}%)</span></p>
        <p>Mood: <span>${dominantExpression}</span></p>
        <p>Confidence: <span>${confidence}%</span></p>
      </div>
    `;
  }).join('');

  document.getElementById('stats').innerHTML = statsHTML;
}

// Update charts with new data
function updateCharts(detections) {
  if (!detections.length) return;

  // Update real-time emotion chart
  const timestamp = new Date().toLocaleTimeString();
  const emotions = {
    happy: 0,
    sad: 0,
    angry: 0
  };

  detections.forEach(detection => {
    emotions.happy += detection.expressions.happy;
    emotions.sad += detection.expressions.sad;
    emotions.angry += detection.expressions.angry;
  });

  // Calculate averages
  Object.keys(emotions).forEach(emotion => {
    emotions[emotion] /= detections.length;
  });

  // Update realtime chart
  if (charts.realtime.data.labels.length > 30) {
    charts.realtime.data.labels.shift();
    charts.realtime.data.datasets.forEach(dataset => dataset.data.shift());
  }

  charts.realtime.data.labels.push(timestamp);
  charts.realtime.data.datasets[0].data.push(emotions.happy);
  charts.realtime.data.datasets[1].data.push(emotions.sad);
  charts.realtime.data.datasets[2].data.push(emotions.angry);
  charts.realtime.update();

  // Update age distribution
  const ageData = [0, 0, 0, 0]; // [0-18, 19-30, 31-50, 51+]
  detections.forEach(detection => {
    const age = Math.round(detection.age);
    if (age <= 18) ageData[0]++;
    else if (age <= 30) ageData[1]++;
    else if (age <= 50) ageData[2]++;
    else ageData[3]++;
  });

  charts.age.data.datasets[0].data = ageData;
  charts.age.update();

  // Update gender distribution
  const genderData = [0, 0]; // [male, female]
  detections.forEach(detection => {
    if (detection.gender === 'male') genderData[0]++;
    else genderData[1]++;
  });

  charts.gender.data.datasets[0].data = genderData;
  charts.gender.update();
}

// Toggle tracking
function toggleTracking() {
  isTracking = !isTracking;
  const btn = document.getElementById('toggleBtn');
  btn.innerHTML = isTracking ? 
    '<i class="fas fa-pause"></i> Pause' : 
    '<i class="fas fa-play"></i> Resume';
}

// Take snapshot
function takeSnapshot() {
  const video = document.getElementById('video');
  const canvas = document.createElement('canvas');
  canvas.width = video.width;
  canvas.height = video.height;
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const link = document.createElement('a');
  link.download = `facial-analysis-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

// Toggle recording
function toggleRecording() {
  isRecording = !isRecording;
  const btn = document.getElementById('recordBtn');
  btn.classList.toggle('recording');
  btn.innerHTML = isRecording ? 
    '<i class="fas fa-stop"></i> Stop Recording' : 
    '<i class="fas fa-record-vinyl"></i> Record Session';

  if (!isRecording && recordingData.length > 0) {
    saveRecording();
  }
}

// Save recording
function saveRecording() {
  const recording = {
    id: Date.now(),
    timestamp: new Date(),
    duration: format(new Date() - sessionStart, 'mm:ss'),
    data: recordingData
  };

  addRecordingToList(recording);
  recordingData = [];
}

// Add recording to list
function addRecordingToList(recording) {
  const recordingsList = document.getElementById('recordingsList');
  const card = document.createElement('div');
  card.className = 'recording-card';
  card.innerHTML = `
    <h4>Recording ${format(recording.timestamp, 'MM/dd/yyyy HH:mm')}</h4>
    <p>Duration: ${recording.duration}</p>
    <p>Faces Detected: ${recording.data.length}</p>
    <button class="btn" onclick="downloadRecording(${recording.id})">
      <i class="fas fa-download"></i> Download
    </button>
  `;
  recordingsList.prepend(card);
}

// Start session timer
function startSessionTimer() {
  setInterval(() => {
    const duration = new Date() - sessionStart;
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    document.getElementById('sessionTime').textContent = 
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

// Initialize the application
init();
