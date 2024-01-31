let mic;
let fft;
let isPlaying = false;
let recordedData = [];
let button;

function setup() {
  createCanvas(400, 400);
  colorMode(HSB, 360, 100, 100, 1.0);

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT();
  fft.setInput(mic);

  // Create a play/pause button
  button = createButton('Record');
  button.position(width - 80, height - 40);
  button.size(70, 30);
  button.mousePressed(toggleAudio);
}

function toggleAudio() {

  if (isPlaying) {
    mic.stop();
    isPlaying = false;
    button.html('Record');
  } else {
    mic.start();
    isPlaying = true;
    button.html('Pause');
  }
}

function draw() {
  if (isPlaying) {
    background(0); // Set background color to black
    // Analyze the microphone input if playing
    let spectrum = fft.analyze();

    // Drawing center circle
    let centerRadius = map(spectrum[0], 0, 255, 5, 50);
    const centerCircle = makeCircle(100, centerRadius);
    const distortedCenterCircle = distortPolygon(centerCircle);
    const smoothedCenterCircle = chaikin(distortedCenterCircle, 4); // Apply Chaikin's smoothing

    beginShape();
    for (let j = 0; j < smoothedCenterCircle.length; j++) {
      let x = width / 2 + smoothedCenterCircle[j][0];
      let y = height / 2 + smoothedCenterCircle[j][1];
      let hue = (frameCount * 0.5 + j * 10) % 360; // Adjusted hue based on frame count
      stroke(hue, 80, 80);
      vertex(x, y);
    }
    endShape(CLOSE);

    // Drawing multiple layers with different characteristics
    for (let layer = 1; layer < 5; layer++) {
      let layerHue = map(layer, 0, 5, 0, 360);
      stroke(layerHue, 80, 80);
      strokeWeight(2);

      // Drawing polygons with vertices based on FFT spectrum data
      const numSteps = 10 + layer * 2;
      const radiansPerStep = (Math.PI * 2) / numSteps;
      for (let i = 0; i < spectrum.length; i++) {
        let radius = map(spectrum[i], 0, 255, 10 + layer * 10, 200 + layer * 30); // Adjusted scaling

        const circlePoints = makeCircle(numSteps, radius);
        const distortedCircle = distortPolygon(circlePoints);
        const smoothedCircle = chaikin(distortedCircle, 4); // Apply Chaikin's smoothing

        beginShape();
        for (let j = 0; j < smoothedCircle.length; j++) {
          let x = width / 2 + smoothedCircle[j][0];
          let y = height / 2 + smoothedCircle[j][1];
          let hue = (frameCount * 0.5 + j * 10) % 360; // Adjusted hue based on frame count
          stroke(hue, 80, 80);
          vertex(x, y);
        }
        endShape(CLOSE);
      }
    }
  } else {
    // If audio is paused, record and print FFT data
    let spectrum = fft.analyze();
    recordedData.push(spectrum);

    // Set background to white and text color to dark purple
    background(255);
    fill(280, 80, 80); // Dark purple
    noStroke();
    textSize(12);
    textAlign(CENTER, BOTTOM);
    let textX = width / 2;
    let textY = height - 10;
    text('Recorded FFT Data:', textX, textY);
    for (let i = 0; i < spectrum.length; i++) {
      text(`Bin ${i}: ${spectrum[i]}`, textX, textY - 15 * (i + 1));
    }
  }
}

function makeCircle(numSides, radius) {
  const points = [];
  const radiansPerStep = (Math.PI * 2) / numSides;
  for (let theta = 0; theta < Math.PI * 2; theta += radiansPerStep) {
    const x = radius * cos(theta);
    const y = radius * sin(theta);
    points.push([x, y]);
  }
  return points;
}

function distortPolygon(polygon) {
  return polygon.map(point => {
    const x = point[0];
    const y = point[1];
    const distance = dist(0, 0, x, y);

    const noiseFn = (x, y) => noise(x * distance * 2, y * distance * 2); // Adjusted noise factor
    const theta = noiseFn(x, y) * Math.PI * 2;

    const amountToNudge = 0.02; // Adjusted nudge factor
    const newX = x + (amountToNudge * Math.cos(theta));
    const newY = y + (amountToNudge * Math.sin(theta));

    return [newX, newY];
  });
}

function chaikin(arr, num) {
  if (num === 0) return arr;
  const l = arr.length;
  const smooth = arr.map((c, i) => {
    return [
      [0.75 * c[0] + 0.25 * arr[(i + 1) % l][0], 0.75 * c[1] + 0.25 * arr[(i + 1) % l][1]],
      [0.25 * c[0] + 0.75 * arr[(i + 1) % l][0], 0.25 * c[1] + 0.75 * arr[(i + 1) % l][1]],
    ];
  }).flat();
  return num === 1 ? smooth : chaikin(smooth, num - 1);
}






