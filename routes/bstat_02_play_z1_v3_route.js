// import {fetch} from 'node-fetch';

var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
const delay = require('delay');
const mo_stat02 = require('../module/mo_stat_02_v3');
const mo_play02 = require('../module/mo_play_02_v3');

var Botinfo_model           = require("../models/Botinfo");
var Bacarat7result_model    = require("../models/Bacarat7result");
var Bacarat7play137_model      = require("../models/Bacarat7play137");

//result_win 0=nodata, 1=player, 2=banker, 3=tie
//play_game_result 0=nodata, 1=win, 2=lose, 3=tie

//for update 6s
//bstat_02/bot/update/game
//bstat_02/bot/update/play

//bstat_02/play/bot_run/update

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


//////////////////////////////
var bot_processing = 0;//0=not,1=run
var bot_result_last;

// let bot_result_nodata = {
//   game_id_last: -1,
//   result_win: -1,
//   history: -1,
//   cgame: -1,
//   lastupdate: 0
// };

let bot_result_nodata = {
  game_id_last_result: -999,
  game_id_last_play: -999,
  game_id_last_bot: -999,
};

var x_bot_game_id_last_result = -999;
var x_bot_game_id_last_play = -999;
var x_bot_game_id_last_bot = -999;
//////////////////////////////


// router.post('/get/gameid/check_result', async function(req, res, next) {
//   ////////////////////
//   if(req.body.game_id){
//     ;
//   }else{
//     let text_show = {
//       game_id     : 0,
//       result_win  : -1
//     };
//     res.json(text_show);
//     return;
//   }
//   ////////////////////
//   let search_game_id= parseInt(req.body.game_id);
//   if(search_game_id < 1){
//     let text_show = {
//       game_id     : search_game_id,
//       result_win  : -1
//     };
//     res.json(text_show);
//     return;
//   }
//   ////////////////////
//   let result_show = await Bacarat7result_model.getInfo(search_game_id);
//   if(result_show){
//     let text_show = {
//       game_id     : search_game_id,
//       result_win  : result_show.result_win
//     };
//     res.json(text_show);
//   }else{
//     let text_show = {
//       game_id     : search_game_id,
//       result_win  : -1
//     };
//     res.json(text_show);
//   }
//   return;
// });

// router.get('/get/last_game', async function(req, res, next) {
//   let result_show = await Bacarat7result_model.getLastInfo();
//   if(result_show){
//     let text_show = {
//       game_id               : result_show.game_id,
//       result_win            : result_show.result_win,
//       date_utc_create       : result_show.date_utc_create,
//       date_utc_create_int   : result_show.date_utc_create_int
//     };
//     res.json(text_show);
//   }else{
//     let text_show = {};
//     res.json(text_show);
//   }
//   return;
// });

// router.get('/test', function(req, res, next) {
//   // return res.render('index_stat_update01', { title: 'Express' });
//   // return res.render('index', { title: 'Express' });

//   ///////////////
//   let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
//   let now_long = Date.now();//milliseconds 13 digit longint
//   let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
//   ///////////////

//   if(now_int < test_run_lastupdate + test_time_skip){
//     console.log('not run');
//     console.log(now);
//   }else{
//     test_run++;
//     test_run_lastupdate = now_int;
//     console.log(test_run);
//     console.log(now);
//   }

//   res.send('end process');
//   return;
// });







// /* GET users listing. */
// router.get('/', async function(req, res, next) {
//   return res.render('index_stat_update02', { title: 'Express' });
// });

// router.get('/get/last_play', async function(req, res, next) {
//   //////////
//   let bot_id_run = process.env.BSTAT_ID_03_PLAY;
//   let endpage_max = 10;
//   //////////
//   let text_show
//   let temp_rec_play = await Bacarat7result_model.getLastInfo();
//   if(temp_rec_play){
//     let temp_rc_play = await Bacarat7play137_model.getLastInfo();
//     let sum_play = 0;
//     if(temp_rc_play){
//       sum_play = temp_rc_play.sum_play;
//     }else{
//       sum_play = 0;
//     }
//     text_show = {
//       game_id_last: temp_rec_play.game_id,
//       result_win: temp_rec_play.result_win,
//       history: temp_rec_play.his_09,
//       sum_play: sum_play,
//       lastupdate: temp_rec_play.date_utc_create_int
//     };
//   }else{
//     text_show = {
//       game_id_last: -1,
//       result_win: -1,
//       history: -1,
//       sum_play: 0,
//       lastupdate: 0
//     };
//   }

