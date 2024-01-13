var fetch = require('node-fetch');
const delay = require('delay');

var Botinfo_model           = require("../models/Botinfo");
var Bacarat7result_model    = require("../models/Bacarat7result");
var Bacarat7play137_model      = require("../models/Bacarat7play137");

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
    let url_start = process.env.BSTAT_ID_03_DATA_URL;
    // let url_start = 'https://httpbin.org/post';
    // let url_start = 'https://httpbin.org/status/500';
    // let url_start = 'https://httpbin.org/status/200';
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
                'Content-Type': 'application/json'
            }
        }
    );

    try {
        console.log('Loading... www Page '+cpage)
        checkStatus(response);
        const data = await response.json();
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
//ถ้า error เกิน 10 ครั้ง ส่งค่า []
async function getHistory_one_page(cpage){
    let page_max = cpage+1;
    let i = cpage;
    let list_rows = [];
    let error_count = 0;
    let error_max = 10;

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
        await delay(2500);
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
        await delay(1500);
    }
    // console.log(list_rows);
    alen = list_rows.length;
    // console.log(list_rows[0].gameId + '->'+list_rows[alen-1].gameId)

    return list_rows;
}

///////////////
//ได้รายการข้อมูล หน้าแรกสุด
//ถ้า error 10 return []
async function getLastPage_web(){
    let page_max = 1+1;
    let i = 1;
    let list_rows = [];
    let error_count = 0;
    let error_max = 10;

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
        await delay(2500);
    }
    return [];
}


//สำหรับ เริ่มต้น db
async function first_only_initdb(req, res){
    //////////
    let bot_id_run = process.env.BSTAT_ID_03_PLAY;
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
    }
    return 0;
}

//ค้น gameid first_save ล่าสุด จาก db
async function getLast_GameId_FirstSave_BacaratResult_Db(){
    let temp = await Bacarat7result_model.getLastFirstSave();
    if(temp){
        return temp.game_id;
    }
    return 0;
}

async function getLast_GameId_BacaratPlay137_Db(){
    let temp = await Bacarat7play137_model.getLastInfo();
    if(temp){
        return temp.game_id;
    }
    return 0;
}


