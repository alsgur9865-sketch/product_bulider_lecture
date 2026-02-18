// Teachable Machine Model URL
const URL = "https://teachablemachine.withgoogle.com/models/mva2ORdnp/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
    const startBtn = document.getElementById('start-btn');
    startBtn.disabled = true;
    startBtn.innerText = "모델 로딩 중...";

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        // load the model and metadata
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(400, 400, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            const div = document.createElement("div");
            div.className = "prediction-item";
            labelContainer.appendChild(div);
        }
        
        startBtn.style.display = 'none';
    } catch (e) {
        console.error(e);
        alert("카메라를 시작할 수 없습니다. 권한을 확인해주세요.");
        startBtn.disabled = false;
        startBtn.innerText = "카메라 시작하기";
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(0) + "%";
        
        const item = labelContainer.childNodes[i];
        item.innerHTML = `
            <div class="label-name">${prediction[i].className}</div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${prediction[i].probability * 100}%"></div>
            </div>
            <div class="label-value">${(prediction[i].probability * 100).toFixed(0)}%</div>
        `;
        
        // Highlight the most likely prediction
        if (prediction[i].probability > 0.5) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    }
}
