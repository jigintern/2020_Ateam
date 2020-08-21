import { Server } from "https://code4sabae.github.io/js/Server.js"

let port = 8881;

class MyServer extends Server {
    api(path, req) {
        console.log(path); //要求されたpathをコンソールに表示
        //index.htmlからのデータ受け取り&JSONへの保存
        if (path === "/api/data") {
            try{
                //ここでdata.jsonを読み込むが、無い場合に例外処理としてファイルの初期生成
                var json = JSON.parse(Deno.readTextFileSync("./data.json"));
                //fix: for文でデータ参照した時、同じユーザーがいた場合true
                var fix = false;
                //for文でデータ参照、同ユーザー検索
                for(let i = 0; json.length > i; i++){
                    //req.id(ブラウザから受信したidと、data.json内のユーザーのidが一致した場合)
                    if(req.id === json[i].id){
                        console.log("同ユーザーがいます。目標回数の更新");
                        //そのユーザーの目標回数を最新の物にする、fixをtrueにする
                        json[i].num = req.num;
                        fix = true;
                    }
                }
                //fixがtrueでない(同ユーザー非検出の)場合
                if(fix != true){
                    console.log("新しいユーザーの登録");
                    //data.jsonの配列の末尾にreqデータ(json形式)を挿入
                    json[json.length] = req;
                    //data.jsonのファイルを書きだして更新 <- 書き出さないと内部変数が変更されているだけで、ファイルは変わらない!!
                    Deno.writeTextFileSync("data.json", JSON.stringify(json, null, "\t"));
                }
                //fixをfalseに初期化
                fix = false;
            }
            //ファイルが無かった場合の例外処理
            catch(e){
                console.log("ファイルが見つかりませんでした")
                //data.jsonの作成
                Deno.writeTextFileSync("data.json", JSON.stringify([req], null, "\t"));
            }
            return null;
        }
        else if(path === "/api/result") {
            const json = JSON.parse(Deno.readTextFileSync("./data.json"));
            var cnt;
            if(json.cnt === undefined){
                json.cnt = 1;
            }
            else{
                json.cnt = json.cnt++;
            }
            Deno.writeTextFileSync("data.json", JSON.stringify(json, null, "\t"));
            return json;
        }
        else if (path === "/kinniku/") {
            return null;
        }
        return null;
    }
};

new MyServer(port);