  /************************************************************************************
  This is your Page Code. The appAPI.ready() code block will be executed on every page load.
  For more information please visit our docs site: http://docs.crossrider.com
*************************************************************************************/

//取得企業名稱,來自原始小幫手
// https://github.com/ronnywang/jobhelper/blob/master/contentscript.js
var get_company_info = function(){
    var params = {};
    params.link = document.location.href;

    if ('www.104.com.tw' == document.location.hostname) {
	// 有 jQuery 可以用
	var company_dom = jQuery('#comp_header li.comp_name p a', document);
	if (company_dom.length != 0) {
	    params.from = '104';
	    params.name = company_dom.eq(0).text();
	    params.company_link = company_dom.eq(0).attr('href');
	    return params;
	}

	company_dom = jQuery('#comp_header li.comp_name h1', document);
	if (company_dom.length != 0) {
	    params.from = '104';
	    params.name = company_dom.text();
	    params.company_link = document.location;
	    return params;
	}

	return;
    } else if ('www.ejob.gov.tw' == document.location.hostname) {
	var company_dom = jQuery('#ctl00_ContentPlaceHolder1_lblCompName', document);
	if (company_dom.length != 0) {
	    params.from = 'ejob';
	    params.name = company_dom.text();
	    return params;
	}
    } else if ('www.104temp.com.tw' == document.location.hostname) {
	// 檢查所有 a dom, 如果 company_intro.jsp 開頭的不超過兩個不一樣的，就確定是這家公司了
	var a_doms = $('a', document);
	var a_dom;
	for (var i = 0; i < a_doms.length; i ++) {
	    a_dom = a_doms.eq(i);
	    if (!a_dom.attr('href') || !a_dom.attr('href').match(/^company_intro\.jsp/)) {
		continue;
	    }
	    if (params.company_link && params.company_link != a_dom.attr('href')) {
		// 有兩家不一樣的公司，跳過
		return;
	    }
	    params.company_link = a_dom.attr('href');
	    params.name = a_dom.text();
	    params.from = '104temp';
	}

	return params;
    } else if ('www.yes123.com.tw' == document.location.hostname||'yes123.com.tw' == document.location.hostname) {
	if (!jQuery('.comp_name').length) {
            // 處理小而美企業頁面
            if (jQuery('.dtitle').length == 1 && document.location.href.match('small_corp')) {
                params.from = 'yes123';
                params.name = jQuery('.dtitle').text();
                return params;
            }
	    return;
	}
	var matches = document.location.search.match(/p_id=([^&]*)/);
	if (!matches) {
	    return;
	}

	params.from = 'yes123';
	params.name = jQuery('.comp_name').text();
	params.company_link = matches[1];
    } else if ('www.1111.com.tw' == document.location.hostname) {
	var found = false;
	jQuery('#breadcrumb li a').each(function(){
	    var self = $(this);

	    if (self.attr('href').match(/找工作機會/)) {
		params.from = '1111';
		params.name = self.text();
		params.company_link = self.attr('href');
		found = true;
		return false;
	    }
	});
	if (!found) {
	    return;
	}
    } else if ('www.518.com.tw' == document.location.hostname) {
        if (jQuery('#company-title').length) {
            if (jQuery('#company-title .sTrong').length == 1) {
                params.from = '518';
                params.name = jQuery('#company-title .sTrong')[0].childNodes[0].nodeValue.replace(' ', '');
                return params;
            }
            params.from = '518';
            params.name = jQuery('#company-title').text().replace('所有工作機會»', '').replace(' ', '');
            params.company_link = document.location.href;
            return params;
        }

	if (!jQuery('.company-info h2 a').length) {
	    return;
	}

	var dom = jQuery('.company-info h2 a');
	params.from = '518';
	params.name = dom.text();
	params.company_link = dom.attr('href');
    } else {
	return;
    }

    return params;
};

//將資料顯示於畫面,來自原始小幫手
var popup_function = function(rows, package_info){
    if (!document.getElementById('CompanyInfo')) {
    var ie_info_patch="";
    if(get_company_info().from=='518'){
        ie_info_patch='left:0px;';
    }
	var content = "<div id='CompanyInfo' style='"+ie_info_patch+"max-height: 150px; overflow-y: scroll; overflow-x: hidden; background: #cc103f; bottom: 0; padding: 5px; text-align: left; z-index: 99999; font-size: 14.5px; line-height: 1.5; color: #fff; position: fixed'>"
	    + "<div style='color:#f00;font-weight:bold;float:right;padding-right:8px;width:46px;'>"
	    + "<span id='CompanyInfoClose' style='cursor:pointer;'>關閉</span></div>"                
	    + "<ol id='CompanyInfoMessage'></ol></div>";
	document.body.innerHTML = content + document.body.innerHTML;
	var close = document.getElementById('CompanyInfoClose');

    jQuery('#CompanyInfoClose').click(function(){jQuery('#CompanyInfo').css('display','none');});

    } else {
      document.getElementById('CompanyInfo').style.display = 'block';
    }

    var htmlspecialchars = function(str){
      var span_dom = document.createElement('span');
      span_dom.innerText = str;
      str = span_dom.innerHTML;
      delete(span_dom);
      return str;
    };

    var info_dom = document.getElementById('CompanyInfo');
    info_dom.style.background = 'yellow';
    info_dom.style.color = 'black';
    document.getElementById('CompanyInfoMessage').innerHTML += '<li>' + htmlspecialchars(rows[1]) + '. ' + htmlspecialchars(rows[2]) + '[<a href="' + htmlspecialchars(rows[3]) +'" target="_blank">原始連結</a>][資料包:<a href="'+htmlspecialchars(package_info.url)+'" target="_blank">' + package_info.name + '</a>]</li>';
};

