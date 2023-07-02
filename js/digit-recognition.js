// Объявляю глобальные переменные
let model;

var canvasWidth = 150;
var canvasHeight = 150;
var canvasStrokeStyle = "white";
var canvasLineJoin = "round";
var canvasLineWidth = 10;
var canvasBackgroundColor = "black";
var canvasId = "canvas";

var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;

document.getElementById("chart_box").innerHTML = "";
document.getElementById("chart_box").style.display = "none";

//---------------
// Создаю полотно для рисования
//---------------
var canvasBox = document.getElementById("canvas_box");
var canvas = document.createElement("canvas");

canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
if (typeof G_vmlCanvasManager != "undefined") {
  canvas = G_vmlCanvasManager.initElement(canvas);
}

ctx = canvas.getContext("2d");

//---------------------
// Функция УДЕРЖАНИЯ мыши нажатой
//---------------------
$("#canvas").mousedown(function (e) {
  var rect = canvas.getBoundingClientRect();
  var mouseX = e.clientX - rect.left;
  var mouseY = e.clientY - rect.top;
  drawing = true;
  addUserGesture(mouseX, mouseY);
  drawOnCanvas();
});

//-----------------------
// Функция СЕНСОРНОГО запуска
//-----------------------
canvas.addEventListener(
  "touchstart",
  function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }

    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[0];

    var mouseX = touch.clientX - rect.left;
    var mouseY = touch.clientY - rect.top;

    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();
  },
  false
);

//---------------------
// Функция ПЕРЕМЕЩЕНИЯ мыши
//---------------------
$("#canvas").mousemove(function (e) {
  if (drawing) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    addUserGesture(mouseX, mouseY, true);
    drawOnCanvas();
  }
});

//---------------------
// Функция СЕНСОРНОГО перемещения
//---------------------
canvas.addEventListener(
  "touchmove",
  function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
    if (drawing) {
      var rect = canvas.getBoundingClientRect();
      var touch = e.touches[0];

      var mouseX = touch.clientX - rect.left;
      var mouseY = touch.clientY - rect.top;

      addUserGesture(mouseX, mouseY, true);
      drawOnCanvas();
    }
  },
  false
);

//-------------------
// Функция НАВЕДЕНИЯ курсора мыши
//-------------------
$("#canvas").mouseup(function (e) {
  drawing = false;
});

//---------------------
// Функция завершения касания
//---------------------
canvas.addEventListener(
  "touchend",
  function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
    drawing = false;
  },
  false
);

//----------------------
// Функция ВЫХОДА МЫШИ
//----------------------
$("#canvas").mouseleave(function (e) {
  drawing = false;
});

//-----------------------
// Функция СЕНСОРНОГО ВЫХОДА
//-----------------------
canvas.addEventListener(
  "touchleave",
  function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
    drawing = false;
  },
  false
);

//--------------------
// Функция щелчка
//--------------------
function addUserGesture(x, y, dragging) {
  clickX.push(x);
  clickY.push(y);
  clickD.push(dragging);
}

//-------------------
// Функция повторного РИСОВАНИЯ
//-------------------
function drawOnCanvas() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.strokeStyle = canvasStrokeStyle;
  ctx.lineJoin = canvasLineJoin;
  ctx.lineWidth = canvasLineWidth;

  for (var i = 0; i < clickX.length; i++) {
    ctx.beginPath();
    if (clickD[i] && i) {
      ctx.moveTo(clickX[i - 1], clickY[i - 1]);
    } else {
      ctx.moveTo(clickX[i] - 1, clickY[i]);
    }
    ctx.lineTo(clickX[i], clickY[i]);
    ctx.closePath();
    ctx.stroke();
  }
}

//------------------------
// Функция очистки ХОЛСТА
//------------------------
$("#clear-button").click(async function () {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  clickX = new Array();
  clickY = new Array();
  clickD = new Array();
  $(".prediction-text").empty();
  $("#result_box").addClass("d-none");
});

//-------------------------------------
// загрузчик для модели CNN
//-------------------------------------
async function loadModel() {
  console.log("model loading..");

  // очистите переменную модели
  model = undefined;

  // загрузите модель с помощью HTTPS-запроса (где вы сохранили свои файлы модели)
  model = await tf.loadLayersModel("models/model.json");

  console.log("model loaded..");
}

loadModel();

//-----------------------------------------------
// предварительная обработка холста
//-----------------------------------------------
function preprocessCanvas(image) {
  // измените размер входного изображения до целевого размера (1, 28, 28)
  let tensor = tf.browser
    .fromPixels(image)
    .resizeNearestNeighbor([28, 28])
    .mean(2)
    .expandDims(2)
    .expandDims()
    .toFloat();
  console.log(tensor.shape);
  return tensor.div(255.0);
}

//--------------------------------------------
// функция прогнозирования
//--------------------------------------------
$("#predict-button").click(async function () {
  // получение данных изображения с canvas
  var imageData = canvas.toDataURL();

  // предварительная обработка холста
  let tensor = preprocessCanvas(canvas);

  //делайте прогнозы на основе предварительно обработанного тензора изображений
  let predictions = await model.predict(tensor).data();

  // получите результаты прогнозирования модели
  let results = Array.from(predictions);

  // отобразите прогнозы на графике
  $("#result_box").removeClass("d-none");
  displayChart(results);
  displayLabel(results);

  console.log(results);
});

//------------------------------
// Диаграмма для отображения прогнозов
//------------------------------
var chart = "";
var firstTime = 0;
function loadChart(label, data, modelSelected) {
  var ctx = document.getElementById("chart_box").getContext("2d");
  chart = new Chart(ctx, {
    // Тип диаграммы, которую мы хотим создать
    type: "bar",

    // Данные для нашего набора данных
    data: {
      labels: label,
      datasets: [
        {
          label: modelSelected + " prediction",
          backgroundColor: "#f50057",
          borderColor: "rgb(255, 99, 132)",
          data: data,
        },
      ],
    },

    // Параметры конфигурации доступны здесь
    options: {},
  });
}

//----------------------------
// отобразить диаграмму с обновленной
// рисование с холста
//----------------------------
function displayChart(data) {
  var select_model = document.getElementById("select_model");
  var select_option = "CNN";

  label = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  if (firstTime == 0) {
    loadChart(label, data, select_option);
    firstTime = 1;
  } else {
    chart.destroy();
    loadChart(label, data, select_option);
  }
  document.getElementById("chart_box").style.display = "block";
}

function displayLabel(data) {
  var max = data[0];
  var maxIndex = 0;

  for (var i = 1; i < data.length; i++) {
    if (data[i] > max) {
      maxIndex = i;
      max = data[i];
    }
  }
  $(".prediction-text").html(
    "Predicting you draw <b>" +
      maxIndex +
      "</b> with <b>" +
      Math.trunc(max * 100) +
      "%</b> confidence"
  );
}