//   res.json(text_show);
//   return;
// });

// router.get('/bot_run/update', isRuntime_Next_bot01, async function(req, res, next) {
router.get('/bot_run/update', async function(req, res, next) {
  //0 ทำต่อ จาก play game_id
  //-1 ทำต่อ จาก first game_id
  //-2 ทำต่อ จาก result game_id
  let text_show;
  //////////////////////////////
  if(bot_processing){
    console.log('bot inprocess.. send cache');
    if(bot_result_last==null){
      bot_result_last = bot_result_nodata;
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

  ///////////////
  let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
  let now_long = Date.now();//milliseconds 13 digit longint
  let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
  ///////////////

  text_show = {
    game_id_last_result: x_bot_game_id_last_result,
    game_id_last_play: x_bot_game_id_last_play,
    game_id_last_bot: x_bot_game_id_last_bot,
  };

  if(rcase){
    if(rcase<0){
      x_bot01_run_lastupdate= now_int;
      x_bot01_run_time_skip = 6;

      x_text_next_cdata = bot_result_nodata;
      bot_result_last = bot_result_nodata;
    }else{
      x_bot01_run_lastupdate= now_int;
      x_bot01_run_time_skip = 6;

      x_text_next_cdata = text_show;
      bot_result_last = text_show;
    }
  }else{
    x_bot01_run_lastupdate= now_int;
    x_bot01_run_time_skip = 3;

    x_text_next_cdata = text_show;
    bot_result_last = text_show;
  }
  // res.send('end process');

  // text_show = {
  //   game_id_last_result: x_bot_game_id_last_result,
  //   game_id_last_play: x_bot_game_id_last_play,
  //   game_id_last_bot: x_bot_game_id_last_bot,
  // };
  
  // let temp_rec_play = await Bacarat7result_model.getLastInfo();
  // if(temp_rec_play){
  //   text_show = {
  //     game_id_last: temp_rec_play.game_id,
  //     result_win: temp_rec_play.result_win,
  //     history: temp_rec_play.his_09,
  //     cgame: temp_rec_play.his_09+temp_rec_play.result_win,
  //     // sum_play: sum_play,
  //     lastupdate: temp_rec_play.date_utc_create_int
  //   };

  //   x_socket_game_id = temp_rec_play.game_id;
  //   req.app.io.emit('tx', {key:x_socket_game_id});
  // }else{
  //   text_show = {
  //     game_id_last: -1,
  //     result_win: -1,
  //     history: -1,
  //     cgame: -1,
  //     // sum_play: 0,
  //     lastupdate: 0
  //   };
  // }

  ///////////////
  // x_text_next_cdata = text_show;
  // bot_result_last = text_show;
  ///////////////
  bot_processing = 0;
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
  let bot_id_run = process.env.BSTAT_ID_03_PLAY;
  let endpage_max = 10;
  let u_return = 0;
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

  let temp_game_id_result = 0;
  let temp_game_id_play = 0;

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
    return 0;
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
  // await Botinfo_model.setBot_lastupdate(bot_id_run);
  ///////////////
  // console.log(x_bot01_run);
  console.log(now);

  //////////////////////// Start bot play

  //game id from db result
  temp_game_id_result = await mo_stat02.getLast_GameId_BacaratResult_Db();
  if(temp_game_id_result < 1){
    //ไม่มีข้อมูล result
    console.log('Init db result');
    return 0;
  }

  //game id from db play
  temp_game_id_play = await mo_play02.getLast_GameId_BacaratPlay137_Db();
  if(temp_game_id_play < 1){
    //start play
    console.log('Init db play');
  }
  
  //check game_id from bot and web
  //gameid == result > play > bot
  let temp_space1_rp = temp_game_id_result - temp_game_id_play;
  let temp_space2_rb = temp_game_id_result - bot_last_game_id;
  if(bot_last_game_id<0){
    temp_space2_rb = temp_game_id_result;
  }

  ////////////////////
  x_bot_game_id_last_result=temp_game_id_result;
  x_bot_game_id_last_play=temp_game_id_play;
  x_bot_game_id_last_bot=bot_last_game_id;
  ////////////////////
  console.log('+++++++++++ bot play +++++++++++');
  console.log('last info game_id = '+temp_game_id_result);
  console.log('last play game_id = '+temp_game_id_play);
  console.log('last bot  game_id = '+bot_last_game_id);
  console.log('+++++++++++ space = rplay='+temp_space1_rp +'/ rbot='+temp_space2_rb);
  console.log('');

  if(temp_space1_rp<1){
    console.log('not play case temp_space1_rp<1');
    return 0;
  }

  //////////////////////// check inital database
  if(bot_last_game_id < 1){
    //0 ทำต่อ จาก play game_id
    //-1 ทำต่อ จาก first game_id
    //-2 ทำต่อ จาก result game_id
    let temp_first_save_game_id=0;
    if(bot_last_game_id == -1){
      temp_first_save_game_id = await mo_play02.getLast_GameId_FirstSave_BacaratResult_Db();
      if(temp_first_save_game_id < 1){
        console.log('no Start first info');
        return 0;
      }
      console.log('start first id='+temp_first_save_game_id);
    }else if(bot_last_game_id == -2){
      temp_first_save_game_id = temp_game_id_result;
      if(temp_first_save_game_id < 1){
        console.log('no Start first info');
        return 0;
      }
      console.log('start first id='+temp_first_save_game_id);
    }else{
      temp_first_save_game_id = temp_game_id_play + 1;
      if(temp_first_save_game_id <= temp_game_id_result){
        console.log('start first resume id ='+temp_first_save_game_id);
      }else{
        console.log('no next result id');
        return 0;
      }
    }

    //Start first
    // console.log('start first');
    cur_play_game_id = temp_first_save_game_id;
    cp_old_result_info = await Bacarat7result_model.getInfo(cur_play_game_id);

    if(cp_old_result_info){
      ;
    }else{
      await Botinfo_model.setLastGameId(bot_id_run, temp_first_save_game_id);
      return 0;
    }

    let temp_game_result_win = cp_old_result_info.result_win;

    /////////////////////////////////////////////
    //update first save->play
    //update first save->bot
    ///////////////
    let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
    let now_long = Date.now();//milliseconds 13 digit longint
    let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
    ///////////////
    let case_save = {
      game_id             : cur_play_game_id
    };
    // let item_save = {
    //   game_id               : cur_play_game_id,
    //   result_win            : temp_game_result_win,
    //   sum_play              : 1000,
    //   play_game_result      : 0,
    //   play_game_n           : 0,
    //   play_game_step        : 0,
    //   play_game_bet_value   : 0,
    //   play_game_bet_money   : 0,
    //   play_game_state       : 0,
    //   play_game_profit      : 0,
    //   date_utc_create       : now,
    //   date_utc_create_int   : now_int,
    //   first_save            : 1,
    // };
    let item_save = mo_play02.getPlayEmpty();
    item_save.game_id             = cur_play_game_id;
    item_save.result_win          = temp_game_result_win;
    item_save.sum_play            = 1000;
    item_save.date_utc_create     = now;
    item_save.date_utc_create_int = now_int;
    item_save.first_save          = 1;

    await Bacarat7play137_model.insertOrUpdate(case_save, item_save);
    await Botinfo_model.setLastGameId(bot_id_run, temp_first_save_game_id);
    /////////////////////////////////////////////
    // x_play137_text_next_cdata = {
    //   game_id_last:cur_play_game_id
    // }
    x_bot_game_id_last_bot = cur_play_game_id;
    x_bot_game_id_last_play = cur_play_game_id;
    return 1;

  }else{
    
  }

  //gameid_bot < gameid_result
  //space2 <= 0 play
  if(temp_space2_rb<1){
    //not play
    console.log('not play case temp_space2_rb<1');
    console.log('wait new game');
    return 0;
  }

  // console.log('play next');
  cur_play_game_id = bot_last_game_id + 1;

  u_return = await p_step_update(bot_id_run, cur_play_game_id, bot_last_game_id);

  if(u_return>0){
    console.log('update play next');
    cur_play_game_id = u_return;
    x_bot_game_id_last_bot = cur_play_game_id;
    x_bot_game_id_last_play = cur_play_game_id;
    return 1;
  }else{
    console.log('not update');
  }

  return 0;
}

async function p_step_update(bot_id_run, cur_play_game_id, bot_last_game_id){
  //มาถึง step นี้ ยังไงก็ต้องเล่น
  // case 1 result_info = null แสดงว่า ไม่มีข้อมูล ให้ playgame record 0
  // case 2 play_info = null แสดงว่า ยังไม่ได้เล่น ให้ playgame record 0
  // case 3 play_info = null แสดงว่า ยังไม่ได้เล่น ให้ playgame record 0
  ///////////////
  let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
  let now_long = Date.now();//milliseconds 13 digit longint
  let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
  ///////////////

  console.log('คำนวนเกมต่อไป cur_play =' + cur_play_game_id);
  //get info cur_play from db_result
  let cp_next_result_info = await Bacarat7result_model.getInfo(cur_play_game_id);
  if(!cp_next_result_info){
    //ไม่เจอ next result แสดงว่า ยังไม่มีผลข้อมูล รออีกรอบ
    console.log('bot_last_game_id='+bot_last_game_id);
    console.log('cur_play_game_id='+cur_play_game_id);
    console.log('cp_next_result_info='+cp_next_result_info);
    console.log('case 1 no cp_next_result_info=>empty play ');

    ////////////////////
    let cp_last_play_info = await Bacarat7play137_model.getLastInfo();
    let cp_last_sumplay = 0;
    if(cp_last_play_info!=null){
      cp_last_sumplay = cp_last_play_info.sum_play;
      await p_step_empty_oldplay(bot_id_run, cur_play_game_id, 0, cp_last_sumplay);
      return cur_play_game_id;
    }else{
      await p_step_empty_oldplay(bot_id_run, cur_play_game_id, 0, 1000);
      return cur_play_game_id;
    }
    ////////////////////
  }

  let cp_old_result_info = await Bacarat7result_model.getInfo(bot_last_game_id);
  if(!cp_old_result_info){
    //ไม่เจอ old result แสดงว่า เป็นเกมแรก กำหนดค่าเริ่มต้นเกม
    console.log('bot_last_game_id='+bot_last_game_id);
    console.log('cur_play_game_id='+cur_play_game_id);
    console.log('cp_old_result_info='+cp_old_result_info);
    console.log('case 2 no cp_old_result_info=>empty play ');

    ////////////////////
    let cp_last_play_info = await Bacarat7play137_model.getLastInfo();
    let cp_last_sumplay = 0;
    if(cp_last_play_info!=null){
      cp_last_sumplay = cp_last_play_info.sum_play;
      await p_step_empty_oldplay(bot_id_run, cur_play_game_id, 0, cp_last_sumplay);
      return cur_play_game_id;
    }else{
      await p_step_empty_oldplay(bot_id_run, cur_play_game_id, 0, 1000);
      return cur_play_game_id;
    }
    ////////////////////
  }else{
    //อ่านค่า เกมที่เล่นว่าอยู่สเตทไหน
  }

  let cp_old_play_info = await Bacarat7play137_model.getInfo(bot_last_game_id);
  if(!cp_old_play_info){
    //ไม่เจอ old play แสดงว่า เป็นเกมแรก กำหนดค่าเริ่มต้นเกม
    console.log('bot_last_game_id='+bot_last_game_id);
    console.log('cur_play_game_id='+cur_play_game_id);
    console.log('cp_old_play_info='+cp_old_play_info);
    console.log('case 3 no cp_old_play_info=>empty play ');

    ////////////////////
    let cp_last_play_info = await Bacarat7play137_model.getLastInfo();
    let cp_last_sumplay = 0;
    if(cp_last_play_info!=null){
      cp_last_sumplay = cp_last_play_info.sum_play;
      await p_step_empty_oldplay(bot_id_run, cur_play_game_id, cp_next_result_info.result_win, cp_last_sumplay);
      return cur_play_game_id;
    }else{
      await p_step_empty_oldplay(bot_id_run, cur_play_game_id, cp_next_result_info.result_win, 1000);
      return cur_play_game_id;
    }
    ////////////////////
  }else{
    //อ่านค่า เกมที่เล่นว่าอยู่สเตทไหน
  }

  ///////////////////////////////////////
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
  ///////////////////////////////////////

  temp_play_game_result       = cp_old_play_info.play_game_result;
  temp_play_game_n            = cp_old_play_info.play_game_n;
  temp_play_game_step         = cp_old_play_info.play_game_step;
  temp_play_game_bet_value    = cp_old_play_info.play_game_bet_value;
  temp_play_game_bet_money    = cp_old_play_info.play_game_bet_money;
  temp_play_game_state        = cp_old_play_info.play_game_state;
  temp_play_sum               = cp_old_play_info.sum_play;

  temp_next_result_win            = cp_next_result_info.result_win;
  temp_next_play_game_result      = 0;
  temp_next_play_game_n           = 0;
  temp_next_play_game_step        = 0;
  temp_next_play_game_state       = 0;
  temp_next_play_game_bet_value   = 0;
  temp_next_play_game_bet_money   = 0;
  temp_next_play_game_profit      = 0;
  temp_next_play_sum              = temp_play_sum;

  if(temp_play_game_n == 0){
    console.log('n0 check new round');
    // let temp_his7 = cp_next_result_info.his_07;
    let temp_his7 = cp_next_result_info.his_05;
    //check for start new round 1211
    if(mo_play02.checkBet_first(temp_his7)){
      console.log('start n1 round');
      temp_next_play_game_n = 1;
      temp_next_play_game_step = 1;
    }else{
      temp_next_play_game_n = 0;
      temp_next_play_game_step = 0;
    }
  }else{
    console.log('check current play');
    // เกมที่แล้ว กำลังเล่น n > 0 

    //ผล ชนะหรือแพ้ for old play
    //check temp_next_result_win กับ old play
    if(temp_play_game_bet_value>0){
      if(temp_next_result_win == 0){
        //no data
        temp_next_play_game_result = 0;
        temp_next_play_game_profit = 0;
        // temp_next_play_sum = temp_next_play_sum;

        temp_next_play_game_n = temp_play_game_n;
        temp_next_play_game_step = temp_play_game_step;
      }else if(temp_next_result_win == 3){
        //tie
        temp_next_play_game_result = 3;
        temp_next_play_game_profit = 0;
        // temp_next_play_sum = temp_next_play_sum;

        temp_next_play_game_n = temp_play_game_n;
        temp_next_play_game_step = temp_play_game_step;
      }else if(temp_next_result_win == temp_play_game_bet_value){
        //win
        temp_next_play_game_result = 1;
        temp_next_play_game_profit = temp_play_game_bet_money;
        temp_next_play_sum = temp_next_play_sum + temp_play_game_bet_money;

        temp_next_play_game_n = temp_play_game_n + 1;
        temp_next_play_game_step = 1;
      }else{
        //lose
        temp_next_play_game_result = 2;
        temp_next_play_game_profit = 0 - temp_play_game_bet_money;
        temp_next_play_sum = temp_next_play_sum - temp_play_game_bet_money;

        temp_next_play_game_n = temp_play_game_n;
        temp_next_play_game_step = temp_play_game_step + 1;
      }
    }else{
      temp_next_play_game_result = 0;
      temp_next_play_game_profit = 0;
        // temp_next_play_sum = temp_next_play_sum;

      temp_next_play_game_n = temp_play_game_n;
      temp_next_play_game_step = temp_play_game_step;
    }

    //check step max
    if(temp_next_play_game_n > 3){
      temp_next_play_game_n = 0;
      temp_next_play_game_step = 0;
    }else{
      if(temp_next_play_game_step > 3){
        temp_next_play_game_n = 0;
        temp_next_play_game_step = 0;
      }
    }

    // if(temp_play_game_result == 3){
    //   //tie
    //   temp_next_play_game_n = temp_play_game_n;
    //   temp_next_play_game_step = temp_play_game_step;

    // }else if(temp_play_game_result == 1){
    //   //win
    //   temp_next_play_game_n = temp_play_game_n + 1;
    //   temp_next_play_game_step = 1;
    // }else{
    //   //lose
    //   temp_next_play_game_n = temp_play_game_n;
    //   temp_next_play_game_step = temp_play_game_step + 1;
    // }

    // // check next step
    // if(temp_next_play_game_n > 3){
    //     temp_next_play_game_n = 0;
    //     temp_next_play_game_step = 0;
    // }else{
    //   if(temp_next_play_game_step > 3){
    //     temp_next_play_game_n = 0;
    //     temp_next_play_game_step = 0;
    //   }
    // }
  }

  if(temp_next_play_game_n > 0){
    //หาค่า bet value, bet money for next play
    temp_next_play_game_bet_value = mo_play02.getPlayBet_value(temp_next_play_game_n, temp_next_play_game_step);
    temp_next_play_game_bet_money = mo_play02.getPlayBet_money(temp_next_play_game_n, temp_next_play_game_step);
  }

  console.log('nx g '+temp_next_play_game_n+"/"+temp_next_play_game_step);
  console.log(cp_next_result_info.his_09+' '+cp_next_result_info.result_win+' next play>'+temp_next_play_game_result);

  

  /////////////////////////////////////////////
    //update first save->play
    //update first save->bot
    ///////////////
    // let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
    // let now_long = Date.now();//milliseconds 13 digit longint
    // let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
    ///////////////
    let case_save = {
      game_id             : cur_play_game_id
    };
    let item_save = {
      game_id               : cur_play_game_id,
      result_win            : temp_next_result_win,
      sum_play              : temp_next_play_sum,
      play_game_result      : temp_next_play_game_result,
      play_game_profit      : temp_next_play_game_profit,

      play_game_n           : temp_next_play_game_n,
      play_game_step        : temp_next_play_game_step,
      play_game_bet_value   : temp_next_play_game_bet_value,
      play_game_bet_money   : temp_next_play_game_bet_money,
      play_game_state       : temp_next_play_game_state,

      date_utc_create       : now,
      date_utc_create_int   : now_int,
      first_save            : 0,
    };
    // console.log(item_save);
    console.log(cur_play_game_id);
    await Bacarat7play137_model.insertOrUpdate(case_save, item_save);
    await Botinfo_model.setLastGameId(bot_id_run, cur_play_game_id);
    /////////////////////////////////////////////

    console.log('end p_step_update ');
    return cur_play_game_id;

}

async function p_step_empty_oldplay(bot_id_run, cur_play_game_id, cur_result_win, last_sum_play){
  //มาถึง step นี้ ข้อมูลบางช่วงอาจขาดหาย ก็ทำการ clear play เป็น สถานะว่างพร้อมเล่นต่อ
  /////////////////////////////////////////////
    //update first save->play
    //update first save->bot
    ///////////////
    let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
    let now_long = Date.now();//milliseconds 13 digit longint
    let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
    ///////////////
    let case_save = {
      game_id             : cur_play_game_id
    };
    // let item_save = {
    //   game_id               : cur_play_game_id,
    //   result_win            : temp_game_result_win,
    //   sum_play              : 1000,
    //   play_game_result      : 0,
    //   play_game_n           : 0,
    //   play_game_step        : 0,
    //   play_game_bet_value   : 0,
    //   play_game_bet_money   : 0,
    //   play_game_state       : 0,
    //   play_game_profit      : 0,
    //   date_utc_create       : now,
    //   date_utc_create_int   : now_int,
    //   first_save            : 1,
    // };
    let item_save = mo_play02.getPlayEmpty();
    item_save.game_id             = cur_play_game_id;
    item_save.result_win          = cur_result_win;
    item_save.sum_play            = last_sum_play;
    item_save.date_utc_create     = now;
    item_save.date_utc_create_int = now_int;
    item_save.first_save          = 1;

    await Bacarat7play137_model.insertOrUpdate(case_save, item_save);
    await Botinfo_model.setLastGameId(bot_id_run, cur_play_game_id);
    /////////////////////////////////////////////
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
