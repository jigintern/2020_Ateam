const imageScaleFactor = 0.2;
const architecture = 'MobileNetV1'; // 'MobileNetV1'(精度:低, 速度:高) or 'ResNet50'(精度:高, 速度:低)
const outputStride = 8; // MobileNetv1: 8, 16, 32、ResNet: 16, 32 (大きくなるほど 精度：高, 速度：低)
const inputResolution = 200; // 入力解像度：(default:257) (大きくなるほど 精度：高, 速度：低)
const  multiplier = mob ? 0.50 : 0.75; // (MobileNetV1のみ) 畳み込み演算の深さ（チャネル数）の浮動小数点乗数：-1.01, 1.0, 0.75, 0.50 (大きくなるほど 精度：高, 速度：低)
const quantBytes = 2; // 重みの量子化に使用されるバイト：1, 2, 4 (大きくなるほど 精度：高, 速度：低)
const flipHorizontal = mob ? false : true;
const contentWidth = 800;
const contentHeight = 600;

async function bindPage() {

    //腕立ての時以外はカメラ使わない
    if(mn != "腕立て") {
        document.getElementById("wait").style.display = "none";
        console.log(mn)
        return;
    }

    //posenetの呼び出し
    const net = await posenet.load({
        architecture: architecture,
        outputStride: outputStride,
        inputResolution: inputResolution,
        multiplier: multiplier,
        quantBytes: quantBytes
    });

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
    video.width = contentWidth;
    video.height = contentHeight;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

        const mobile = mob;

        const stream = await navigator.mediaDevices.getUserMedia({
            'audio': false,
            'video': {
                facingMode: 'user',
                width: mobile ? undefined : contentWidth,
                height: mobile ? undefined : contentHeight,
            },
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
            console.log(keypoints[0]);
            //最初だけ実効
            if (count === 0) {
                //点描が可能になったので"loadingを消す"
                document.getElementById("wait").style.display = "none";
                /*--初期位置への誘導--*/
                text.textContent = "鼻の位置を画面上部に持ってきてください"
                document.getElementById("tex").appendChild(text);
                count = 1;
            }

            //上から1/4以下の時(+ score(認識制度)が0.8点以上の時)(+ textが"none"でないとき)
            if ( (contentHeight*2/5) > keypoints[0].position.y && keypoints[0].score > 0.7 && (count === 1 || count === 3) ) {  //keypoints[0]には鼻の予測結果が格納されている 

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
            //下から1/5以下の時
            else if ((contentHeight* 4/5) < keypoints[0].position.y && keypoints[0].score > 0.7 && count === 2) {
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
