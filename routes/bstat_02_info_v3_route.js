// import {fetch} from 'node-fetch';

var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
const delay = require('delay');
const mo_stat02 = require('../module/mo_stat_02_v3');

var Botinfo_model           = require("../models/Botinfo");
var Bacarat7result_model    = require("../models/Bacarat7result");
var Bacarat7play137_model      = require("../models/Bacarat7play137");

//result_win 0=nodata, 1=player, 2=banker, 3=tie
//play_game_result 0=nodata, 1=win, 2=lose, 3=tie

//for update 6s
//bstat_02/bot/update/game
//bstat_02/bot/update/play

//bstat_02/info/bot_run/update
//bstat_02/play/bot_run/update

//for info
//bstat_02/info/get/last_game
//bstat_02/info/get/last_play
//bstat_02/info/get/last_play_z1

//for info json graph
//bstat_02/info/json/graph

//post->game_id
//bstat_02/info/get/gameid/check_result

///////////////
var test_run = 0;//count
var test_run_lastupdate = 0;//sec
var test_time_skip = 6;//sec
///////////////
// ///////////////
// let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
// let now_long = Date.now();//milliseconds 13 digit longint
// let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
// ///////////////

///////////////
var x_bot01_run = 0;//count
var x_bot01_run_lastupdate = 0;//sec
var x_bot01_run_time_skip = 6;//sec
var x_show_nozero = 0;
var x_show_gameid_last = 0;
var x_show_gameid_zero = 0;
var x_show_lastupdate = 0;
///////////////
var x_text_next_cdata;
var x_socket_game_id=0;
var x_socket_game_result=0;
///////////////

///////////////
var bot_processing = 0;//0=not,1=run
var bot_result_last;
///////////////

router.post('/get/gameid/check_result', async function(req, res, next) {
  ////////////////////
  if(req.body.game_id){
    ;
  }else{
    let text_show = {
      game_id     : 0,
      result_win  : -1
    };
    res.json(text_show);
    return;
  }
  ////////////////////
  let search_game_id= parseInt(req.body.game_id);
  if(search_game_id < 1){
    let text_show = {
      game_id     : search_game_id,
      result_win  : -1
    };
    res.json(text_show);
    return;
  }
  ////////////////////
  let result_show = await Bacarat7result_model.getInfo(search_game_id);
  if(result_show){
    let text_show = {
      game_id     : search_game_id,
      result_win  : result_show.result_win
    };
    res.json(text_show);
  }else{
    let text_show = {
      game_id     : search_game_id,
      result_win  : -1
    };
    res.json(text_show);
  }
  return;
});

async function getLastRow(limit) {
  let qlimit = limit;
  // const case_query = { id: update_id };
  const case_query = {
    play_game_result: {
      $gt: 0,
    },
  };
  const field_show = {
    game_id: 1,
    play_game_n: 1,
    sum_play: 1,
    play_game_step: 1,
    play_game_result: 1,
    date_utc_create: 1,
    date_utc_create_int: 1,
  };

  if (limit < 0) {
    qlimit = 100;
  }

  if (limit > 100000) {
    qlimit = 100000;
  }

  const foundUser = await Bacarat7play137_model.find(case_query, field_show)
    .limit(qlimit)
    .sort({ game_id: -1 })
    .exec();

  return foundUser;
}

router.get("/json/graph", async function (req, res, next) {
  let myuser = {};

  let qlimit = 100;

  if (req.query.limit) {
    let temp = parseInt(req.query.limit);
    if (temp > 0) {
      qlimit = temp;
    }
  }

  myuser = await getLastRow(qlimit);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(myuser));
  return;
});

