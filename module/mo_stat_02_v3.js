var fetch = require('node-fetch');
const delay = require('delay');

var Botinfo_model           = require("../models/Botinfo");
var Bacarat7result_model    = require("../models/Bacarat7result");
var Bacarat7play137_model      = require("../models/Bacarat7play137");

var BSTAT_SV2_MAX = process.env.BSTAT_SV2_MAX;
var BSTAT_SV2_URL = [
    process.env.BSTAT_SV2_URL_0,
    process.env.BSTAT_SV2_URL_1,
    process.env.BSTAT_SV2_URL_2,
    process.env.BSTAT_SV2_URL_3,
    process.env.BSTAT_SV2_URL_4,
    process.env.BSTAT_SV2_URL_5,
    process.env.BSTAT_SV2_URL_6,
    process.env.BSTAT_SV2_URL_7,
    process.env.BSTAT_SV2_URL_8,
    process.env.BSTAT_SV2_URL_9
];

var BSTAT_SV2_URL_ORG = [
    process.env.BSTAT_SV2_URL_ORG_0,
    process.env.BSTAT_SV2_URL_ORG_1,
    process.env.BSTAT_SV2_URL_ORG_2,
    process.env.BSTAT_SV2_URL_ORG_3,
    process.env.BSTAT_SV2_URL_ORG_4,
    process.env.BSTAT_SV2_URL_ORG_5,
    process.env.BSTAT_SV2_URL_ORG_6,
    process.env.BSTAT_SV2_URL_ORG_7,
    process.env.BSTAT_SV2_URL_ORG_8,
    process.env.BSTAT_SV2_URL_ORG_9
];

var delay_again = 2000;
var delay_nextpage = 1000;

//result_win 0=nodata, 1=player, 2=banker, 3=tie
//play_game_result 0=nodata, 1=win, 2=lose, 3=tie
// ///////////////
// let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
// let now_long = Date.now();//milliseconds 13 digit longint
// let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
// ///////////////

///////////////
class HTTPResponseError extends Error {
	constructor(response) {
		super(`HTTP Error Response: ${response.status} ${response.statusText}`);
		this.response = response;
	}
}

const checkStatus = response => {
	if (response.ok) {
		// response.status >= 200 && response.status < 300
		return response;
	} else {
		throw new HTTPResponseError(response);
	}
}
///////////////

//ได้รายการข้อมูล โดยใส่ เลขหน้า
async function getData_from_one_page(cpage){
    //อ่าน cpage ออกมาเป็น array
    let json_data = [];
    let list_rows = [];
    // let url_start = process.env.BSTAT_ID_03_DATA_URL;
    // let url_start = 'https://httpbin.org/post';
    // let url_start = 'https://httpbin.org/status/500';
    // let url_start = 'https://httpbin.org/status/200';

    //json code System upgrade 20230225
    //{"code":1999, "msg":"System upgrading", "data":{"endTime":1677301200000, "msg":[]}}

    //random get from sv 0-9
    let i_random = Math.floor(Math.random() * BSTAT_SV2_MAX);
    let url_start = BSTAT_SV2_URL[i_random];
    let url_org_start = BSTAT_SV2_URL_ORG[i_random];
    console.log(url_start);

    const body = {
        page: cpage,
        pageSize: 20
    };

    const response = await fetch(
        url_start,
        {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Origin': url_org_start,
            }
        }
    );

    try {
        console.log('Loading... www Page '+cpage)
        checkStatus(response);
        const data = await response.json();

        if(data.msg){
            console.log('********** error **********');
            console.log('fn getData_from_one_page');
            console.log(data.msg);
            console.log('***************************');
        }

        if(data.data.list){
            json_data = data.data.list;
            for(var i in json_data)
            list_rows.push(json_data[i]);
        }
        return list_rows.reverse();//a-z
    } catch (error) {
        const errorBody = await error;
        console.error(`Error body: ${errorBody}`);
    }
    return [];
}

//ได้รายการข้อมูล โดยใส่ เลขหน้า
//ถ้า error เกิน 3 ครั้ง ส่งค่า []
async function getHistory_one_page(cpage){
    let page_max = cpage+1;
    let i = cpage;
    let list_rows = [];
    let error_count = 0;
    let error_max = 3;

    while(i<page_max){
        list_rows =  await getData_from_one_page(i);
        if(list_rows.length > 0){
            return list_rows;
        }else{
            error_count = error_count + 1;
        }

        if(error_count > error_max){
            return [];
        }
        await delay(delay_again);
    }
    return [];
}

