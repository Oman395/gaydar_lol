let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
const c2 = document.getElementById("canvas");
const ctx2 = c2.getContext("2d");

const DEBUG = false;
if (DEBUG) (canvas = c2), (ctx = ctx2);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
c2.width = window.innerWidth;
c2.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  c2.width = window.innerWidth;
  c2.height = window.innerHeight;
});

async function startup() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
  let video = document.createElement("video");
  video.setAttribute("playsinline", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "");
  video.style.width = "200px";
  video.style.height = "200px";
  let facingMode = "user"; // Can be 'user' or 'environment' to access back or front camera (NEAT!)
  let constraints = {
    audio: false,
    video: {
      facingMode: facingMode
    }
  };
  let zeroArea = 200000;
  video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
  setInterval(async () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let url = canvas.toDataURL("image/jpeg");
    let img = document.createElement("img");
    img.src = url;
    img.onload = async () => {
      const detection = await faceapi.detectAllFaces(
        img,
        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
      );
      if (!DEBUG) {
        ctx2.fillStyle = "black";
        ctx2.fillRect(0, 0, c2.width, c2.height);
        ctx2.fillStyle = "#003300";
        ctx2.beginPath();
        ctx2.moveTo(c2.width * 0.4, 0);
        ctx2.lineTo(c2.width * 0.6, 0);
        ctx2.lineTo(c2.width, c2.height);
        ctx2.lineTo(0, c2.height);
        ctx2.lineTo(c2.width * 0.4, 0);
        ctx2.closePath();
        ctx2.fill();
      }
      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") zeroArea += 50;
        else if (e.key === "ArrowDown") zeroArea -= 50;
        if (zeroArea < 0) zeroArea = 0;
      });
      detection.forEach((face) => {
        let dist = zeroArea / (face.box.width * face.box.height);
        let posY = dist * (c2.height / 2);
        let posX = face.box.x + face.box.width / 2 - canvas.width / 2;
        posX *= (posY / canvas.height) * 0.8 + 0.2;
        posX += canvas.width / 2;
        let img = document.createElement("img");
        img.src = "/pride.png";
        img.onload = () => {
          ctx2.drawImage(img, c2.width - posX - 50, posY - 25, 100, 50);
          ctx2.strokeStyle = "white";
          ctx2.strokeWidth = 20;
          if (DEBUG)
            ctx2.strokeRect(
              face.box.x,
              face.box.y,
              face.box.width,
              face.box.height
            );
        };
      });
    };
  }, 250);
}
startup();
