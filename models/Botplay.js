const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var conn = mongoose.createConnection(
  process.env['MONGO_DB_BCGAME_URI'],
  {
    dbName: process.env['MONGO_DB_BCGAME_DATABASE_NAME'],
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

let BotplaySchema = new Schema(
  {
    botplay_id: {
      type: String,
    },
    botplay_status: {
      type: Number, // 0 = disable
      // 10= wait start, 11= start ok
      // 20= wait stop, 21= stop ok
      default: 0,
    },
    botplay_off: {
      type: Number,
      default: 0,
    },
    botplay_run: {
      type: Number,
      default: 0,
    },
    botplay_money: {
      type: Number,
      default: 0,
    },
    botplay_money_coin: {
      type: Number,
      default: 1,
    },

    botplay_cur_start: {
      type: Number,
      default: 0,
    },
    botplay_cur_stop: {
      type: Number,
      default: 0,
    },
    botplay_profit: {
      type: Number,
      default: 0,
    },
    ////////////////////
    ifstart_01_point_below: {
      type: Number,
      default: 0,
    },
    ifstart_02_gmlose: {
      type: Number,
      default: 0,
    },

    //////////
    ifstart_01_vcount: {
      type: Number,
      default: 0,
    },

    ifstart_02_vcount: {
      type: Number,
      default: 0,
    },
    //////////
    ifstart_01_status: {
      type: Number,
      default: 0,
    },
    ifstart_02_status: {
      type: Number,
      default: 0,
    },
    ////////////////////
    ////////////////////
    ifstop_01_cutlose_max: {
      type: Number,
      default: 0,
    },
    ifstop_02_profit_hight2low: {
      type: Number,
      default: 0,
    },
    ifstop_03_profit_min: {
      type: Number,
      default: 0,
    },
    ifstop_01_vcount: {
      type: Number,
      default: 0,
    },
    ifstop_02_vcount: {
      type: Number,
      default: 0,
    },
    ifstop_03_vcount: {
      type: Number,
      default: 0,
    },
    //////////
    ifstop_01_status: {
      type: Number,
      default: 0,
    },
    ifstop_02_status: {
      type: Number,
      default: 0,
    },
    ifstop_03_status: {
      type: Number,
      default: 0,
    },
    ////////////////////
    last_command: {
      type: Number,
      default: 0,
    },
    last_game_id: {
      type: Number,
      default: 0,
    },

    ////////////////////
    date_utc_lastupdate: {
      type: Date,
      default: "2022-01-01T00:00:00.000+00:00",
    },
    date_utc_lastupdate_int: {
      type: Number,
      default: 0,
    },

    date_utc_last_start: {
      type: Date,
      default: "2022-01-01T00:00:00.000+00:00",
    },
    date_utc_last_start_int: {
      type: Number,
      default: 0,
    },

    date_utc_last_stop: {
      type: Date,
      default: "2022-01-01T00:00:00.000+00:00",
    },
    date_utc_last_stop_int: {
      type: Number,
      default: 0,
    },
    ////////////////////
  },
  {
    collection: process.env['MONGO_DB_BCGAME_COLLECTION_FOR_BOTPLAY'],
    versionKey: false,
    statics: {
      getInfo(botid) {
        return this.findOne({ botplay_id: botid});
      },
      inital_reset(botid){
        let optx = {
          new: true,
          upsert: true
        };

        let case_save = {botplay_id:botid}
        let data_save = {
          botplay_id          : botid,
          botplay_status      : 0,
          botplay_off         : 0,
          botplay_run         : 0,

          botplay_money       : 0,
          botplay_money_coin  : 0,

          botplay_cur_start   : 0,
          botplay_cur_stop    : 0,

          botplay_profit   : 0,

          ifstart_01_point_below  : 0,
          ifstart_01_status       : 0,
          ifstart_01_vcount       : 0,

          ifstart_02_game_lose  : 0,
          ifstart_02_status     : 0,
          ifstart_02_vcount     : 0,

          ifstop_01_cutlose_max : 0,
          ifstop_01_status      : 0,
          ifstop_01_vcount      : 0,

          ifstop_02_profit_hight2low  : 0,
          ifstop_02_status            : 0,
          ifstop_02_vcount            : 0,

          ifstop_03_profit_min  : 0,
          ifstop_03_status      : 0,
          ifstop_03_vcount      : 0,

          last_command   : 0,
          last_game_id   : 0,

          date_utc_lastupdate   : "2022-01-01T00:00:00.000+00:00",
          date_utc_lastupdate_int   : 0,

          date_utc_last_start   : "2022-01-01T00:00:00.000+00:00",
          date_utc_last_start_int   : 0,

          date_utc_last_stop   : "2022-01-01T00:00:00.000+00:00",
          date_utc_last_stop_int   : 0,

        }
        return this.findOneAndUpdate(case_save, data_save, optx);
      },
      insertOrUpdate(case_save, data_save){
        let optx = {
          new: true,
          upsert: true
        };
        return this.findOneAndUpdate(case_save, data_save, optx);
      },
      // setLastGameId(botid, save_gameid) {
      //   ///////////////
      //   let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
      //   let now_long = Date.now();//milliseconds 13 digit longint
      //   let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
      //   ///////////////
      //   return this.updateOne(
      //     { 
      //       botplay_id: botid
      //     },
      //     {
      //       last_game_id: save_gameid,
      //       date_utc_lastupdate: now,
      //       date_utc_lastupdate_int: now_int
      //     }
      //   );
      // },
      // setbotplay_inprocess(botid, save_gameid) {
      //   ///////////////
      //   let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
      //   let now_long = Date.now();//milliseconds 13 digit longint
      //   let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
      //   ///////////////
      //   return this.updateOne(
      //     { 
      //       botplay_id: botid
      //     },
      //     {
      //       botplay_process: 1,
      //       date_utc_lastupdate: now,
      //       date_utc_lastupdate_int: now_int
      //     }
      //   );
      // },
      // setbotplay_endprocess(botid, save_gameid) {
      //   ///////////////
      //   let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
      //   let now_long = Date.now();//milliseconds 13 digit longint
      //   let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
      //   ///////////////
      //   return this.updateOne(
      //     { 
      //       botplay_id: botid
      //     },
      //     {
      //       botplay_process: 0,
      //       date_utc_lastupdate: now,
      //       date_utc_lastupdate_int: now_int
      //     }
      //   );
      // },
      // setbotplay_lastupdate(botid, save_gameid) {
      //   ///////////////
      //   let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
      //   let now_long = Date.now();//milliseconds 13 digit longint
      //   let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
      //   ///////////////
      //   return this.updateOne(
      //     { 
      //       botplay_id: botid
      //     },
      //     {
      //       date_utc_lastupdate: now,
      //       date_utc_lastupdate_int: now_int
      //     }
      //   );
      // }
    }
  },
  // {
  //   statics: {
  //     getInfo(botid) {
  //       return this.findOne({ botplay_id: botid});
  //     }
  //   }
  // }
);

let Botplay = conn.model("botplay", BotplaySchema);

module.exports = Botplay;