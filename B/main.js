import { Server } from "https://code4sabae.github.io/js/Server.js"

let port = 8881;

class MyServer extends Server {
    api(path, req) {
        console.log(path); //要求されたpathをコンソールに表示
        if (path === "/api/") {
            return { res: "" };
        }
        else if (path === "/kinniku/") {
            return { res: "" };
        }
        return null;
    }
};

new MyServer(port);