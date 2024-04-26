document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    loadInitialData();
    setupToggleButtons();
});

function setupEventListeners() {
    document.getElementById('genre-list').addEventListener('change', function () {
        getMoviesByGenre(this.value);
    });

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('details-link')) {
            const movieId = e.target.getAttribute('data-id');
            showDetails(movieId);
        }
    });

    window.addEventListener('resize', function() {
    });
}

function loadInitialData() {
    loadMovies().then(() => {
        document.getElementById('genre-list').value = "Action";
        return getMoviesByGenre("Action");
    }).catch(error => console.error('Failed to load initial data:', error));    
}

async function loadMovies() {
    const urlBase = 'http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page_size=25'
    try {
        const response = await fetch(urlBase);
        if (!response.ok) {
            throw new Error('Response network problem');
        }
        const data = await response.json();
        displayBestMovieIMDB(data.results);
        displayMostRatedMovie(data.results);
        displayBestFamilyMovies(data.results);
        displayBestCrimeMovies(data.results);
        return await Promise.resolve();
    } catch (error) {
        console.error('Error with fetch operation');
        return await Promise.reject();
    }
}

let bestMovieDetails = {}

// display best movie with best imdb score
function displayBestMovieIMDB(movies) {
    //sort movies by imdb score
    const sortedMovie = movies.sort((a, b) => b.imdb_score - a.imdb_score);
    const bestMovie = sortedMovie[0];

    //access the description details
    fetch(bestMovie.url)
        .then(response => response.json())
        .then(details => {
            //display best movie
            const topMovieElement = document.querySelector('.top-movie-block');
            topMovieElement.querySelector('img').src = details.image_url;
            topMovieElement.querySelector('.top-movie-title').textContent = details.title;
            topMovieElement.querySelector('.top-movie-description').textContent = details.description;
            bestMovieDetails = details;
        })
        .catch(error => console.error('Problem with the fetch operation', error));
}

//display most rated movie
function displayMostRatedMovie(movies) {
    const bestMovies = movies.slice(1, 7);
    const moviesContainer = document.getElementById('best-rated-movies');
    addMoviesToContainer(bestMovies, moviesContainer);
}

// Display best category 1 movies Family
function displayBestFamilyMovies(movies) {
    const url = 'http://localhost:8000/api/v1/titles/?genre=Family&sort_by=-imdb_score&page_size=6'
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Response error from fetch movies')
            }
            return response.json();
        })
        .then(data => {
            const bestFamilyMovies = data.results.slice(0, 6);
            const familyMoviesContainer = document.getElementById('best-family-movies');
            addMoviesToContainer(bestFamilyMovies, familyMoviesContainer);
        })
        .catch(error => {
            console.error('Error during fetch movies');
        });
}

// display best category 2 movies Crime
function displayBestCrimeMovies(movies) {
    const url = 'http://localhost:8000/api/v1/titles/?genre=Crime&sort_by=-imdb_score&page_size=6'
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Response error from fetch movies')
            }
            return response.json();
        })
        .then(data => {
            const bestCrimeMovies = data.results.slice(0, 6);
            const crimeMoviesContainer = document.getElementById('best-crime-movies');
            addMoviesToContainer(bestCrimeMovies, crimeMoviesContainer);
        })
        .catch(error => {
            console.error('Error during fetch movies');
        });
}

// display best movies by user choice genre
function getMoviesByGenre(genre) {
    const url = `http://localhost:8000/api/v1/titles/?genre=${genre}&sort_by=-imdb_score&page_size=6`
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network error response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const moviesByGenreContainer = document.getElementById('best-form-movies');
            addMoviesToContainer(data.results, moviesByGenreContainer);
        })
        .catch(error => {
            console.error('Error during fetch of genre movies', error);
        });
}

function addMoviesToContainer(movies, container) {
    container.innerHTML = '';
    movies.forEach((movie, index) => {
        const movieElement = document.createElement('div');
        movieElement.className = 'col-12 col-md-6 col-lg-4 movie-item';
        movieElement.innerHTML = `
            <div class="movie-image-container">
                <img src="${movie.image_url}" class="img-fluid mb-3" alt="${movie.title}">
                <div class="overlay">
                    <div class="text">
                    ${movie.title}<br><a href="#" class="details-link" data-id="${movie.id}">Details</a>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(movieElement)
    });
}

function toggleMovies(container, button) {
    const isShowingAll = container.classList.contains('show-all');
    if (isShowingAll) {
        container.classList.remove('show-all');
        button.textContent = 'Voir plus';
    } else {
        container.classList.add('show-all');
        button.textContent = 'Voir moins';
    }
}

function setupToggleButtons() {
    document.querySelectorAll('.toggle-button').forEach(button => {
        button.addEventListener('click', function() {
            const container = document.querySelector(button.getAttribute('data-target'));
            toggleMovies(container, button);
        });
    });
}

// show movie details on click overlay
function showDetails(movieId) {
    console.log("Fetching details for movie ID:", movieId);
    fetch(`http://localhost:8000/api/v1/titles/${movieId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Problem fetching movie details');
            }
            return response.json();
        })
        .then(details => {
            fillModalWithMovieDetails(details);
        })
        .catch(error => {
            console.error('Error fetching details:', error);
        });
}

//details button
document.querySelectorAll('.top-movie-details').forEach(button => {
    button.addEventListener('click', function () {
        if (Object.keys(bestMovieDetails).length) {
            fillModalWithMovieDetails(bestMovieDetails);
        }
    });
});

function fillModalWithMovieDetails(movieDetails) {
    document.querySelector('#modal-movie-title').textContent = `${movieDetails.title}`;
    document.querySelector('#modal-year-genre').textContent = `${movieDetails.year} - ${movieDetails.genres.join(', ')}`;
    document.querySelector('#modal-rating-duration-country').textContent = `PG - ${movieDetails.rated} - ${movieDetails.duration} minutes (${movieDetails.countries.join(', ')})`;
    document.querySelector('#modal-imdb-score').textContent = `IMDB score : ${movieDetails.imdb_score}/10`;
    document.querySelector('#modal-directors').textContent = `${movieDetails.directors.join(', ')}`;
    document.querySelector('#modal-description').textContent = movieDetails.long_description;
    document.querySelector('#modal-actors').textContent = `${movieDetails.actors.join(', ')}`;
    document.querySelector('#modal-image').src = movieDetails.image_url;

    var myModal = new bootstrap.Modal(document.getElementById('movieDetailsModal'), {
        keyboard: false
    });
    myModal.show();

}
