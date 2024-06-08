let db;
let droppedImages = []; // 이미지 요소들을 저장할 배열
let clickedImageIndex = -1; // 클릭한 이미지의 인덱스

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight); // 웹사이트 크기에 맞게 캔버스 생성
  canvas.id('myCanvas'); // 캔버스에 id 부여
  canvas.drop(handleFileSelect); // 캔버스에 드래그 이벤트 핸들러 등록
  background(255); // 배경을 흰색으로 설정

  // IndexedDB 데이터베이스 열기
  const request = window.indexedDB.open('imageDB', 1);

  // 데이터베이스 열기에 성공한 경우
  request.onsuccess = function(event) {
    db = event.target.result;
    console.log('Database opened successfully');
    loadImagesFromDB(); // 데이터베이스에서 이미지 로드
  };

  // 데이터베이스 열기에 실패한 경우
  request.onerror = function(event) {
    console.error('Database error:', event.target.errorCode);
  };

  // 데이터베이스 업그레이드 시
  request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
    console.log('Object store created successfully');
  };
}

function draw() {
  // 캔버스에 이미지 그리기
  for (let i = 0; i < droppedImages.length; i++) {
    let imgSize = min(width, height) / 20; // 이미지 크기를 캔버스 크기의 1/20으로 설정
    if (i === clickedImageIndex) {
      // 클릭한 이미지는 크기를 15배로 확대하여 중앙에 표시
      let enlargedSize = 15 * imgSize;
      image(droppedImages[i], width / 2 - enlargedSize / 2, height / 2 - enlargedSize / 2, enlargedSize, enlargedSize);
    } else {
      image(droppedImages[i], 0, i * imgSize, imgSize, imgSize); // 이미지를 캔버스에 그리기
    }
  }
}

function handleFileSelect(file) {
  if (file.type.match('image.*')) { // 이미지 파일인지 확인합니다.
    let img = createImg(file.data, ''); // 이미지 파일을 로드합니다.
    droppedImages.push(img); // 배열에 이미지 요소를 추가합니다.
    saveImageToDB(file.data); // IndexedDB에 이미지 저장
  } else {
    alert('이미지 파일을 업로드해주세요.'); // 이미지 파일이 아닌 경우 경고를 표시합니다.
  }
}

function mouseClicked() {
  // 이미지를 클릭했을 때 해당 이미지를 15배로 확대하여 중앙에 표시
  for (let i = 0; i < droppedImages.length; i++) {
    let imgSize = min(width, height) / 20;
    let x = 0;
    let y = i * imgSize;
    if (mouseX >= x && mouseX <= x + imgSize && mouseY >= y && mouseY <= y + imgSize) {
      clickedImageIndex = i;
    }
  }
}

function saveImageToDB(imageData) {
  const transaction = db.transaction(['images'], 'readwrite');
  const objectStore = transaction.objectStore('images');
  const request = objectStore.add({ data: imageData });

  request.onsuccess = function(event) {
    console.log('Image saved to database');
  };

  request.onerror = function(event) {
    console.error('Error saving image to database:', event.target.errorCode);
  };
}

function loadImagesFromDB() {
  const transaction = db.transaction(['images'], 'readonly');
  const objectStore = transaction.objectStore('images');
  const request = objectStore.getAll();

  request.onsuccess = function(event) {
    const imageDataArray = event.target.result.map(entry => entry.data);
    for (let imageData of imageDataArray) {
      let img = createImg(imageData, ''); // 이미지 데이터로부터 이미지 요소를 생성
      droppedImages.push(img); // 배열에 이미지 요소를 추가
    }
    console.log('Images loaded from database');
  };

  request.onerror = function(event) {
    console.error('Error loading images from database:', event.target.errorCode);
  };
}