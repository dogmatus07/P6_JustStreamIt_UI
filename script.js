function loadMovies() {
    fetch('http://localhost:8000/api/v1/titles/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Response network problem')
            }
            return response.json()
        })

        .then(data => {
            displayBestMovieIMDB(data.results);
        })

        .catch(error => {
            console.error('Error with fetch operation')
        });
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

//call to function
document.addEventListener('DOMContentLoaded', function () {
    loadMovies();
})

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
        <p> <strong>${movieDetails.year} - ${movieDetails.genres}</strong></p>
        <p> <strong>PG - ${movieDetails.rated} - ${movieDetails.duration} minutes (${movieDetails.countries})</strong></p>
        <p> <strong>IMDB score: ${movieDetails.imdb_score}/10</strong></p>

        <p> Réalisé par:</p>
        <p>${movieDetails.directors}</p>
        <p>${movieDetails.long_description}</p>

        <img src=${movieDetails.image_url}>
        <p> Avec:</p>
        <p>${movieDetails.actors}</p>
    `;

    // display the modal
    var myModal = new bootstrap.Modal(document.getElementById('movieDetailsModal'), {
        keyboard: false
    });
    myModal.show();
}