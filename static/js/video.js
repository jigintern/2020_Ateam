const imageScaleFactor = 0.2;
const outputStride = 16;
const flipHorizontal = true;
const contentWidth = 800;
const contentHeight = 600;

async function bindPage() {
    const net = await posenet.load(); // posenetの呼び出し
    let video;
    try {
        video = await loadVideo(); // video属性をロード
    } catch(e) {
        console.error(e);
        return;
    }
    detectPoseInRealTime(video, net);
}

// video属性のロード
async function loadVideo() {
    const video = await setupCamera(); // カメラのセットアップ
    video.play();
    return video;
}

// カメラのセットアップ
// video属性からストリームを取得する
async function setupCamera() {
    const video = document.getElementById('video');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
            'audio': false,
            'video': true
        });
        video.srcObject = stream;

        return new Promise(resolve => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } else {
        const errorMessage = "This browser does not support video capture, or this device does not have a camera";
        alert(errorMessage);
        return Promise.reject(errorMessage);
    }
}

// 取得したストリームをestimateSinglePose()に渡して姿勢予測を実行
// requestAnimationFrameによってフレームを再描画し続ける
function detectPoseInRealTime(video, net) {
    const text = document.createElement("p");//text
    let count = 0; //計測用

    async function poseDetectionFrame() {
        let poses = [];
        const pose = await net.estimateSinglePose(video, imageScaleFactor, flipHorizontal, outputStride);
        poses.push(pose);

        poses.forEach(({ score, keypoints }) => {
            //最初だけ実効
            if (count === 0) {
                //点描が可能になったので"loadingを消す"
                document.getElementById("wait").style.display = "none";
                /*--初期位置への誘導--*/
                text.textContent = "鼻の位置を画面上部に持ってきてください"
                document.getElementById("tex").appendChild(text);
                count = 1;
            }
            //上から1/4以下の時(+ textが"none"でないとき)
            if ( (contentHeight/3) > keypoints[0].position.y && (count === 1 || count === 3) ) {  //keypoints[0]には鼻の予測結果が格納されている 
                if (count === 3) {
                    console.log("良いね！");
                    event();
                }
                else {
                    text.textContent = "トレーニング開始!!"
                    document.getElementById("tex").appendChild(text);
                }
                //計測開始
                text.textContent = "ゆっくり下げましょう"
                document.getElementById("tex").appendChild(text);
                count = 2;
            }
            //
            else if ((contentHeight* 4/5) < keypoints[0].position.y && count === 2) {
                //計測経過
                text.textContent = "ゆっくり戻しましょう"
                document.getElementById("tex").appendChild(text);
                count = 3;
            }
        });

        requestAnimationFrame(poseDetectionFrame);
    }
    poseDetectionFrame();
}

window.onload = bindPage;

let event = null;

const setEventFunction = (e) => event = e;

export { setEventFunction };