////////////////////
let ca7_last_game_7_time_cache = 1;
let ca7_last_game_7_time_int = 0;
let ca7_last_game_7_processing = 0;
let ca7_last_game_7_data = {};
let ca7_last_game_7_data_sumplay = 0;
////////////////////
router.get('/get/last_game', async function(req, res, next) {
  ///////////////
  let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
  let now_long = Date.now();//milliseconds 13 digit longint
  let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
  ///////////////
  let text_show;

  if(ca7_last_game_7_time_int > 0 && ca7_last_game_7_processing > 0 ){
    console.log('inprocess send ca7_last_game_7_data');
    res.json(ca7_last_game_7_data);
    return;
  }

  ca7_last_game_7_processing = 1;

  if(ca7_last_game_7_time_int < 1 || ca7_last_game_7_time_int + ca7_last_game_7_time_cache < now_int){
    //read new
    // ca7_last_game_7_time_int = now_int;
    let result_show = await Bacarat7result_model.getLastInfo();
    if(result_show){
      let cp_cur_play_info_game_id = result_show.game_id;
      // let cp_cur_play_info_sum_play = 0;
      let cp_cur_play_info = await Bacarat7play137_model.getInfo(cp_cur_play_info_game_id);
      if(cp_cur_play_info){
        ca7_last_game_7_data_sumplay = cp_cur_play_info.sum_play;
      }

      text_show = {
        game_id               : result_show.game_id,
        result_win            : result_show.result_win,
        history               : result_show.his_09,
        sum_play              : ca7_last_game_7_data_sumplay,
        date_utc_create       : result_show.date_utc_create,
        date_utc_create_int   : result_show.date_utc_create_int
      };
      ca7_last_game_7_data = text_show;
      // ca7_last_game_7_time_int = ca7_last_game_7_time_int + 1;
      ca7_last_game_7_time_int = now_int;

    }else{
      text_show = {};
      ca7_last_game_7_data = text_show;
    }
  }else{
    //send cache
    console.log('send ca7_last_game_7_data');
  }

  ca7_last_game_7_processing = 0;
  res.json(ca7_last_game_7_data);
  return;
});

router.get('/test', function(req, res, next) {
  // return res.render('index_stat_update01', { title: 'Express' });
  // return res.render('index', { title: 'Express' });

  ///////////////
  let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
  let now_long = Date.now();//milliseconds 13 digit longint
  let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
  ///////////////

  if(now_int < test_run_lastupdate + test_time_skip){
    console.log('not run');
    console.log(now);
  }else{
    test_run++;
    test_run_lastupdate = now_int;
    console.log(test_run);
    console.log(now);
  }

  res.send('end process');
  return;
});


/* GET users listing. */
router.get('/', async function(req, res, next) {
  return res.render('index_stat_update02', { title: 'Express' });
});

/* GET users listing. */
router.get('/graph_v2', async function(req, res, next) {
  return res.render('index_graph_v2', { title: 'Graph v2' });
});

