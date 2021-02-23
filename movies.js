firebase.auth().onAuthStateChanged(async function(user) {
    let db = firebase.firestore()
    let response = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=62f31346c7faf343b527c79992e28f65&language=en-US`)
    let json = await response.json()
    let movies = json.results
    console.log(movies)
    
    if(user) {
        console.log('signed in')

        // let moviesList = movies.results
        // console.log(moviesList.length)    

        // let fetchMovies = await db.collection('watched_movies').get()
        // let watched_movies = fetchMovies.docs
        // console.log(watched_movies)

        await db.collection('users').doc(user.uid).set({
            name: user.displayName,
            email: user.email
        })

        document.querySelector('.sign-in-or-sign-out').innerHTML = `
        <div class="text-white">Signed in as ${user.displayName}</div>
        <button class="text-pink-500 underline sign-out">Sign Out</button>
        `

        document.querySelector('.sign-out').addEventListener('click',function(event) {
            console.log('sign out clicked')
            firebase.auth().signOut()
            document.location.href = 'movies.html' 
        })

        for (let i=0; i<movies.length; i++) {
            let movie = movies[i]
            let docRef = await db.collection('watched_movies').doc(`${movie.id}_${user.uid}`).get()
            let watchedMovie = docRef.data()
            let opacityClass = ''
            if (watchedMovie) {
                console.log(`${movies[i].original_title} has been watched.`)
                opacityClass = 'opacity-20'
            }
        
            document.querySelector('.movies').insertAdjacentHTML('beforeend', `
                <div class="w-1/5 p-4 movie-${movie.id} ${opacityClass}">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="w-full">
                <a href="#" class="watched-button block text-center text-white bg-green-500 mt-4 px-4 py-2 rounded">I've watched this!</a>
                </div>
            `)
        
            document.querySelector(`.movie-${movie.id}`).addEventListener('click', async function(event) {
                event.preventDefault()

                let movieElement = document.querySelector(`.movie-${movie.id}`)
                movieElement.classList.add('opacity-20')
                await db.collection('watched_movies').doc(`${movie.id}_${user.uid}`).set({
                    movieId: movie.id,
                    userId: user.uid,
                    userEmail: user.email,
                    movieTitle: movies[i].original_title
                })
                console.log(`${movies[i].original_title} was watched.`)


                // await db.collection('watched_movies').doc(`${movie.id}`).set({})
            }) 
        }
    } else {
        console.log('signed out')
        
        document.querySelector('.movies').classList.add('hidden')

        let ui = new firebaseui.auth.AuthUI(firebase.auth())
        
        let authUIConfig = {
            signInOptions: [
              firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            signInSuccessUrl: 'movies.html'
          }

          ui.start('.sign-in-or-sign-out', authUIConfig)
    }
})