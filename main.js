$(document).ready(function() {
    let page = 1;
    let currentQuery = ''; 
    let loading = false;
    let showingFavorites = false;
    const myKey = '2OPWvpb-XELm-nttZAdjMe0GTZmapGeszoDPGUzQgw8'; 

    // 1. ΦΟΡΤΩΣΗ ΕΙΚΟΝΩΝ
    function loadImages(query = '') {
        if (loading || showingFavorites) return;
        loading = true;
        $('#loader').show();

        let url = query 
            ? `https://api.unsplash.com/search/photos?page=${page}&query=${encodeURIComponent(query)}&client_id=${myKey}&per_page=12`
            : `https://api.unsplash.com/photos?page=${page}&client_id=${myKey}&per_page=12`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function(response) {
                let photos = (query && response.results) ? response.results : response;
                renderPhotos(photos);
                page++;
                loading = false;
                $('#loader').hide();
            },
            error: function() {
                alert("Σφάλμα API. Δοκίμασε σε λίγο.");
                loading = false;
                $('#loader').hide();
            }
        });
    }

    // 2. ΕΜΦΑΝΙΣΗ ΕΙΚΟΝΩΝ ΣΤΟ GALLERY
    function renderPhotos(photos) {
        let favorites = JSON.parse(localStorage.getItem('myFavs')) || [];
        
        photos.forEach(photo => {
            const isFav = favorites.includes(photo.urls.small) ? 'active' : '';
            const imgHtml = `
                <div class="photo-item">
                    <img src="${photo.urls.small}" data-full="${photo.urls.regular}" class="gallery-img">
                    <div class="heart-icon ${isFav}" data-url="${photo.urls.small}">
                        <i class="fa-solid fa-heart"></i>
                    </div>
                </div>`;
            $('#gallery-container').append(imgHtml);
        });
    }

    // 3. ΛΟΓΙΚΗ ΕΠΙΣΤΡΟΦΗΣ (BACK TO HOME)
    function goBackHome() {
        currentQuery = '';
        page = 1;
        showingFavorites = false;
        $('#search-input').val(''); // Καθαρίζει το κείμενο
        $('#gallery-container').empty();
        $('#back-home-btn').hide(); // Κρύβει το κουμπί επιστροφής
        loadImages(); // Φορτώνει πάλι τις αρχικές φωτό
    }

    $('#back-home-btn').on('click', goBackHome);

// 4. ΑΝΑΖΗΤΗΣΗ
function performSearch() {
    currentQuery = $('#search-input').val().trim();
    if (currentQuery === "") return;
    
    showingFavorites = false;
    page = 1;
    $('#gallery-container').empty();
    $('#back-home-btn').show();
    loadImages(currentQuery);
}

$('#search-btn').on('click', performSearch);
$('#search-input').on('keypress', (e) => { 
    if(e.which == 13) performSearch(); 
});

// 4.5 ΚΑΤΗΓΟΡΙΕΣ
$('.category-btn').on('click', function() {

    const category = $(this).data('category');

    // Αλλαγή ενεργής κατηγορίας
    $('.category-btn').removeClass('active');
    $(this).addClass('active');

    // Νέα αναζήτηση
    currentQuery = category;

    page = 1;
    showingFavorites = false;

    // Καθαρισμός gallery
    $('#gallery-container').empty();

    // Εμφάνιση back button
    $('#back-home-btn').show();

    // Φόρτωση εικόνων της κατηγορίας
    loadImages(category);
});
    

    // 5. ΑΓΑΠΗΜΕΝΑ
    $('#show-favorites').on('click', function() {
        showingFavorites = true;
        $('#gallery-container').empty();
        $('#back-home-btn').show(); // Εμφανίζει το κουμπί επιστροφής
        
        let favorites = JSON.parse(localStorage.getItem('myFavs')) || [];
        if(favorites.length === 0) {
            $('#gallery-container').html('<p style="color:black; width:100%; text-align:center;">Κανένα αγαπημένο.</p>');
        } else {
            let favObjs = favorites.map(url => ({ urls: { small: url, regular: url } }));
            renderPhotos(favObjs);
        }
    });

    // 6. CLICK ΣΤΗΝ ΚΑΡΔΙΑ (ADD/REMOVE FAVORITES)
    $('#gallery-container').on('click', '.heart-icon', function(e) {
        e.stopPropagation();
        let $btn = $(this);
        let imgUrl = $btn.data('url');
        let favorites = JSON.parse(localStorage.getItem('myFavs')) || [];

        if (favorites.includes(imgUrl)) {
            favorites = favorites.filter(url => url !== imgUrl);
            $btn.removeClass('active');
            // Αν είμαστε στη σελίδα των αγαπημένων, αφαιρούμε την κάρτα αμέσως
            if (showingFavorites) $btn.closest('.photo-item').remove();
        } else {
            favorites.push(imgUrl);
            $btn.addClass('active');
        }
        localStorage.setItem('myFavs', JSON.stringify(favorites));
    });

    // 7. INFINITE SCROLL
    $(window).on('scroll', function() {
        if (!showingFavorites && $(window).scrollTop() + $(window).height() >= $(document).height() - 800 && !loading) {
            loadImages(currentQuery);
        }
    });

    // 8. LIGHTBOX (Άνοιγμα/Κλείσιμο)
    $('#gallery-container').on('click', '.gallery-img', function() {
        $('#lightbox-img').attr('src', $(this).data('full'));
        $('#lightbox').fadeIn().css('display', 'flex');
    });

    $('#lightbox, #close-lightbox').on('click', function(e) {
        if (e.target !== document.getElementById('lightbox-img')) {
            $('#lightbox').fadeOut();
        }
    });

    // Αρχική φόρτωση
    loadImages();
});
