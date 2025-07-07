let videoStream = null;
let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let predictionDisplay = document.getElementById('prediction-result');
let startBtn = document.getElementById('start-sign-btn');
let stopBtn = document.getElementById('stop-sign-btn');

startBtn.addEventListener('click', async () => {
  if (!videoStream) {
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = videoStream;
      video.play();
      video.style.display = 'block';
      stopBtn.style.display = 'inline-block';
      startBtn.style.display = 'none';
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera.');
    }
  }
});

stopBtn.addEventListener('click', () => {
  if (videoStream) {
    let tracks = videoStream.getTracks();
    tracks.forEach(track => track.stop());
    videoStream = null;
    video.style.display = 'none';
    stopBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    predictionDisplay.textContent = 'None';
  }
});

document.getElementById('capture-btn').addEventListener('click', () => {
  if (!videoStream) {
    alert('Camera is not started.');
    return;
  }
  let context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  let dataUrl = canvas.toDataURL('image/png');

  fetch('/predict_sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl })
  })
  .then(response => response.json())
  .then(data => {
    predictionDisplay.textContent = data.prediction;
  })
  .catch(error => {
    console.error('Error:', error);
    predictionDisplay.textContent = 'Error predicting.';
  });
});
