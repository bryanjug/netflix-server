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

function GetDataAndUpdate () {
    axios.get(`${movieDB}movie/latest?api_key=${key}`)
    .then(function (response) {
      // handle success
      console.log("Successfully requested latest movie data.");
      data.new.movies = response.data;

      axios.get(`${movieDB}tv/latest?api_key=${key}`)
      .then(function (response) {
        // handle success
        console.log("Successfully requested latest TV Show data.");
        data.new.TVShows = response.data;

        axios.get(`${movieDB}movie/popular?api_key=${key}`)
        .then(function (response) {
          // handle success
          console.log("Successfully requested popular movie data.");
          data.popularMovies = response.data;

          axios.get(`${movieDB}tv/popular?api_key=${key}`)
          .then(function (response) {
            // handle success
            console.log("Successfully requested popular TV Show data.");
            data.popularTVShows = response.data;

            axios.get(`${movieDB}trending/movie/week?api_key=${key}`)
            .then(function (response) {
              // handle success
              console.log("Successfully requested trending movie data.");
              data.trendingMovies = response.data;

              axios.get(`${movieDB}genre/movie/list?api_key=${key}`)
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
            })
            .catch(function (error) {
              // handle error
              console.log(error);
            })
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
      })
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

  UpdatePopularMovie()
}

async function UpdatePopularMovie() {
  let top = data.popularMovies.results[0];
  console.log(top)

  await axios.get(`${movieDB}movie/${top.id}?api_key=${key}&append_to_response=videos`)
    .then(function (response) {
      // handle success
      console.log(`Successfully requested top popular movie id: ${top.id} data.`);
      let results = response.data;
      let newObj = {...top, results}

      data.popularMovies.results[0] = newObj
      console.log("Updated top popular movie: ", data.popularMovies.results[0])
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })  

  UpdateDB();
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
  // GetDataAndUpdate() 
}

SetTimer();

console.log("Server is working")

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})