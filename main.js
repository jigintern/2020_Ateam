import { Server } from "https://code4sabae.github.io/js/Server.js"

let port = 8881;

class MyServer extends Server {
    api(path, req) {
        console.log(path); //要求されたpathをコンソールに表示
        //index.htmlからのデータ受け取り&JSONへの保存
        if (path === "/api/data") {
            Deno.writeTextFileSync("data.json", JSON.stringify(req));
            console.log( JSON.parse(Deno.readTextFileSync("data.json")) );
            return null;
        }
        else if (path === "/kinniku/") {
            return { res: "" };
        }
        return null;
    }
};

new MyServer(port);