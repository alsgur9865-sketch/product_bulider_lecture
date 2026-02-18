const URL = "https://teachablemachine.withgoogle.com/models/mva2ORdnp/";

let model, labelContainer, maxPredictions;

// Load the image model
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; // Clear previous labels
    for (let i = 0; i < maxPredictions; i++) {
        const div = document.createElement("div");
        div.className = "prediction-item";
        labelContainer.appendChild(div);
    }
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const uploadBtn = document.getElementById('upload-btn');
    uploadBtn.disabled = true;
    uploadBtn.innerText = "분석 중...";

    // Show preview
    const reader = new FileReader();
    reader.onload = async function(e) {
        const img = document.getElementById('image-preview');
        img.src = e.target.result;
        img.style.display = 'block';

        // Load model if not loaded
        if (!model) {
            await loadModel();
        }

        // Wait for image to load to predict
        img.onload = async function() {
            await predict(img);
            uploadBtn.disabled = false;
            uploadBtn.innerText = "이미지 업로드하여 판독하기";
        };
    };
    reader.readAsDataURL(file);
}

// run the image through the image model
async function predict(imageElement) {
    const prediction = await model.predict(imageElement);
    for (let i = 0; i < maxPredictions; i++) {
        const item = labelContainer.childNodes[i];
        item.innerHTML = `
            <div class="label-name">${prediction[i].className}</div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${prediction[i].probability * 100}%"></div>
            </div>
            <div class="label-value">${(prediction[i].probability * 100).toFixed(0)}%</div>
        `;
        
        if (prediction[i].probability > 0.5) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    }
}
