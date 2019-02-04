// ==UserScript==
// @name           kenmituo_webkintai
// @namespace      http://kenmituo.nengu.jp/
// @description    webkintai makaizou 2011-07-07 for Chrome,  Last Update 2018/05/02
// @include        https://tc.pasonatech.co.jp/webkintai/kintai/index/*
// @version        0.20
// ==/UserScript==

//jQueryを使えるようにするおまじない
//http://www.otchy.net/20091104/use-jquery-on-greasemonkey/

var str_varday="version 0.20 / 2018-05-02";

(function(d, func) {
	var h = d.getElementsByTagName('head')[0], s = d.createElement('style'),
	   cs = '.hhmm{width: 20px;}'+
			'.edit_time{padding:0 20px;font-size: small;}' +
			'.edit_time thead th{background-color: #DCDCDC;width: 60px;}' +
			'.edit_time tbody td{background-color: #EFF0F5}' +
			'.none{display: none;}' +
			'.main_box{float:left;padding:5px;}' +
			'.power{margin:5px 20px; padding:5px 20px; border:1px solid gray;float:left;}' +
			'.clboth{clear:both;}'+
            '.mT30{padding-top:300px;}'
	;
	s.setAttribute('type','text/css');
	if(h.addEventListener){
		s.appendChild(d.createTextNode(cs));
	}else{
		s.styleSheet.cssText=cs;
	}
	h.appendChild(s);
	
	
	
    var check = function() {
        if (typeof unsafeWindow.jQuery == 'undefined') return false;
        func(unsafeWindow.jQuery); return true;
    }
    if (check()) return;
    var s = d.createElement('script');
    s.type = 'text/javascript';
    s.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js';
    d.getElementsByTagName('head')[0].appendChild(s);
    (function() {
        if (check()) return;
        setTimeout(arguments.callee, 100);
    })();
})(document, function($) {
    // ここにメインの処理を書く
    
//シフトの規定値の配列、shiftnameだけは好き勝手な時間を入れてOK
	var shiftname = [
		["none", "", "", "", "", "", "", "", "",""],		//ここだけは消しちゃダメ
        ["シフト休", "", "", "", "", "", "", "", "","シフト休"],
		["A", "08", "30", "17", "30", "01", "00", "00", "00", ""],
		["B", "09", "00", "18", "00", "01", "00", "00", "00", ""],
		["C", "10", "30", "19", "30", "01", "00", "00", "00", ""],
		["D", "08", "30", "14", "00", "01", "00", "00", "00", ""],
		["E", "09", "30", "16", "00", "01", "00", "00", "00", ""],
		["F", "08", "30", "17", "00", "01", "00", "00", "00", ""],
		["G", "08", "30", "12", "00", "00", "00", "00", "00", ""],
		["H", "09", "00", "17", "00", "01", "00", "00", "00", ""],
		["I", "", "", "", "", "", "", "", "", ""],
		["J", "", "", "", "", "", "", "", "", ""]
		];

/*シフト時間表を作るところ*/
    var intable = "<div class='power'><form><table class='edit_time'><thead><tr>" +
    	"<th>シフト</th><th>開始</th><th>終了</th><th>休憩</th><th>深夜休憩</th><th>コメント</th></tr></thead><tbody>";
    for(var i=0; i<shiftname.length; i++){
    	intable += i===0 ? "<tr class='none'>" : "<tr>";
    	intable += wrap("td", shiftname[i][0]);
    	for(var j=1; j<=8; j=j+2){
    		intable+=wrap("td", input_text(i, j)+":"+input_text(i, j+1));
    	}
        intable+=wrap("td", input_comment(i, j));
		intable+="</tr>";
    }
	intable += "</tbody></table>" +
		"<div class='table_data_sunday'>一括設定(<input type='checkbox' name='weekday_off' value='weekday_off' checked>土日入力しない)" +
		"<input type='button' value='シフトAをセットしちゃう' id='#button' name='button'></div>"+
		"</form></div>";
	
/*広告*/
	var author = "<div class='power'>魔改造なプログラムを作った人<br><img src='http://kenmituo.nengu.jp/kaga.png'><br><a href='http://d.hatena.ne.jp/kenmituo/'>kenmituoの日記</a><br>このプログラムで何か問題が発生しても「俺しーらんぺっ！」、何か心配なら使うな！<br>"+str_varday +"<br>最新版の確認は<a href='http://kenmituo.nengu.jp/index.html'>とある会社のWeb勤怠魔改造スクリプト配布所</a></div>";
/*HTMLにブチ込む*/
    $("#PRINT").before("<div class='main_box'>"+intable+author+"</div><div class='clboth'></div>");
    
/*セレクトをつくるところ*/
    //input name="isAvailableCopy"の全てを取得
	elements = document.getElementsByName('isAvailableCopy');

	for(var i=0; i<elements.length; i++){
		//selectを作成する
		var makeSelect = "<select id='opt_select_" + i +"'>" + "<optgroup label='働いたら選択'>";
		for(var j=0; j<shiftname.length; j++){
			makeSelect += "<option value='"+shiftname[j][0]+"_"+i+"'>"+shiftname[j][0]+"</option>";
		}
		makeSelect += "</optgroup></select>";
		//作成したselectをブチ込む
		$(elements[i]).before(makeSelect);
		//もともとの「＞＞」ボタンを消す、イラネ
		$(elements[i]).hide();

/*
//検証用
var tmp = elements[i].getAttribute('onclick');
*/

//selectが変更されたら、テキストボックの値を変更する
	$("#opt_select_"+i).bind("change",function(){
		var chkval = $(this).val().split("_");
		$("input[name='workDataDetailList["+chkval[1]+"].workStartTimeHour']").attr("value",$("input[name='type"+chkval[0]+"_1i']").val());
		$("input[name='workDataDetailList["+chkval[1]+"].workStartTimeMinute']").attr("value",$("input[name='type"+chkval[0]+"_2i']").val());
		$("input[name='workDataDetailList["+chkval[1]+"].workEndTimeHour']").attr("value",$("input[name='type"+chkval[0]+"_3i']").val());
		$("input[name='workDataDetailList["+chkval[1]+"].workEndTimeMinute']").attr("value",$("input[name='type"+chkval[0]+"_4i']").val());
		$("input[name='workDataDetailList["+chkval[1]+"].restTimeHour']").attr("value",$("input[name='type"+chkval[0]+"_5i']").val());
		$("input[name='workDataDetailList["+chkval[1]+"].restTimeMinute']").attr("value",$("input[name='type"+chkval[0]+"_6i']").val());
		$("input[name='workDataDetailList["+chkval[1]+"].midnightTimeHour']").attr("value",$("input[name='type"+chkval[0]+"_7i']").val());
		$("input[name='workDataDetailList["+chkval[1]+"].midnightTimeMinute']").attr("value",$("input[name='type"+chkval[0]+"_8i']").val());
        $("input[name='workDataDetailList["+chkval[1]+"].comment']").attr("value",$("input[name='type"+chkval[0]+"_9i']").val());
	});
}


//公務員のようなシフトの人専用ボタン
	var md = new Date();
	var i_end = 32-new Date(md.getFullYear(), md.getMonth(), 32).getDate();
    $("input[name='button']").click(function(){
		for(var i=0; i<i_end; i++){
			if($("input[name='weekday_off']").val()=="weekday_off"){
				var chkDay = new Date(md.getFullYear(), md.getMonth(), i+1).getDay();
				if(chkDay === 0 || chkDay === 6){
					continue;
				}
			}
		$("input[name='workDataDetailList["+i+"].workStartTimeHour']").attr("value",$("input[name='typeA_1i']").val());
		$("input[name='workDataDetailList["+i+"].workStartTimeMinute']").attr("value",$("input[name='typeA_2i']").val());
		$("input[name='workDataDetailList["+i+"].workEndTimeHour']").attr("value",$("input[name='typeA_3i']").val());
		$("input[name='workDataDetailList["+i+"].workEndTimeMinute']").attr("value",$("input[name='typeA_4i']").val());
		$("input[name='workDataDetailList["+i+"].restTimeHour']").attr("value",$("input[name='typeA_5i']").val());
		$("input[name='workDataDetailList["+i+"].restTimeMinute']").attr("value",$("input[name='typeA_6i']").val());
		$("input[name='workDataDetailList["+i+"].midnightTimeHour']").attr("value",$("input[name='typeA_7i']").val());
		$("input[name='workDataDetailList["+i+"].midnightTimeMinute']").attr("value",$("input[name='typeA_8i']").val());
        $("input[name='workDataDetailList["+i+"].comment']").attr("value",$("input[name='typeA_9i']").val());
		}
    });

    function input_text(a, b){
    	return "<input id='type" + shiftname[a][0] + "_" + b + 
    				"i' type='text' name='type" + shiftname[a][0] + 
    				"_"+b+"i' value='"+shiftname[a][b]+"' maxlength='2' class='hhmm'>";
    }

    function input_comment(a, b){
        return  "<input id='type" + shiftname[a][0] + "_" + b +
    				"i' type='text' name='type" + shiftname[a][0] +
    				"_"+b+"i' value='"+shiftname[a][b]+"'>";
    }
    
    function wrap(tag, text){
		return "<"+ tag + ">" + text + "</" + tag + ">";
	}
});

