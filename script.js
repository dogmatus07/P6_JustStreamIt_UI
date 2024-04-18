function loadMovies() {
    fetch('http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page_size=25')
        .then(response => {
            if (!response.ok) {
                throw new Error('Response network problem')
            }
            return response.json()
        })

        .then(data => {
            console.log("Nombre de films récupérés", data.results.length);
            displayBestMovieIMDB(data.results);
            displayMostRatedMovie(data.results);
            displayBestFamilyMovies(data.results);
            displayBestCrimeMovies(data.results);
        })

        .catch(error => {
            console.error('Error with fetch operation')
        });
}

let bestMovieDetails = {}

// display best movie with best imdb score
function displayBestMovieIMDB(movies) {
    //sort movies by imdb score
    console.log("Nombre de films pour le top movie", movies.length);
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
    console.log("Films chargés pour 'Les mieux notés':", movies.length);
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
                throw new Error('Response error from fetch action movies')
            }
            return response.json();
        })
        .then(data => {
            const bestFamilyMovies = data.results.slice(0, 6);
            const familyMoviesContainer = document.getElementById('best-family-movies');
            addMoviesToContainer(bestFamilyMovies, familyMoviesContainer);
        })
        .catch(error => {
            console.error('Error during fetch action movies');
        });
}

// display best category 2 movies Crime
function displayBestCrimeMovies(movies) {
    const url = 'http://localhost:8000/api/v1/titles/?genre=Crime&sort_by=-imdb_score&page_size=6'
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Response error from fetch action movies')
            }
            return response.json();
        })
        .then(data => {
            const bestCrimeMovies = data.results.slice(0, 6);
            const crimeMoviesContainer = document.getElementById('best-crime-movies');
            addMoviesToContainer(bestCrimeMovies, crimeMoviesContainer);
        })
        .catch(error => {
            console.error('Error during fetch action movies');
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
        let colClass = 'col-12 col-md-6 col-lg-4';
        if (index >= 2) colClass += ' d-none d-sm-block'; //hide on mobile 3rd movie and plus
        if (index >= 4) colClass += ' d-none d-lg-block'; //hide on tablet 5th and 6th movie

        movieElement.className = colClass;
        movieElement.innerHTML = `
            <div class="movie-image-container">
                <img src="${movie.image_url}" class="img-fluid mb-3" alt="${movie.title}" width="252px" height="auto">
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

//call to function
document.addEventListener('DOMContentLoaded', function () {
    loadMovies();

    document.getElementById('genre-list').value = "Action";
    getMoviesByGenre("Action");

    document.getElementById('genre-list').addEventListener('change', function () {
        getMoviesByGenre(this.value);
    });

    document.addEventListener('click', function(e) {
        if(e.target.classList.contains('details-link')) {
            const movieId = e.target.getAttribute('data-id');
            showDetails(movieId);
        }
    });
});

//details button
document.querySelectorAll('.top-movie-details').forEach(button => {
    button.addEventListener('click', function () {
        if (Object.keys(bestMovieDetails).length) {
            fillModalWithMovieDetails(bestMovieDetails);
        }
    });
});

function fillModalWithMovieDetails(movieDetails) {
    const modalTitle = document.querySelector('#movieDetailsModalLabel');
    const modalBody = document.querySelector('.modal-body');

    // fill with data now
    modalTitle.textContent = movieDetails.title;
    modalBody.innerHTML = `
        <p> <strong>${movieDetails.year} - ${movieDetails.genres.join(', ')}</strong></p>
        <p> <strong>PG - ${movieDetails.rated} - ${movieDetails.duration} minutes (${movieDetails.countries})</strong></p>
        <p> <strong>IMDB score: ${movieDetails.imdb_score}/10</strong></p>

        <p> Réalisé par :</p>
        <p>${movieDetails.directors.join(', ')}</p>
        <p>${movieDetails.long_description}</p>

        <img src=${movieDetails.image_url}>
        <p> Avec :</p>
        <p>${movieDetails.actors.join(', ')}</p>
    `;

    // display the modal
    var myModal = new bootstrap.Modal(document.getElementById('movieDetailsModal'), {
        keyboard: false
    });
    myModal.show();
}
