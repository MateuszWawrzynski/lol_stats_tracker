
const options = {
	name: "DraKoN10",
	refreshTime: 1000,
	saveHistory: true
}


process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
const axios = require('axios')
const fs = require('fs')


const getPlayerStats = async () => {
	return await axios.get(`https://127.0.0.1:2999/liveclientdata/playerscores?summonerName=${options.name}`)
}

const getGameStats = async () => {
	return await axios.get(`https://127.0.0.1:2999/liveclientdata/gamestats`)
}


let history = [];
const historyRender = () => {
	history.forEach(h => {
		console.log(`>> ${h.minute}:00 - ${h.cs}CS (${h.csRatio}) - ${h.kills}/${h.deaths}/${h.assists} (${h.kda} K/D/A)`)
	})
}


const countScore = async () => {
	console.clear();
	
	try {
		//	get data
		const p_stats = await getPlayerStats()
		const g_stats = await getGameStats()

		//	calculate time
		let time = Math.floor(g_stats.data.gameTime)
		let timemath = (time / 60);
		let minute = Math.floor(timemath);
		let second = Math.floor(time % 60);
		second = second < 10 ? `0${second}` : second;

		//	gamemode name
		let gamemode = g_stats.data.gameMode
		
		//	calculate player stats
		let cs = p_stats.data.creepScore
		let csRatio = (cs / timemath).toFixed(1);
		let kills = p_stats.data.kills
		let deaths = p_stats.data.deaths
		let assists = p_stats.data.assists
		let kda = deaths > 0 ? ((kills + assists) / deaths).toFixed(1) : (`Perfect`)
		

		//	render data
		console.log(`${gamemode} - ${minute}:${second}`)
		console.log(`${cs} CS (${csRatio})`)
		console.log(`${kda} K/D/A`)
		console.log(" ")
		historyRender();


		//	save history every minute
		if(second == 0){
			history.push({ minute, kills, deaths, assists, kda, cs, csRatio });
		}

		//	delete history when match starts
		if(minute == 0) history = [];
	}
	catch(error){
		if(options.saveHistory && history.length > 0){
			//	match ended - save history to file
			let filename = `${new Date().toLocaleDateString()}-${new Date().getHours()}-${new Date().getMinutes()}.json`;
			fs.writeFile(`history/${filename}`, JSON.stringify(history), (err) => {
				if(err) console.log(err)
				else {
					console.log(`Historia ostatniego meczu została zapisana do pliku ${filename}`);
					history = [];
				}
			})
		}
		else {
			console.log('Obecnie nie znajdujesz się w trakcie meczu.')
		}
	}
}

//	execute the script every second
setInterval(countScore, options.refreshTime);