//ได้รายการข้อมูล โดยใส่ หน้าเริ่มต้น และสิ้นสุด
async function getHistory_spage_epage(p_start , p_max){
    if(p_start < 1){
        p_start = 1;
    }

    if(p_max < 1){
        p_max = 1;
    }
    let alen = 0;
    let temp_row=[];
    let temp_row_item_page=[];
    let page_stop = p_max + 1;
    let page_start = p_start;
    let page_current = page_start;
    // let list_rows=[];
    let list_rows=[];
    if(page_stop < page_start){
        page_stop = page_start + 1;
    }

    // console.log('ps='+page_start+'pe='+p_max)
    while(page_current < page_stop){

        temp_row = await getHistory_one_page(page_current);

        if(temp_row.length<1){
            break;
        }

        // console.log('page_current='+page_current)
        // console.log(temp_row[0]);
        temp_row_item_page=[]

        for(var i in temp_row){
            let picked = list_rows.find(o => o.gameId === temp_row.gameId);
            if(picked){
                //found
            }else{
                //not found
                temp_row_item_page.push(temp_row[i]);
                // console.log('add '+temp_row[i].gameId)
            }
        }
        // console.log(temp_row_item_page[temp_row_item_page.length-1].gameId)

        // temp_row_item_page
        list_rows = temp_row_item_page.concat(list_rows);
        page_current = page_current + 1;
        await delay(delay_nextpage);
    }
    // console.log(list_rows);
    alen = list_rows.length;
    // console.log(list_rows[0].gameId + '->'+list_rows[alen-1].gameId)

    return list_rows;
}

///////////////
//ได้รายการข้อมูล หน้าแรกสุด
//ถ้า error 3 return []
async function getLastPage_web(){
    let page_max = 1+1;
    let i = 1;
    let list_rows = [];
    let error_count = 0;
    let error_max = 3;

    while(i<page_max){
        list_rows =  await getData_from_one_page(i);
        if(list_rows.length > 0){
            return list_rows;
        }else{
            error_count = error_count + 1;
        }

        if(error_count > error_max){
            return [];
        }
        await delay(delay_again);
    }
    return [];
}


//สำหรับ เริ่มต้น db
async function first_only_initdb(req, res){
    //////////
    let bot_id_run = process.env.BSTAT_ID_03_RESULT;
    //////////

    let list_rows = [];
    let gameid_bot = 0;
    let gameid_db = 0;
    let gameid_web = 0;
    let bot_inprocess = 0;

    let date = new Date();
    let now_int = Date.UTC(
        date.getUTCFullYear(),date.getUTCMonth(),
        date.getUTCDate(), date.getUTCHours(),
        date.getUTCMinutes(), date.getUTCSeconds()
    );
    now_int =  Math.floor(now_int/1000);
    let now_utc = new Date(now_int);

    res.send('respond bot end');
}

//ค้น gameid ล่าสุด จาก db
async function getLast_GameId_BacaratResult_Db(){
    let temp = await Bacarat7result_model.getLastInfo();
    if(temp){
        return temp.game_id;
    }else{
        let i=5;
        while(i>0){
            let temp = await Bacarat7result_model.getLastInfo();
            if(temp){
                return temp.game_id;
            }
            i=i-1;
            await delay(600);
        }
    }
    return 0;
}

//ค้น gameid ล่าสุด จาก db
async function getLast_GameId_Botinfo_Db(bot_id_run){
    let temp = await Botinfo_model.getInfo(bot_id_run);
    if(temp){
        return temp.game_id;
    }else{
        let i=5;
        while(i>0){
            let temp = await Botinfo_model.getInfo(bot_id_run);
            if(temp){
                return temp.game_id;
            }
            i=i-1;
            await delay(600);
        }
    }
    return 0;
}

async function getLast_GameId_BacaratPlay137_Db(){
    let temp = await Bacarat7play137_model.getLastInfo();
    if(temp){
        return temp.game_id;
    }else{
        let i=5;
        while(i>0){
            let temp = await Bacarat7play137_model.getLastInfo();
            if(temp){
                return temp.game_id;
            }
            i=i-1;
            await delay(600);
        }
    }
    return 0;
}

async function checkwin_from_betValue(svalue){
    //result_win 0=nodata, 1=player, 2=banker, 3=tie
    //play_game_result 0=nodata, 1=win, 2=lose, 3=tie
    if(svalue == 0 || svalue == 1 || svalue == 10 || svalue == 11){
        //000, 001, 010, 011
        return 1;//player
    }else if(svalue == 300 || svalue == 301 || svalue == 310 || svalue == 311){
        //300, 301, 310, 311
        return 2;//banker
    }else{
        //100, 101, 110, 111
        return 3;//tie
    }
}

async function getStr_from_his(string_val, len_val){
    let slen = string_val.length;
    if(slen<1){
        return "";
    }

    if(len_val<1){
        return "";
    }

    if(slen<len_val){
        return string_val;
    }else{
        let ss_start = slen-len_val;
        return string_val.substr(ss_start, len_val);
    }
}
///////////////

module.exports.getData_from_one_page = getData_from_one_page;
module.exports.getHistory_one_page = getHistory_one_page;
module.exports.getHistory_spage_epage = getHistory_spage_epage;

module.exports.checkwin_from_betValue = checkwin_from_betValue;
module.exports.getStr_from_his = getStr_from_his;

module.exports.getLastPage_web = getLastPage_web;
// module.exports.getLastGameId_zero_web = getLastGameId_zero_web;
// module.exports.first_only_initdb = first_only_initdb;
module.exports.getLast_GameId_Botinfo_Db = getLast_GameId_Botinfo_Db;
module.exports.getLast_GameId_BacaratResult_Db = getLast_GameId_BacaratResult_Db;
module.exports.getLast_GameId_BacaratPlay137_Db = getLast_GameId_BacaratPlay137_Db;