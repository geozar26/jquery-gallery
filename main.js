
$(document).ready(function() {
    let page = 1;
    let currentQuery = ''; 
    let loading = false;
    let showingFavorites = false;
    const myKey = 'hq0aN3BiUOMQ4K6EbyWzHnM2WxSoa3hBHU0v4h_0WNg'; 

    function loadImages(query = '') {
        if (loading || showingFavorites) return;
        loading = true;
        $('#loader').show();

        let url = query 
            ? `https://api.unsplash.com/search/photos?page=${page}&query=${query}&client_id=${myKey}&per_page=12`
            : `https://api.unsplash.com/photos?page=${page}&client_id=${myKey}&per_page=12`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function(response) {
                let photos = query ? response.results : response;
                renderPhotos(photos);
                page++;
                loading = false;
                $('#loader').hide();
            }
        });
    }

    function renderPhotos(photos) {
        // Παίρνουμε τα ήδη σωσμένα από το LocalStorage
        let favorites = JSON.parse(localStorage.getItem('myFavs')) || [];
        
        photos.forEach(photo => {
            const isFav = favorites.includes(photo.urls.small) ? 'active' : '';
            const imgHtml = `
                <div class="photo-item">
                    <img src="${photo.urls.small}" data-full="${photo.urls.regular}" class="gallery-img">
                    <div class="heart-icon ${isFav}" data-url="${photo.urls.small}">❤️</div>
                </div>`;
            $('#gallery-container').append(imgHtml);
        });
    }

    // Κλικ στην Καρδιά (Αποθήκευση/Διαγραφή)
    $('#gallery-container').on('click', '.heart-icon', function(e) {
        e.stopPropagation();
        let imgUrl = $(this).data('url');
        let favorites = JSON.parse(localStorage.getItem('myFavs')) || [];

        if (favorites.includes(imgUrl)) {
            favorites = favorites.filter(url => url !== imgUrl);
            $(this).removeClass('active');
        } else {
            favorites.push(imgUrl);
            $(this).addClass('active');
        }
        localStorage.setItem('myFavs', JSON.stringify(favorites));
    });

    // Προβολή Αγαπημένων
    $('#show-favorites').on('click', function() {
        showingFavorites = true;
        $('#gallery-container').empty();
        $('#loader').hide();
        let favorites = JSON.parse(localStorage.getItem('myFavs')) || [];
        
        if(favorites.length === 0) {
            $('#gallery-container').html('<p style="text-align:center; width:100%;">Δεν έχεις αγαπημένες εικόνες ακόμα!</p>');
        } else {
            // Φτιάχνουμε "ψεύτικα" objects για να χρησιμοποιήσουμε την renderPhotos
            let favObjects = favorites.map(url => ({ urls: { small: url, regular: url } }));
            renderPhotos(favObjects);
        }
    });

    // Αναζήτηση (Reset για να βγούμε από τα Favorites)
    function performSearch() {
        showingFavorites = false;
        currentQuery = $('#search-input').val().trim();
        page = 1;
        $('#gallery-container').empty();
        loadImages(currentQuery);
    }

    $('#search-btn').on('click', performSearch);
    $('#search-input').on('keypress', (e) => { if(e.which == 13) performSearch(); });

    // Scroll Logic
    $(window).on('scroll', function() {
        if ($(window).scrollTop() + $(window).height() >= $(document).height() - 600) {
            loadImages(currentQuery);
        }
    });

    // Lightbox
    $('#gallery-container').on('click', '.gallery-img', function() {
        $('#lightbox-img').attr('src', $(this).data('full'));
        $('#lightbox').fadeIn().css('display', 'flex');
    });
    $('#close-lightbox').on('click', () => $('#lightbox').fadeOut());

    loadImages();
});

