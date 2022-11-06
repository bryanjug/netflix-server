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

app.use(bodyParser.urlencoded({ limit: "5550mb", extended: true, parameterLimit: 5550000 }))

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
    await GetGenres();
    await UpdateDB();
}

async function UpdatePopular() {
  //Movies
  for (i = 1; i < 11; i++) {
    let dataName;
    await axios.get(`${movieDB}movie/popular?api_key=${key}&page=${i}`)
      .then(function (response) {
        // handle success
        if (i === 1) {
          dataName = "popularMovies";
        } else {
          dataName = "popularMovies" + i;
        }
        data[`${dataName}`] = response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
  }
  //TV Shows
  for (i = 1; i < 11; i++) {
    let dataName;
    await axios.get(`${movieDB}tv/popular?api_key=${key}&page=${i}`)
      .then(function (response) {
        // handle success
        if (i === 1) {
          dataName = "popularTVShows";
        } else {
          dataName = "popularTVShows" + i;
        }
        data[`${dataName}`] = response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
  }

  UpdatePopularMovie()
}

async function GetGenres () {
    await axios.get(`${movieDB}genre/movie/list?api_key=${key}&language=en-US`)
        .then(function (response) {
            let firstVideoIDs = data.popularMovies.results[0].genre_ids;
            CompareGenres(response.data, firstVideoIDs)
        })
}
//adds genres text to first popular movie
async function CompareGenres(genres, firstVideoIDs) {
    genres = genres.genres;
    let string = "";

    for (let i = 0; i < firstVideoIDs.length; i++) {
        for (let j = 0; j < Object.keys(genres).length; j++) {
            if (i === firstVideoIDs.length - 1 && firstVideoIDs[i] === genres[j].id) {
                string += genres[j].name;
            } else if (firstVideoIDs[i] === genres[j].id) {
                string += genres[j].name + " • ";
            }
        }
    }
    data.popularMovies.results[0].genres = string;
    
    console.log(data.popularMovies.results[0].genres)
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