const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
let cors = require("cors");
app.use(cors());

const key = process.env.API_TOKEN;
const movieDB = process.env.MOVIE_DB;

app.use(bodyParser.urlencoded({ limit: "550mb", extended: true, parameterLimit: 550000 }))

const PORT = 3001;

const routes = require('./routes/routes.js')(app, fs);

let data = {
  "new": {
    "movies": {

    },
    "TVShows": {

    }
  },
  "popularMovies": {

  },
  "popularTVShows": {

  },
  "trendingMovies": {

  },
  "genres": {

  }
};

async function GetDataAndUpdate () {
    await axios.get(`${movieDB}trending/movie/week?api_key=${key}`)
      .then(function (response) {
        // handle success
        console.log("Successfully requested trending movie data.");
        data.trendingMovies = response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })

    await axios.get(`${movieDB}genre/movie/list?api_key=${key}`)
      .then(function (response) {
        // handle success
        console.log("Successfully requested genre list data.");
        data.genres = response.data;
        
        GetGenreDataAndUpdate();
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
}

async function GetGenreDataAndUpdate() {
  let genres = data.genres.genres
  let length = genres.length;
  let newGenreData = {};

  for (i = 0; i < length; i++) {
    let oldObj = {id: genres[i].id, name: genres[i].name};

    await axios.get(`${movieDB}discover/movie?api_key=${key}&with_genres=${genres[i].id}`)
    .then(function (response) {
      // handle success
      console.log(`Successfully requested ${genres[i].id} genre data.`);
      let results = response.data.results
      oldObj = {...oldObj, results}
      newGenreData[i] = oldObj
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })  
  }
  data.genres = newGenreData;

  UpdatePopular()
}

async function UpdatePopularMovie() {
  let top = data.popularMovies.results[0];

  await axios.get(`${movieDB}movie/${top.id}?api_key=${key}&append_to_response=videos`)
    .then(function (response) {
      // handle success
      console.log(`Successfully requested top popular movie id: ${top.id} data.`);
      let results = response.data;
      let newObj = {...top, results}

      data.popularMovies.results[0] = newObj
      console.log("Updated top popular movie: ", data.popularMovies.results[0].id)
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })  

    UpdateDB();
}

async function UpdatePopular() {
  let TVShows = data.popularTVShows;
  let movies = data.popularMovies.results;
  //Movies
  await axios.get(`${movieDB}movie/popular?api_key=${key}`)
    .then(function (response) {
      // handle success
      console.log("Successfully requested popular movie data.");
      data.popularMovies = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })

  await axios.get(`${movieDB}movie/popular?api_key=${key}&page=2`)
    .then(function (response) {
      data.popularMovies2 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })  

  await axios.get(`${movieDB}movie/popular?api_key=${key}&page=3`)
    .then(function (response) {
      data.popularMovies3 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })  

  await axios.get(`${movieDB}movie/popular?api_key=${key}&page=4`)
    .then(function (response) {
      data.popularMovies4 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })  

  await axios.get(`${movieDB}movie/popular?api_key=${key}&page=5`)
    .then(function (response) {
      data.popularMovies5 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })  

  await axios.get(`${movieDB}movie/popular?api_key=${key}&page=6`)
    .then(function (response) {
      data.popularMovies6 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })  
  await axios.get(`${movieDB}movie/popular?api_key=${key}&page=7`)
    .then(function (response) {
      data.popularMovies7 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })  
  await axios.get(`${movieDB}movie/popular?api_key=${key}&page=8`)
    .then(function (response) {
      data.popularMovies8 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })  
  await axios.get(`${movieDB}movie/popular?api_key=${key}&page=9`)
    .then(function (response) {
      data.popularMovies9 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })  

  await axios.get(`${movieDB}movie/popular?api_key=${key}&page=10`)
    .then(function (response) {
      data.popularMovies10 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })  

  //TV Shows
  await axios.get(`${movieDB}tv/popular?api_key=${key}&page=1`)
    .then(function (response) {
      // handle success
      data.popularTVShows = response.data;
    })

    .catch(function (error) {
      // handle error
      console.log(error);
    })

  await axios.get(`${movieDB}tv/popular?api_key=${key}&page=2`)
    .then(function (response) {
      // handle success
      data.popularTVShows2 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })

  await axios.get(`${movieDB}tv/popular?api_key=${key}&page=3`)
    .then(function (response) {
      data.popularTVShows3 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })

  await axios.get(`${movieDB}tv/popular?api_key=${key}&page=4`)
    .then(function (response) {
      data.popularTVShows4 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })

  await axios.get(`${movieDB}tv/popular?api_key=${key}&page=5`)
    .then(function (response) {
      data.popularTVShows5 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })

  await axios.get(`${movieDB}tv/popular?api_key=${key}&page=6`)
    .then(function (response) {
      data.popularTVShows6 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })

  await axios.get(`${movieDB}tv/popular?api_key=${key}&page=7`)
    .then(function (response) {
      data.popularTVShows7 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })

  await axios.get(`${movieDB}tv/popular?api_key=${key}&page=8`)
    .then(function (response) {
      data.popularTVShows8 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })

  await axios.get(`${movieDB}tv/popular?api_key=${key}&page=9`)
    .then(function (response) {
      data.popularTVShows9 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
  
  await axios.get(`${movieDB}tv/popular?api_key=${key}&page=10`)
    .then(function (response) {
      data.popularTVShows10 = response.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })

  UpdatePopularMovie()
}

async function UpdateDB() {
  fs.writeFile('./data/db.json', JSON.stringify(data), 'utf8',  (err) => {         
    if (err) throw err
    console.log("Updated...")     
  });
}

async function SetTimer() {
  setInterval(GetDataAndUpdate, 36000000);
  //for debugging
  //GetDataAndUpdate() 
}

SetTimer();

console.log("Server is working")

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})