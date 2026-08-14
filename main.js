```javascript
$(document).ready(function () {

    let page = 1;
    let currentQuery = '';
    let loading = false;
    let showingFavorites = false;

    const myKey = '2OPWvpb-XELm-nttZAdjMe0GTZmapGeszoDPGUzQgw8';


    // =========================================
    // 1. ΦΟΡΤΩΣΗ ΕΙΚΟΝΩΝ
    // =========================================

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

            success: function (response) {

                let photos =
                    (query && response.results)
                        ? response.results
                        : response;

                renderPhotos(photos);

                page++;

                loading = false;

                $('#loader').hide();
            },

            error: function () {

                alert("Σφάλμα API. Δοκίμασε σε λίγο.");

                loading = false;

                $('#loader').hide();
            }

        });

    }


    // =========================================
    // 2. ΕΜΦΑΝΙΣΗ ΕΙΚΟΝΩΝ ΣΤΟ GALLERY
    // =========================================

    function renderPhotos(photos) {

        let favorites =
            JSON.parse(localStorage.getItem('myFavs')) || [];

        photos.forEach(photo => {

            const isFav =
                favorites.includes(photo.urls.small)
                    ? 'active'
                    : '';

            const imgHtml = `

                <div class="photo-item">

                    <img
                        src="${photo.urls.small}"
                        data-full="${photo.urls.regular}"
                        class="gallery-img"
                    >

                    <div
                        class="heart-icon ${isFav}"
                        data-url="${photo.urls.small}"
                    >
                        <i class="fa-solid fa-heart"></i>
                    </div>

                </div>

            `;

            $('#gallery-container').append(imgHtml);

        });

    }


    // =========================================
    // 3. ΕΠΙΣΤΡΟΦΗ ΣΤΗΝ ΑΡΧΙΚΗ
    // =========================================

    function goBackHome() {

        currentQuery = '';

        page = 1;

        showingFavorites = false;

        $('#search-input').val('');

        $('#gallery-container').empty();

        $('#back-home-btn').hide();

        loadImages();

    }


    $('#back-home-btn').on('click', goBackHome);


    // =========================================
    // 4. ΑΝΑΖΗΤΗΣΗ
    // =========================================

    function performSearch() {

        currentQuery =
            $('#search-input').val().trim();

        if (currentQuery === '') return;

        showingFavorites = false;

        page = 1;

        $('#gallery-container').empty();

        $('#back-home-btn').show();

        loadImages(currentQuery);

    }


    $('#search-btn').on('click', performSearch);


    $('#search-input').on('keypress', function (e) {

        if (e.which === 13) {

            performSearch();

        }

    });


    // =========================================
    // 4.5 ΚΑΤΗΓΟΡΙΕΣ
    // =========================================

    $('.category-btn').on('click', function () {

        const category =
            $(this).data('category');

        $('.category-btn').removeClass('active');

        $(this).addClass('active');

        currentQuery = category;

        page = 1;

        showingFavorites = false;

        $('#gallery-container').empty();

        $('#back-home-btn').show();

        loadImages(category);

    });


    // =========================================
    // 5. ΑΓΑΠΗΜΕΝΑ
    // =========================================

    $('#show-favorites').on('click', function () {

        showingFavorites = true;

        $('#gallery-container').empty();

        $('#back-home-btn').show();

        let favorites =
            JSON.parse(localStorage.getItem('myFavs')) || [];


        if (favorites.length === 0) {

            $('#gallery-container').html(`
                <p style="
                    color: black;
                    width: 100%;
                    text-align: center;
                ">
                    Κανένα αγαπημένο.
                </p>
            `);

        } else {

            let favObjs =
                favorites.map(url => ({
                    urls: {
                        small: url,
                        regular: url
                    }
                }));

            renderPhotos(favObjs);

        }

    });


    // =========================================
    // 6. CLICK ΣΤΗΝ ΚΑΡΔΙΑ
    // =========================================

    $('#gallery-container').on(
        'click',
        '.heart-icon',
        function (e) {

            e.stopPropagation();

            let $btn = $(this);

            let imgUrl =
                $btn.data('url');

            let favorites =
                JSON.parse(
                    localStorage.getItem('myFavs')
                ) || [];


            if (favorites.includes(imgUrl)) {

                favorites =
                    favorites.filter(
                        url => url !== imgUrl
                    );

                $btn.removeClass('active');


                if (showingFavorites) {

                    $btn
                        .closest('.photo-item')
                        .remove();

                }

            } else {

                favorites.push(imgUrl);

                $btn.addClass('active');

            }


            localStorage.setItem(
                'myFavs',
                JSON.stringify(favorites)
            );

        }
    );


    // =========================================
    // 7. INFINITE SCROLL
    // =========================================

    $(window).on('scroll', function () {

        if (
            !showingFavorites &&
            $(window).scrollTop() +
            $(window).height() >=
            $(document).height() - 800 &&
            !loading
        ) {

            loadImages(currentQuery);

        }

    });


    // =========================================
    // 8. LIGHTBOX
    // =========================================

    $('#gallery-container').on(
        'click',
        '.gallery-img',
        function () {

            $('#lightbox-img').attr(
                'src',
                $(this).data('full')
            );

            $('#lightbox')
                .fadeIn()
                .css('display', 'flex');

        }
    );


    $('#lightbox, #close-lightbox').on(
        'click',
        function (e) {

            if (
                e.target !==
                document.getElementById('lightbox-img')
            ) {

                $('#lightbox').fadeOut();

            }

        }
    );


    // =========================================
    // 9. IMAGE / VIDEO HERO SWITCH
    // =========================================


    // IMAGE BUTTON

    $('#image-mode').on('click', function () {

        // ενεργό button
        $('#image-mode')
            .addClass('active');

        $('#video-mode')
            .removeClass('active');


        // εμφάνιση εικόνας
        $('#hero-image').show();


        // απόκρυψη video
        $('#hero-video').hide();


        // σταμάτημα video
        const video =
            document.getElementById('hero-video');

        video.pause();

        // επιστροφή στην αρχή του video
        video.currentTime = 0;


        // αλλαγή τίτλου
        $('#hero-title').text(
            'Αναζήτηση Εικόνων'
        );


        // αλλαγή description
        $('#hero-description-text').text(
            'Βρες υπέροχες φωτογραφίες υψηλής ανάλυσης'
        );


        // αλλαγή placeholder
        $('#search-input').attr(
            'placeholder',
            'Αναζήτηση εικόνων...'
        );

    });


    // VIDEO BUTTON

    $('#video-mode').on('click', function () {

        // ενεργό button
        $('#video-mode')
            .addClass('active');

        $('#image-mode')
            .removeClass('active');


        // απόκρυψη εικόνας
        $('#hero-image').hide();


        // εμφάνιση video
        $('#hero-video').show();


        // ξεκίνημα video
        const video =
            document.getElementById('hero-video');

        video.play().catch(function (error) {

            console.log(
                'Το video δεν μπόρεσε να ξεκινήσει αυτόματα:',
                error
            );

        });


        // αλλαγή τίτλου
        $('#hero-title').text(
            'Αναζήτηση Βίντεο'
        );


        // αλλαγή description
        $('#hero-description-text').text(
            'Βρες υπέροχα βίντεο υψηλής ανάλυσης'
        );


        // αλλαγή placeholder
        $('#search-input').attr(
            'placeholder',
            'Αναζήτηση βίντεο...'
        );

    });


    // =========================================
    // 10. THEME TOGGLE
    // =========================================

    let darkMode = false;


    // default system theme
    if (
        window.matchMedia(
            '(prefers-color-scheme: dark)'
        ).matches
    ) {

        darkMode = true;

    }


    // localStorage preference
    if (
        localStorage.getItem('theme') === 'dark'
    ) {

        darkMode = true;

    } else if (
        localStorage.getItem('theme') === 'light'
    ) {

        darkMode = false;

    }


    if (darkMode) {

        document.body.classList.add('dark');

    }


    $('#theme-toggle').on('click', function () {

        document.body.classList.toggle('dark');

        localStorage.setItem(
            'theme',
            document.body.classList.contains('dark')
                ? 'dark'
                : 'light'
        );

    });


    // =========================================
    // 11. ΑΡΧΙΚΗ ΦΟΡΤΩΣΗ
    // =========================================

    loadImages();

});
```
