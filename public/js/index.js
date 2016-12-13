$(document).ready(function(){

  $('.genreResult').first().hide()
  $('.movieRow').first().hide()
  var movieData = {movies:[]} 

  loadDataFromLocalStorage();
  fillMyMovieTable(movieData)

  $('#submitsearch').on("click", function() {
    var toDeleteCount = $('.genreResult').length
    console.log(toDeleteCount)
    for(var i = 1; i < toDeleteCount; i++){
      console.log(i);
      $('.genreResult')[1].remove();
    }
    //obtain movie title from form
    var title = $('#find').val();
    // create searchURL w query info
    var searchURL = "https://api.themoviedb.org/3/search/movie?query="+title+"&language=en-US&api_key=7b9a9e7e542ce68170047140f18db864";
    // send request to API
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": searchURL,
      "method": "GET",
      "processData": false,
      "data": "{}"
    }

    // get the movie id from the search input
    $.ajax(settings).done(function (response) {
      var movie = response.results[0]
      if(movieData.movies.indexOf(movie.title) == -1){
        movieData.movies.push(response.results[0].title)
      }
      addMovie(response.results[0].title);
      saveDataToLocalStorage();
      getMovieDetails(movie.id)
    });
  });
  
    // get list of genres 
    function getMovieDetails(movie_id){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.themoviedb.org/3/movie/" + movie_id + "?language=en-US&api_key=7b9a9e7e542ce68170047140f18db864",
        "method": "GET",
        "headers": {},
        "data": "{}"
      }
      $.ajax(settings).done(function (response) {
        $('#movieTitle').text("Showing results for " + response.title)
        for(var i = 0; i < response.genres.length; i++){
          getMoviesForGenre(response.genres[i].name, response.genres[i].id, response.vote_average)
        }
      });
    }

    // get rank for specific movie in specific genre
    function getMoviesForGenre(genreName, genreId, avg_rating){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.themoviedb.org/3/discover/movie?with_original_language=en&with_genres=" + genreId + "&vote_average.gte=" + avg_rating + "&vote_count.gte=100&include_video=false&include_adult=false&sort_by=vote_average.desc&region=US&language=en-US&api_key=7b9a9e7e542ce68170047140f18db864",
        "method": "GET",
        "headers": {},
        "data": "{}"
      }
      console.log("this is the avg rating i am comparing: " + avg_rating + " for genre " + genreName)
      $.ajax(settings).done(function (response) {
        var rank = response.total_results
        generateGenreSection(genreName, rank, response);
      });

    }

    // generate the section including rank and top movies in that genre 
    function generateGenreSection(genre_name, rank, response){
      console.log(genre_name, rank, response)
      $('.genreResult').first().show()
      $('.genreResult').last().clone().appendTo('.result')
      $('.genreResult').first().hide()
      $('.genreTitle').last().text((genre_name).toUpperCase())
      $('.genreRank').last().text("#"+rank)
      $('.header').last().text("Top Movies for " + genre_name)
      for(var i = 0; i < 3; i++){
        var posterPath = response.results[i].poster_path
        var title = response.results[i].title
        var imgsrc = "https://image.tmdb.org/t/p/w300" + posterPath
        var titleclass = "div."+i
        $(titleclass).last().text(title)
        $(titleclass).last().prepend('<img src=' + imgsrc + ' class="movieImg">')
      }
    }

  $('.deleteButton').on('click', function(){
    var movie = $(this).parent().parent().children().first().children().text()
    movieData.movies.splice(movieData.movies.indexOf(movie), 1);
    deleteMovie(movie);
    saveDataToLocalStorage();
    window.location.reload();
  });

  $('.rateButton').on('click', function(){
    var movie = $(this).parent().parent().children().first().children().text()
    var rating = $(this).parent().children().first().val()
    updateMovie(movie, rating);
  })

  function saveDataToLocalStorage() {
    // Turn countData into a JSON string, and store it to localStorage
    localStorage.movieData = JSON.stringify(movieData);
  }

  function loadDataFromLocalStorage() {
    // If movieData has been stored to localStorage
    if (localStorage.movieData
        && JSON.parse(localStorage.movieData)) {
          // retrieve and parse the JSON
          movieData = JSON.parse(localStorage.movieData);
    }
  }

  // If a new version of the app is available, then update the cached version
  window.applicationCache.addEventListener('updateready',function(){
    window.applicationCache.swapCache();
    location.reload();
  });

});

// get data from local storage and populate table
function fillMyMovieTable(movieData){
  $('.movieRow').first().show();
  for(var i = 0; i < movieData.movies.length; i++){
    $('.movieRow').first().clone().appendTo('#movieTable')
    $('.movieTitle').last().text(movieData.movies[i])
  }
  $('.movieRow').first().hide();
  
}

/********** CRUD Functionality -> Mongo updateMany ***********************************/

// PUT 
function addMovie(title){
  $.ajax({
      url: './db/movies',
      type: 'PUT',
      data: {title: title, rating: 0},
      success: function(result) {
        console.log("successfully added movie to collection")
      }
    });
    event.preventDefault();
}

//GET
function getMovies(){
  $.ajax({
      url: './db/movies',
      type: 'GET',
      success: function(result) {
        console.log('successfully retrieved all movies')
      }
    });
    event.preventDefault();
}

//UPDATE
function updateMovie(movie, rating){
  $.ajax({
      url: './db/movies',
      type: 'POST',
      data: 'filter={"title": { $eq: "'+ movie +'" }}&update={"$set":{"rating":'+rating+'}}',
      success: function(result) {
        console.log("Updated Movie collection");
      }
    });
    event.preventDefault();
}

//DELETE
function deleteMovie(title){
  $.ajax({
      url: './db/movies',
      type: 'DELETE',
      data: { title: title },
      success:function(result){
        console.log("Successfully deleted movie");
      }
    });
    event.preventDefault();
}