//result_win 0=nodata, 1=player, 2=banker, 3=tie
//play_game_result 0=nodata, 1=win, 2=lose, 3=tie
async function checkwin_from_betValue(svalue){
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

function checkBet_first(history){
    //121 1 , 121 22, 121 212
    //input len 7
    // let p1x6 = "121211";
    // let p2x7 = "1212122";
    // let h6 = history.substr(1,6);
    // let h7 = history;
    // if(p1x6===h6 || p2x7===h7){
    //     return 1;
    // }
    let p1x4 = "1211";
    let p2x5 = "12122";
    let h4 = history.substr(1, 4);
    let h5 = history;
    if(p1x4===h4 || p2x5===h5){
        return 1;
    }
    return 0;
}

function getPlayBet_value(p_n, p_step){
    let nplay = [];
    nplay[0]=[0, 0, 0, 0, 0];
    nplay[1]=[0, 2, 1, 1, 2];
    nplay[2]=[0, 1, 2, 2, 1];
    nplay[3]=[0, 2, 1, 1, 2];


    return nplay[p_n][p_step];
}

function getPlayBet_money(p_n, p_step){
    let nplay = [];
    nplay[0]=[0, 0, 0, 0, 0];
    nplay[1]=[0, 1, 3, 7, 15];
    nplay[2]=[0, 1, 3, 7, 15];
    nplay[3]=[0, 1, 3, 7, 15];

    return nplay[p_n][p_step];
}

function getNextBet_from_cplay(cp_old_play_info, cp_history){
    let temp_play_game_result;
    let temp_play_game_n;
    let temp_play_game_step;
    let temp_play_game_bet_value;
    let temp_play_game_bet_money;
    let temp_play_game_state;
    let temp_play_sum;

    let temp_next_result_win;
    let temp_next_play_game_result;
    let temp_next_play_game_n;
    let temp_next_play_game_step;
    let temp_next_play_game_bet_value;
    let temp_next_play_game_bet_money;
    let temp_next_play_game_state;
    let temp_next_play_game_profit;
    let temp_next_play_sum;

    temp_play_game_result       = cp_old_play_info.play_game_result;
    temp_play_game_n            = cp_old_play_info.play_game_n;
    temp_play_game_step         = cp_old_play_info.play_game_step;
    temp_play_game_bet_value    = cp_old_play_info.play_game_bet_value;
    temp_play_game_bet_money    = cp_old_play_info.play_game_bet_money;
    temp_play_game_state        = cp_old_play_info.play_game_state;
    temp_play_sum               = cp_old_play_info.sum_play;

    // temp_next_result_win            = 0;
    // temp_next_play_game_result      = 0;
    temp_next_play_game_n           = 0;
    temp_next_play_game_step        = 0;
    // temp_next_play_game_state       = 0;
    temp_next_play_game_bet_value   = 0;
    temp_next_play_game_bet_money   = 0;
    // temp_next_play_game_profit      = 0;
    // temp_next_play_sum              = 0;

    if(temp_play_game_n == 0){
        let temp_his7 = cp_history;
        //check for start new round 1211
        if(checkBet_first(temp_his7)){
            // console.log('start n1 round');
            temp_next_play_game_n = 1;
            temp_next_play_game_step = 1;
        }else{
            temp_next_play_game_n = 0;
            temp_next_play_game_step = 0;
        }
    }else{
        // เกมที่แล้ว กำลังเล่น n > 0
        if(temp_play_game_result == 3){
            //tie
            temp_next_play_game_n = temp_play_game_n;
            temp_next_play_game_step = temp_play_game_step;

        }else if(temp_play_game_result == 1){
            //win
            temp_next_play_game_n = temp_play_game_n + 1;
            temp_next_play_game_step = 1;
        }else{
            //lose
            temp_next_play_game_n = temp_play_game_n;
            temp_next_play_game_step = temp_play_game_step + 1;
        }

        //check next step
        if(temp_next_play_game_n > 3){
            temp_next_play_game_n = 0;
            temp_next_play_game_step = 0;
        }else{
            if(temp_next_play_game_step > 3){
                temp_next_play_game_n = 0;
                temp_next_play_game_step = 0;
            }
        }
    }

    if(temp_next_play_game_n > 0){
        //หาค่า bet value, bet money
        temp_next_play_game_bet_value = getPlayBet_value(temp_next_play_game_n, temp_next_play_game_step);
        temp_next_play_game_bet_money = getPlayBet_money(temp_next_play_game_n, temp_next_play_game_step);
    }

    return {
        play_game_n             : temp_next_play_game_n,
        play_game_step          : temp_next_play_game_step,
        play_game_bet_value     : temp_next_play_game_bet_value,
        play_game_bet_money     : temp_next_play_game_bet_money,
    };
}

function getPlayEmpty(){
    let play_empty = {
        game_id               : 0,
        result_win            : 0,
        sum_play              : 0,
        play_game_result      : 0,
        play_game_n           : 0,
        play_game_step        : 0,
        play_game_bet_value   : 0,
        play_game_bet_money   : 0,
        play_game_state       : 0,
        play_game_profit      : 0,
        date_utc_create       : 0,
        date_utc_create_int   : 0,
        first_save            : 0,
      };

    return play_empty;
}
///////////////

module.exports.getData_from_one_page = getData_from_one_page;
module.exports.getHistory_one_page = getHistory_one_page;
module.exports.getHistory_spage_epage = getHistory_spage_epage;

module.exports.checkwin_from_betValue = checkwin_from_betValue;
module.exports.getStr_from_his = getStr_from_his;
module.exports.getPlayBet_value = getPlayBet_value;
module.exports.getPlayBet_money = getPlayBet_money;
module.exports.checkBet_first = checkBet_first;
module.exports.getNextBet_from_cplay = getNextBet_from_cplay;

module.exports.getLastPage_web = getLastPage_web;
// module.exports.getLastGameId_zero_web = getLastGameId_zero_web;
// module.exports.first_only_initdb = first_only_initdb;
module.exports.getLast_GameId_BacaratResult_Db = getLast_GameId_BacaratResult_Db;
module.exports.getLast_GameId_BacaratPlay137_Db = getLast_GameId_BacaratPlay137_Db;

module.exports.getLast_GameId_FirstSave_BacaratResult_Db = getLast_GameId_FirstSave_BacaratResult_Db;

module.exports.getPlayEmpty = getPlayEmpty;