////////////////////
let ca7_last_play_7_time_cache = 1;
let ca7_last_play_7_time_int = 0;
let ca7_last_play_7_processing = 0;
let ca7_last_play_7_data = {};
////////////////////
router.get('/get/last_play', async function(req, res, next) {
  ///////////////
  let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
  let now_long = Date.now();//milliseconds 13 digit longint
  let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
  ///////////////
  //////////
  // let bot_id_run = process.env.BSTAT_ID_03_PLAY;
  // let endpage_max = 10;
  //////////
  let text_show;

  if(ca7_last_play_7_time_int > 0 && ca7_last_play_7_processing > 0 ){
    console.log('inprocess send ca7_last_play_7_data');
    res.json(ca7_last_play_7_data);
    return;
  }

  ca7_last_play_7_processing = 1;

  if(ca7_last_play_7_time_int < 1 || ca7_last_play_7_time_int + ca7_last_play_7_time_cache < now_int){
    //read new
    let cp_cur_play_info = await Bacarat7play137_model.getLastInfo();
    if(cp_cur_play_info){
      let cur_play_info_game_id = cp_cur_play_info.game_id;
      let cur_result_info = await Bacarat7result_model.getInfo(cur_play_info_game_id);

      if(cur_result_info){
        text_show = {
          game_id                       : cur_play_info_game_id,
          result_win                    : cur_result_info.result_win,
          history                       : cur_result_info.his_09,
          cgame                         : cur_result_info.his_09 + cur_result_info.result_win,

          sum_play                      : cp_cur_play_info.sum_play,

          play_game_result              : cp_cur_play_info.play_game_result,
          next_play_game_n              : cp_cur_play_info.play_game_n,
          next_play_game_step           : cp_cur_play_info.play_game_step,
          next_play_game_bet_value      : cp_cur_play_info.play_game_bet_value,
          next_play_game_bet_money      : cp_cur_play_info.play_game_bet_money,

          date_utc_create               : cp_cur_play_info.date_utc_create,
          date_utc_create_int           : cp_cur_play_info.date_utc_create_int
        };
      }else{
        text_show = {
          game_id                       : cur_play_info_game_id,
          result_win                    : 0,
          history                       : "",
          cgame                         : "",

          sum_play                      : 0,

          play_game_result              : 0,
          next_play_game_n              : 0,
          next_play_game_step           : 0,
          next_play_game_bet_value      : 0,
          next_play_game_bet_money      : 0,

          date_utc_create               : cp_cur_play_info.date_utc_create,
          date_utc_create_int           : cp_cur_play_info.date_utc_create_int
        };
      }

      ca7_last_play_7_data = text_show;
      ca7_last_play_7_time_int = now_int;
    }else{
      // text_show = {
      //   game_id_last: -1,
      //   result_win: -1,
      //   history: -1,
      //   sum_play: 0,
      //   lastupdate: 0
      // };
      text_show = {
        game_id                       : 0,
        result_win                    : 0,
        history                       : "",
        cgame                         : "",

        sum_play                      : 0,

        play_game_result              : 0,
        next_play_game_n              : 0,
        next_play_game_step           : 0,
        next_play_game_bet_value      : 0,
        next_play_game_bet_money      : 0,

        date_utc_create               : 0,
        date_utc_create_int           : 0
      };

      ca7_last_play_7_data = text_show;
    }
  }else{
    //send cache
    console.log('send cache ca7_last_play_7_data');
  }

  ca7_last_play_7_processing = 0;
  res.json(ca7_last_play_7_data);
  return;
});

router.get('/bot_run/update', isRuntime_Next_bot01, async function(req, res, next) {
  let text_show;
  //////////////////////////////
  if(bot_processing){
    console.log('bot inprocess.. send cache');
    if(bot_result_last==null){
      text_show = {
        game_id: 0,
        result_win: 0,
        history: "",
        cgame: "",
        // sum_play: 0,
        lastupdate: 0
      };

      bot_result_last = text_show;
    }

    ///////////////
    res.json(bot_result_last);
    ///////////////
    return;
  }else{
    // console.log('bot run update');
  }
  //////////////////////////////
  bot_processing = 1;
  let rcase = await getupdate();
  bot_processing = 0;
  //////////////////////////////

  ///////////////
  let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
  let now_long = Date.now();//milliseconds 13 digit longint
  let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
  ///////////////

  if(rcase){
    x_bot01_run_lastupdate= now_int;
    x_bot01_run_time_skip = 9;
  }else{
    x_bot01_run_lastupdate= now_int;
    x_bot01_run_time_skip = 3
  }
  // res.send('end process');
  
  let temp_rec_play = await Bacarat7result_model.getLastInfo();
  if(temp_rec_play){
    text_show = {
      game_id: temp_rec_play.game_id,
      result_win: temp_rec_play.result_win,
      history: temp_rec_play.his_09,
      cgame: temp_rec_play.his_09+temp_rec_play.result_win,
      // sum_play: sum_play,
      lastupdate: temp_rec_play.date_utc_create_int
    };

    x_socket_game_id = temp_rec_play.game_id;
    req.app.io.emit('tx', {key:x_socket_game_id});
  }else{
    text_show = {
      game_id: -1,
      result_win: -1,
      history: -1,
      cgame: -1,
      // sum_play: 0,
      lastupdate: 0
    };
  }

  ///////////////
  x_text_next_cdata = text_show;
  bot_result_last = text_show;
  ///////////////
  res.json(x_text_next_cdata);
  ///////////////
  return;
});