//輸出版本資訊，無資料時顯示用
var show_info=function(){
    if (!document.getElementById('CompanyInfo')) {
        var ie_info_patch="";
	    var content = "<div id='CompanyInfo' style='left:30px; max-height: 80px; overflow-y: hidden; overflow-x: hidden; background: #ccf; bottom: 0; padding: 5px; text-align: left; z-index: 99999; font-size: 14.5px; line-height: 1.5; color: #000; position: fixed; border:1px solid #99f'>"
	    + "目前沒有任何紀錄。<span style='font-size:9pt;'>（求職小幫手IE版 Ver " + appAPI.appInfo.version + "）</span></div>";
	    document.body.innerHTML = content + document.body.innerHTML;
    }
};

//判斷資料包列表是否需要更新
var update_list=function(){
	var last_update=appAPI.db.get('last_update');

	if(last_update===null||last_update<appAPI.time.now()){
        appAPI.request.get({
            url:"http://jobhelper.g0v.ronny.tw/api/getpackages",
            onSuccess:function(res,val){
                pkg_list=appAPI.JSON.parse(res);
                var list='';
                for(var pkg in pkg_list.packages){
                    if(pkg_list.packages[pkg]['default']===true){
                        list=list+pkg_list.packages[pkg].id+",";
                        appAPI.db.set('pkg_name_'+pkg_list.packages[pkg].id,pkg_list.packages[pkg].name);
                    }
                }
                
                //alert('next list update:' + appAPI.time.daysFromNow(1));
                appAPI.db.set('last_update',appAPI.time.daysFromNow(1));
                appAPI.db.set('pkg_list',list);
            },
            onFailure: function(httpCode) {
                //alert('Failed to loading package list.'+httpCode);
            }
        });	
	}
};

//轉換中文,備用
var name_filter=function(web_name){
    return encodeURIComponent(web_name);
};

//將資料推到前端
var push_data=function(rt){
    for(var i in rt.data){
        var rows={0:rt.data[i].name,1:rt.data[i].date,2:rt.data[i].reason,3:rt.data[i].link};
        popup_function(rows,{name:appAPI.db.get('pkg_name_'+rt.data[i].package_id),url:"http://jobhelper.g0v.ronny.tw/package/show/"+rt.data[i].package_id});
    }
};

//搜尋
var search_comp = function(comp_name){
    var pkg_list=appAPI.db.get('pkg_list');
    var rt=null;
    appAPI.request.get({
        url:"http://jobhelper.g0v.ronny.tw/api/search?name="+name_filter(comp_name)+"&packages="+pkg_list,
        onSuccess:function(res,val){
            rt=appAPI.JSON.parse(res);
            push_data(rt);
            try{
                if(rt.data[0].name!==undefined){
                    appAPI.db.async.set(comp_name,rt,appAPI.time.daysFromNow(3));
                }
            }catch(err){
                show_info();
            }
        },
        onFailure:function(httCode) {
            alert('目前小幫手服務有些問題，請稍候再試！');
        }
    });
};


appAPI.ready(function($) {

    // Place your code here (you can also define new functions above this scope)
    // The $ object is the extension's jQuery object

	if (!appAPI.isMatchPages(
		/http\:\/\/www\.104\.com\.tw/,
		/http\:\/\/www\.ejob\.gov\.tw/,
		/http\:\/\/www\.104temp\.com\.tw/,
		/http\:\/\/www\.yes123\.com\.tw/,
		/http\:\/\/yes123\.com\.tw/,
		/http\:\/\/www\.1111\.com\.tw/,
		/http\:\/\/www\.518\.com\.tw/)) return;

    update_list();
    var company_info = get_company_info();
    if(company_info===undefined) return;
    
    appAPI.db.async.get(company_info.name,function(rt){
        if(rt===null){
            search_comp(company_info.name);
        }else{
            //alert('use cache');
            push_data(rt);
        }
    });
});
