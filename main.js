import { Server } from "https://code4sabae.github.io/js/Server.js"

let port = 8881;

class MyServer extends Server {

    api(path, req) {
        console.log(path); //要求されたpathをコンソールに表示
        //index.htmlからのデータ受け取り&JSONへの保存
        if (path === "/api/data") {
            try{
                //ここで一度data.jsonを読み込み、無い場合に例外処理としてファイルの初期生成
                JSON.parse(Deno.readTextFileSync("./data.json"));
            }
            //ファイルが無かった場合の例外処理
            catch(e){
                console.log("ファイルが見つかりませんでした")
                //空のdata.jsonの作成
                Deno.writeTextFileSync("data.json", JSON.stringify([], null, "\t"));
            }

            //data.jsonの取得
            var json = JSON.parse(Deno.readTextFileSync("./data.json"));

            //fix: for文でデータ参照した時、同じユーザーがいた場合true
            var fix = false;
            //while用のindexの初期化
            let i = 0;
            //while文でデータ参照、同ユーザー検索
            while (json.length > i) {
                //req.id(ブラウザから受信したidと、data.json内のユーザーのidが一致した場合)
                if(req.id === json[i].id){
                    console.log("同ユーザーがいます。目標回数の更新");
                    //そのユーザーの目標回数を最新の物にする、fixをtrueにする
                    json[i].num = req.num;
                    fix = true;
                    break;
                }
                i++;
            }
            //fixがtrueでない(同ユーザー非検出の)場合
            if(fix != true){
                console.log("新しいユーザーの登録");
                //data.jsonの配列の末尾にreqデータ(json形式)を挿入 { id: ~~,num: ~~ }
                const last = json.length; //末尾
                json[last] = req;
                /*--マッスルレートの初期化--*/
                json[last].ratio = 0;
                /*--ミッションの追加--*/
                //乱数
                const menu = ["腹筋", "背筋", "腕立て"]; //メニュー
                //select menu : menu[Math.floor(Math.random()*menu.length)]
                //select var(10~30) : Math.round( Math.random()*20 + 10 )
                //+rating :
                json[last].mission = [
                    { menu: menu[Math.floor(Math.random()*menu.length)], var: Math.round( Math.random()*20 + 10 ) },
                    { menu: menu[Math.floor(Math.random()*menu.length)], var: Math.round( Math.random()*20 + 10 ) },
                    { menu: menu[Math.floor(Math.random()*menu.length)], var: Math.round( Math.random()*20 + 10 ) }
                ];
            }
            //data.jsonのファイルを書きだして更新 <- 書き出さないと内部変数が変更されているだけで、ファイルは変わらない!!
            Deno.writeTextFileSync("data.json", JSON.stringify(json, null, "\t"));
            //fixをfalseに初期化
            fix = false;

        }
        //result.html -> Server
        else if(path === "/api/result") {
            //json読み込み
            const json = JSON.parse(Deno.readTextFileSync("./data.json"));
            //while用のindexの初期化
            let i = 0;
            while (json.length > i) {
                //data.json内で一致するユーザーデータを検出
                if(req.id === json[i].id){
                    //目標達成が初めての場合cutを追加し、1を代入
                    if(json[i].cnt === undefined){
                        console.log("！初目標達成！");
                        json[i].cnt = 1;
                    }
                    //そうでなければcntの値を+1して再代入
                    else{
                        json[i].cnt = ++json[i].cnt;
                    }
                    break;
                }
                i++;
            }
            //data.jsonの更新
            Deno.writeTextFileSync("data.json", JSON.stringify(json, null, "\t"));
            return json[i].cnt;
        }
        //ratioのJSON取り込み
        else if (path === "/api/ratio") {
            //json読み込み
            const json = JSON.parse(Deno.readTextFileSync("./data.json"));
            //while用のindexの初期化
            let i = 0;
            while (json.length > i) {
                //data.json内で一致するユーザーデータを検出
                if(req.id === json[i].id){
                    //ratioが無い場合にレートを追加(初期値0)
                    if(json[i].ratio === undefined) {
                        console.log("！初期レート！");
                        json[i].ratio = req.kal;
                    }
                    //そうでなければratioの値を加算して再代入
                    else {
                        console.log("レート更新");
                        json[i].ratio += req.kal;
                    }
                    break;
                }
                i++;
            }
            //data.jsonの更新
            Deno.writeTextFileSync("data.json", JSON.stringify(json, null, "\t"));
            return json[i].ratio;
        }
        //index.thml(ranking) -> Server
        else if (path === "/api/ranking") {
            //json読み込み
            const json = JSON.parse(Deno.readTextFileSync("./data.json"));

            //比較関数
            const compare = (a, b) => {
                var r = 0;
                if(a.ratio < b.ratio) {
                    r = -1;
                }
                else if(a.ratio > b.ratio) {
                    r = 1;
                }
                return (-1 * r);
            }
            //比較関数によって大きい順にソート & 書き出し
            json.sort(compare);
            Deno.writeTextFileSync("data.json", JSON.stringify(json, null, "\t"));

            return json;
        }
        //profileからのデータ受け取り&JSONへの保存
        if (path === "/api/user") {
            try{
                //ここで一度user.jsonを読み込み、無い場合に例外処理としてファイルの初期生成
                JSON.parse(Deno.readTextFileSync("./user.json"));
            }
            //ファイルが無かった場合の例外処理
            catch(e){
                console.log("ファイルが見つかりませんでした")
                //空のuser.jsonの作成
                Deno.writeTextFileSync("user.json", JSON.stringify([], null, "\t"));
            }
            //user.jsonの取得
            var json = JSON.parse(Deno.readTextFileSync("./user.json"));
            //fix: for文でデータ参照した時、同じユーザーがいた場合true
            var fix = false;
            //while用のindexの初期化
            let i = 0;
            //while文でデータ参照、同ユーザー検索
            while (json.length > i) {
                //req.id(ブラウザから受信したidと、user.json内のユーザーのidが一致した場合)
                if(req.id === json[i].id){
                    console.log("同ユーザーがいます。目標回数の更新");
                    //そのユーザーの目標回数を最新の物にする、fixをtrueにする
                    json[i].ftm = req.ftm;
                    json[i].age = req.age;
                    json[i].wt = req.wt;
                    fix = true;
                    break;
                }
                i++;
            }
            //fixがtrueでない(同ユーザー非検出の)場合
            if(fix != true){
                console.log("新しいユーザーの登録");
                //user.jsonの配列の末尾にreqデータ(json形式)を挿入
                const last = json.length; //末尾
                json[last] = req;
                json[last].log = [
                    {
                        sun: 0,
                        mon: 0,
                        tue: 0,
                        wed: 0,
                        thu: 0,
                        fri: 0,
                        sat: 0
                    }
                ];
            }
            //user.jsonのファイルを書きだして更新 <- 書き出さないと内部変数が変更されているだけで、ファイルは変わらない!!
            Deno.writeTextFileSync("user.json", JSON.stringify(json, null, "\t"));
            //fixをfalseに初期化
            fix = false;
        }
        //ranking.html -> server　(友達追加)
        else if (path === "/api/addfriend") {
            //json読み込み
            const json = JSON.parse(Deno.readTextFileSync("./data.json"));
            //while用のindexの初期化
            let i = 0;
            while (json.length > i) {
                //data.json内で一致するユーザーデータを検出
                if(req.id === json[i].id){
                    console.log(req.id, req.other);
                    //friendsの項目が存在しなかった場合
                    if(json[i].friends === undefined) {
                        json[i].friends = [req.other];
                    }
                    else {
                        //[frendsdsの大きさ]番目にフレンド追加
                        json[i].friends[json[i].friends.length] = req.other;
                        //重複は削除
                        json[i].friends = Array.from(new Set(json[i].friends));
                    }
                    break;
                }
                i++;
            }
            //data.jsonの更新
            Deno.writeTextFileSync("data.json", JSON.stringify(json, null, "\t"));
        }
        //reqで指定した人のfriendsの配列を返す
        else if (path === "/api/getfriend") {
            //json読み込み
            const json = JSON.parse(Deno.readTextFileSync("./data.json"));
            //while用のindexの初期化
            let i = 0;
            while (json.length > i) {
                if(req.id === json[i].id) {
                    if (json[i].friends != undefined) {
                        return json[i].friends;
                    }
                    break;
                }
                i++;
            }
        }
        //フレンド削除
        else if (path === "/api/deletefriend") {
            //json読み込み
            const json = JSON.parse(Deno.readTextFileSync("./data.json"));
            //while用のindexの初期化
            let i = 0;
            while (json.length > i) {
                if(req.id === json[i].id) {
                    //otherの人のインデックス番号を削除
                    (json[i].friends).splice( (json[i].friends).indexOf(req.other), 1);
                    break;
                }
                i++;
            }
            //data.jsonの更新
            Deno.writeTextFileSync("data.json", JSON.stringify(json, null, "\t"));
        }
        //idからミッション取得(json配列)
        else if (path === "/api/getmission") {
            //json読み込み
            const json = JSON.parse(Deno.readTextFileSync("./data.json"));
            //while用のindexの初期化
            let i = 0;
            while (json.length > i) {
                if(req.id === json[i].id) {
                    //ミッションを配列で返す
                    return json[i].mission;
                }
                i++;
            }
        }
        //reqで指定した人の体重を返す
        else if (path === "/api/weight") {
            //json読み込み
            const json = JSON.parse(Deno.readTextFileSync("./user.json"));
            //while用のindexの初期化
            let i = 0;
            while (json.length > i) {
                if(req.id === json[i].id) {
                    return json[i].wt;
                }
                i++;
            }
        }
        //idとミッション更新
        else if (path === "/api/mission") {
            //json読み込み
            const json = JSON.parse(Deno.readTextFileSync("./data.json"));
            //while用のindexの初期化
            let i = 0;
            while (json.length > i) {
                if(req.id === json[i].id) {
                    //レートを加算
                    json[i].ratio += req.ratio;
                    //ミッションを更新
                    json[i].mission[req.num] = { menu: req.menu, var: req.var };
                    break;
                }
                i++;
            }
            //data.jsonの更新
            Deno.writeTextFileSync("data.json", JSON.stringify(json, null, "\t"));
        }
        return null;
    }
};

new MyServer(port);