////////////////////////////////////////

async function getupdate(){
  ///////////////
  let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
  let now_long = Date.now();//milliseconds 13 digit longint
  let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
  ///////////////

  ///////////////
  let bot_id_run = process.env.BSTAT_ID_03_RESULT;
  let endpage_max = 10;
  ///////////////
  let rows = [];
  let rows_for_save = [];
  let i_zero = -1;
  let i_game_id = 0;
  let bot_inprocess = 0;
  let gameid_bot = 0;
  let bot_run_lastupdate = 0;
  let bot_run_skip = 6;
  ///////////////
  let bot_last_game_id = 0;
  let temp_game_id = 0;
  let game_id_zero = 0;
  let web_start = 0;
  let web_end = 0;
  let temp_space = 0;
  ///////////////
  let first_save = 0;//1=first save
  let have_update = 0;//0=no update
  let rec_last;
  let his_01 = "";
  let his_02 = "";
  let his_03 = "";
  let his_04 = "";
  let his_05 = "";
  let his_06 = "";
  let his_07 = "";
  let his_08 = "";
  let his_09 = "";
  let his_20 = "";
  let his_50 = "";
  let his_50_notie = "";
  ///////////////

  let bot_info = await Botinfo_model.getInfo(bot_id_run);
  if(!bot_info){
      let i=5;
      while(i>0){
          let bot_info = await Botinfo_model.getInfo(bot_id_run);
          if(bot_info){
              break;
          }
          i=i-1;
          await delay(600);
      }
  }

  if(bot_info==null){
    console.log('ss00000000000000000000000');
    console.log(bot_info);
    console.log('ee00000000000000000000000');
  }else if(bot_info.last_game_id==0){
    console.log('ss00000000000000000000000');
    console.log(bot_info);
    console.log('ee00000000000000000000000');
  }
  

  // let bot_info = await mo_stat02.getLast_GameId_Botinfo_Db(bot_id_run);
  bot_last_game_id = bot_info.last_game_id;
  bot_run_lastupdate = bot_info.date_utc_lastupdate_int;

  //เริ่มการทำงาน
  ///////////////
  await Botinfo_model.setBot_lastupdate(bot_id_run);
  ///////////////
  // console.log(x_bot01_run);
  console.log(now);

  //game id from db
  temp_game_id = await mo_stat02.getLast_GameId_BacaratResult_Db();
  // game_id_zero =  temp_game_id;

  rows = await mo_stat02.getHistory_spage_epage(1, 1);//rows->a-z

  if(rows.length < 1){
    console.log('error no data');
    console.log(rows);
    return 0;
  }

  web_start = rows[0].gameId;
  web_end = rows[rows.length-1].gameId;
  //check game_id from bot and web
  temp_space = web_end - bot_last_game_id;
  console.log('+++++++++++ bot info +++++++++++');
  console.log('last db   game_id = '+temp_game_id);
  console.log('last www  game_id = '+web_end);
  console.log('last bot  game_id = '+bot_last_game_id);
  console.log('+++++++++++ space = '+temp_space);
  console.log('');


  if(temp_space<1){
    ///////////////
    // let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
    let now_long = Date.now();//milliseconds 13 digit longint
    let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
    ///////////////
    //เป็นข้อมูลล่าสุดแล้ว ไม่ต้องทำอะไร
    // bot_run_lastupdate = now_int+3;
    console.log('db no update');
    ///////////////
    await Botinfo_model.setBot_lastupdate(bot_id_run);
    ///////////////
    // return 0;
  }else{
    //have new rows
    let page_x = Math.ceil(temp_space / 20);
    // console.log('temp_sc='+temp_space)
    // console.log('page_x='+page_x);
    ////////////////
    rec_last = await Bacarat7result_model.getLastInfo();
    if(!rec_last){
      rec_last={
        game_id : -1,
        result_win : 0,
        his_01 : "",
        his_02 : "",
        his_03 : "",
        his_04 : "",
        his_05 : "",
        his_06 : "",
        his_07 : "",
        his_08 : "",
        his_09 : "",
        his_20 : "",
        his_50 : "",
        his_50_notie : "",
        date_utc_create : 0,
        date_utc_create_int : 0,
        first_start : 1,
      };

      first_save = 1;
    }
    ////////////////

    let temp_game_id_last;
    let temp_game_id_crow;
    let temp_game_result_win;
    let temp_game_result_win_old;
    let temp_space_game_id;

    temp_game_id_last = rec_last.game_id;
    temp_game_result_win = rec_last.result_win;
    his_50 = rec_last.his_50;
    his_50_notie = rec_last.his_50_notie;
    if(page_x > 10){
      page_x = 10;
    }

    await delay(600);
    rows = await mo_stat02.getHistory_spage_epage(1, page_x);//rows->a-z
    let temp_game_id_web_row_s = rows[0].gameId;
    console.log('processing ... ' + rows[0].gameId + '->' + rows[rows.length-1].gameId);
    if(temp_game_id_last < temp_game_id_web_row_s){
      temp_game_result_win = 0;
      his_50 = "";
      his_50_notie = "";
      first_save = 1;
    }

    for(let i=0;i<rows.length;i++){
      temp_game_id_crow = rows[i].gameId;
      temp_space_game_id = temp_game_id_crow - temp_game_id_last

      temp_game_result_win_old = temp_game_result_win;
      temp_game_result_win = await mo_stat02.checkwin_from_betValue(parseInt(rows[i].betValue));
      if((temp_space_game_id < 1)){
        //จัดการเฉพาะ id จาก web ที่มากกว่า geme_id_last
        continue;
      }

      // temp_game_result_win_old = temp_game_result_win;
      // temp_game_result_win = await mo_stat02.checkwin_from_betValue(parseInt(rows[i].betValue));
      if((temp_space_game_id == 1)){
        if(first_save){
          //ถ้า เป็นอันแรก ตั้งค่าเริ่มต้น
          //start first
          his_50 = "";
          his_50_notie = "";
        }else{
          //อันเก่า เพิ่มค่าเข้าไป
          //start from old
          his_50 = rec_last.his_50 + temp_game_result_win_old;
          his_50_notie = rec_last.his_50_notie + temp_game_result_win_old;
        }

      }else{
        his_50 = his_50 + temp_game_result_win_old;
        his_50_notie = his_50_notie + temp_game_result_win_old;
      }
      // console.log('rows[i].result_win='+ rows[i].result_win)
      // 3 = tie
      his_50_notie = his_50_notie.replace('3','');
      his_01 = await mo_stat02.getStr_from_his(his_50, 1);
      his_02 = await mo_stat02.getStr_from_his(his_50, 2);
      his_03 = await mo_stat02.getStr_from_his(his_50, 3);
      his_04 = await mo_stat02.getStr_from_his(his_50, 4);
      his_05 = await mo_stat02.getStr_from_his(his_50, 5);
      his_06 = await mo_stat02.getStr_from_his(his_50, 6);
      his_07 = await mo_stat02.getStr_from_his(his_50, 7);
      his_08 = await mo_stat02.getStr_from_his(his_50, 8);
      his_09 = await mo_stat02.getStr_from_his(his_50, 9);
      his_20 = await mo_stat02.getStr_from_his(his_50, 20);
      his_50 = await mo_stat02.getStr_from_his(his_50, 50);
      his_50_notie = await mo_stat02.getStr_from_his(his_50_notie, 50);

      // if(temp_game_id_last==-1){
      //   if(i<195){
      //     continue;
      //   }
      // }

      if(first_save == 1 && his_50_notie.length < 50){
        continue;
      }

      ///////////////
      let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
      let now_long = Date.now();//milliseconds 13 digit longint
      let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
      ///////////////
      let case_save = {
        game_id             : rows[i].gameId
      };
      let item_save = {
        game_id             : rows[i].gameId,
        result_win          : temp_game_result_win,
        his_01              : his_01,
        his_02              : his_02,
        his_03              : his_03,
        his_04              : his_04,
        his_05              : his_05,
        his_06              : his_06,
        his_07              : his_07,
        his_08              : his_08,
        his_09              : his_09,
        his_20              : his_20,
        his_50              : his_50,
        his_50_notie        : his_50_notie,
        date_utc_create     : now,
        date_utc_create_int : now_int,
        first_save          : first_save,
      };
      first_save = 0;
      have_update = rows[i].gameId;
      // console.log(item_save);
      await Bacarat7result_model.insertOrUpdate(case_save, item_save);
      //save RouleteResult
      // ////////////////////
      // let case_save = {
      //   game_id:rows[i].gameId
      // };
      // let item_save = {
      //   game_id             : rows[i].gameId,
      //   result_win          : result_win,
      //   result_value        : rows[i].value,
      //   date_utc_create     : now,
      //   date_utc_create_int : now_int
      // };
      // await Roulete7result_model.insertOrUpdate(case_save, item_save);
      // ////////////////////
      ///////////////////
      // break;
    }
    // let temp_game_id_end = rows[rows.length-1].gameId;
    if(have_update>0 && have_update>temp_game_id){
      console.log('update botinfo')
      let temp_game_id_end = have_update;
      await Botinfo_model.setLastGameId(bot_id_run, temp_game_id_end);
    }else{
      console.log('Nooooooo update botinfo')
    }

    //game id ล่าสุด , count game no zero
    // temp_game_id = await mo_stat02.getLast_GameId_Roulete_Db();
    ///////////////
    // let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
    let now_long = Date.now();//milliseconds 13 digit longint
    let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
    ///////////////
    // x_show_gameid_zero =  temp_game_id;
    // x_show_gameid_last = temp_game_id_end;
    // x_show_nozero = x_show_gameid_last - x_show_gameid_zero;
    // x_show_lastupdate = now_int;

    console.log('update new rows finish.')
    // console.log('x_show_nozero='+x_show_nozero)
    return 1;
  }

  return 0;
}

function isRuntime_Next_bot01(req, res, next) {
  // return next();

  ///////////////
  let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
  let now_long = Date.now();//milliseconds 13 digit longint
  let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
  ///////////////
  if(now_int < x_bot01_run_lastupdate + x_bot01_run_time_skip){
    console.log('not run');
    console.log(now);
  }else{
    x_bot01_run++;
    x_bot01_run_lastupdate = now_int;
    x_bot01_run_time_skip = 3
    // console.log(x_bot01_run);
    // console.log(now);
    return next();
  }

  // return res.send('x_bot01 not run');
  res.json(x_text_next_cdata);
  return;
}


function isRuntime_Next_test(req, res, next) {
  ///////////////
  let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
  let now_long = Date.now();//milliseconds 13 digit longint
  let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
  ///////////////
  if(now_int < test_run_lastupdate + test_time_skip){
    console.log('not run');
    console.log(now);
  }else{
    test_run++;
    test_run_lastupdate = now_int;
    console.log(test_run);
    console.log(now);
    return next();
  }

  return res.send('not run');
}

////////////////////////////////////////

module.exports = router;
