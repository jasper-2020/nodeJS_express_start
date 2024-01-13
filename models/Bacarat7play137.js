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

//result_win 0=nodata, 1=player, 2=banker, 3=tie
//play_game_result 0=nodata, 1=win, 2=lose, 3=tie
let Bacarat7play137Schema = new Schema(
  {
    game_id: {
      type: Number,
    },
    result_win: {
      type: Number,//0=nodata, 1=player, 2=banker, 3=tie
    },
    play_game_profit: {
      type: Number,
    },
    sum_play: {
      type: Number,
    },
    play_game_result: {
      type: Number,//0=nodata, 1=win, 2=lose, 3=tie
    },

    play_game_n: {
      type: Number,//0=nodata, 1, 2, 3
    },
    play_game_step: {
      type: Number,//0=nodata, 1, 2, 3
    },
    play_game_bet_value: {
      type: Number,//0=nodata, 1=player, 2=banker, 3=tie
    },
    play_game_bet_money: {
      type: Number,
    },
    play_game_state: {
      type: Number,
    },
    date_utc_create: {
      type: Date,
    },
    date_utc_create_int: {
      type: Number,
    },
    first_save: {
      type: Number,
    },
  },
  { 
    collection: process.env['MONGO_DB_BCGAME_COLLECTION_FOR_BACARAT_PLAY137'],
    versionKey: false,
    statics: {
      getInfo(game_id) {
        return this.findOne({ 'game_id': game_id});
      },

      getLastInfo() {
        return this.findOne().sort({'game_id':-1}).limit(1);
      },

      insertOrUpdate(case_save, data_save){
        let optx = {
          new: true,
          upsert: true
        };
        return this.findOneAndUpdate(case_save, data_save, optx);
      },
      setPlayGameResult(gameid, play_result) {
        // ///////////////
        // let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
        // let now_long = Date.now();//milliseconds 13 digit longint
        // let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
        // ///////////////
        return this.updateOne(
          { 
            game_id: gameid
          },
          {
            play_game_result: play_result
          }
        );
      },

      // check_result_win(game_id) {
      //   return this.findOne({ 'game_id': game_id});
      // },

      // setLastGameId(botid, save_gameid) {
      //   let temp_date = new Date();
      //   let temp_date_int = Math.floor(Number(temp_date)/1000);
      //   return this.updateOne(
      //     { 
      //       bot_id: botid
      //     },
      //     {
      //       last_game_id: save_gameid,
      //       date_utc_lastupdate: temp_date,
      //       date_utc_lastupdate_int: temp_date_int
      //     }
      //   );
      // }
    }
  }
);

let Bacarat7play137 = conn.model("bacarat7result", Bacarat7play137Schema);

module.exports = Bacarat7play137;