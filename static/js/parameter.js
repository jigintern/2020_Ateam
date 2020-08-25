// <script src="./js/parameter.js" type="text/javascript" charset="utf-8"></script>

var param = new Array();

const ParameterGet = () => {
    var pair = location.search.substring(1).split('&');
    var temp;
    for (let index in pair){
        temp = pair[index].split("=");
        param[temp[0]] = temp[1];
    }
}

var move = function(place){
    let Psend = "";
    for(var i = 1; i < arguments.length; ++i){
        if(!param[arguments[i]]) break;
        Psend += ("&" + arguments[i] + "=" + param[arguments[i]]);
    }
    if(Psend)Psend = "?"+Psend.slice(1);
    const path = `./${place}.html${Psend}`;
    location.href=path;
};

window.onload = ParameterGet();