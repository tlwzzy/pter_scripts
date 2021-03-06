// ==UserScript==
// @name         Pter torrent Helper
// @namespace    https://pterclub.com/forums.php?action=viewtopic&topicid=3391
// @version      0.4.4
// @description  torrent description helper for Pterclub
// @author       scatking
// @match        https://pterclub.com/uploadgame.php*
// @match        https://pterclub.com/editgame.php*
// @require      https://cdn.staticfile.org/jquery/3.5.1/jquery.min.js
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @icon         https://pterclub.com/favicon.ico
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// ==/UserScript==
function find_rls(rlsid) {
    'use strict';
    const data = "xrel_search_query="+rlsid;
    GM.xmlHttpRequest({
        method: "POST",
        url: "https://www.xrel.to/search.html?mode=rls",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: data,
        onload: function (response) {
            if (response.status === 200){
                const game_url = "https://www.xrel.to/" + /((?:game|console)-nfo.+?)\.html/.exec(response.responseText).shift();
                 GM.xmlHttpRequest({
                     method: "GET",
                     url: game_url,
                    onload: fill_nfo
                 })
            }
        }
    });
}
// api_key = 26c350d051aa9be55b7d7cea1f082178
async function fill_nfo(response_data) {
    'use strict';
    const token = /rls_id=(\d+?)&nfo_id=(\d+?)&secret=(.+?)&font=FONTIDX/.exec(response_data.response);
    let imgurl = `https://www.xrel.to/nfo-a/${token[1]}-${token[2]}-${token[3]}/c90fd3b2-1.png`;
    function up2imgbb(){
        GM.xmlHttpRequest({
            method: "GET",
            url: 'https://api.imgbb.com/1/upload?key=26c350d051aa9be55b7d7cea1f082178&image='+imgurl,
            responseType: 'json',
            onload: function (response) {
                if (response.response.success === true) {imgurl = response.response.data.display_url;}
                const descr =$('#descr');
                const nfo_descr =  descr.val() + `[center][img]${imgurl}[/img][/center]`;
                descr.val(nfo_descr)

            }
        })
    }
    GM.xmlHttpRequest({
        method: "GET",
        url: imgurl,
        onload: async function (response){
            if (/image\/png/g.exec(response.responseHeaders) === null){imgurl =`https://www.xrel.to/nfo-a/${token[1]}-${token[2]}-${token[3]}/c90fd3b2-2.png` }
            await up2imgbb();
        }
    })
}

function fill_install(type) {
    'use strict';
    const descr =$('#descr');
    let ins_descr = '';
    switch (type) {
        case 'iso':
            ins_descr = descr.val() + "[center][b][u]????????????[/u][/b][/center]\n[*]?????????\n[*]????????????\n[*]????????????\n[*]???????????????????????????????????????\n[*]??????\n\n";
            break;
        case 'fit':
            ins_descr = descr.val() +"[center][b][u]????????????[/u][/b][/center]\n[*]?????? \"Verify BIN files before installation.bat\" ??????MD5??????????????????\n[*]?????? \"setup.exe\"????????????\n[*]????????????\n[*]??????????????????????????????????????????????????????????????????????????????\n\n";
            break;
        case '3dm':
            ins_descr = descr.val() +"[center][b][u]????????????[/u][/b][/center]\n[*]?????????\n[*]????????????\n[*]???????????????????????????????????????\n\n";
            break;
    }
    descr.val(ins_descr)
}

function release_name(title,name) {
    let raw_name = name.replace(/[:._???\- &]/g, '');
    let pattern = raw_name.replace(/./g,'.*?$&');
    pattern = new RegExp(pattern,'ig');
    $("#name").val(title.replace(pattern, '').replace(/\./g, ' ').replace(/_/g, ' ').trim().replace(/(?<=\d) (?=\d)/g, '.').replace('[FitGirl Repack]','-Firgirl'))
}

(function() {
    'use strict';
    const game_name = $("h1#top").text().slice(0,-4).trim();
    const torrent = $('#torrent');
    if (window.location.href.includes("uploadgame")){
        $("#name").parent().parent().after(
        "<tr><td>rls name</td><td><input style='width: 450px;' id='rlsid' /></td></tr>"
        );
    }
    else {
        $("input[name='torrentname']").parent().parent().after(
        "<tr><td>rls name</td><td><input style='width: 450px;' id='rlsid' /></td></tr>"
        );
    }
    torrent.change(function () {
        //?????????????????????
        window.rlsname = torrent.val().replace('C:\\fakepath\\','').replace('.torrent','');
        try {
            // ??????????????????
            rlsname = /(?<=.+-.+- \d{4} \().+?[\w/.\- ]+(?=\))/.exec(rlsname).pop();
        }catch(e) {
            // ???????????????????????????
            rlsname = rlsname.replace(/(?:\[\w+?])?/g,'').replace(/^\.+/,'');
        }finally {
            $("#rlsid").val (rlsname);

        }
    });
    $("#rlsid").after(
        '<a href="javascript:;" id="get_nfo" style="color:green">NFO</a> <a href="javascript:;" id="fill_iso" style="color:blue">ISO</a> <a href="javascript:;" id="fill_fit" style="color:orange">Fitgirl</a> <a href="javascript:;" id="fill_3dm" style="color:red">3DM</a>');
    $("#name").after('<a href="javascript:;" id="get_rls" style="color:red">Title</a>');
    $('#get_rls').click(function () { release_name(rlsname,game_name)})
    $('#get_nfo').click(function () { find_rls($("#rlsid").val());});
    $('#fill_iso').click(function () { fill_install('iso');});
    $('#fill_fit').click(function () { fill_install('fit');});
    $('#fill_3dm').click(function () { fill_install('3dm');});
})();
