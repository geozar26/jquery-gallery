$(document).ready(function () {

    // =========================================
    // STATE
    // =========================================

    let page = 1;

    let currentQuery = '';

    let loading = false;

    let showingFavorites = false;

    let mediaMode = 'image';


    const myKey =
        '2OPWvpb-XELm-nttZAdjMe0GTZmapGeszoDPGUzQgw8';


    // =========================================
    // 1. LOAD IMAGES
    // =========================================

    function loadImages(query = '') {

        if (loading || showingFavorites) {
            return;
        }


        loading = true;

        $('#loader').prop('hidden', false);


        let url;


        if (query) {

            url =
                `https://api.unsplash.com/search/photos` +
                `?page=${page}` +
                `&query=${encodeURIComponent(query)}` +
                `&client_id=${myKey}` +
                `&per_page=12`;

        } else {

            url =
                `https://api.unsplash.com/photos` +
                `?page=${page}` +
                `&client_id=${myKey}` +
                `&per_page=12`;

        }


        $.ajax({

            url: url,

            method: 'GET',

            success: function (response) {

                console.log('Unsplash response:', response);


                let photos;


                if (query) {

                    photos = response.results || [];

                } else {

                    photos = response || [];

                }


                if (photos.length === 0) {

                    console.log('Δεν βρέθηκαν άλλες εικόνες.');

                } else {

                    renderPhotos(photos);

                    page++;

                }

            },


            error: function (xhr) {

                console.error(
                    'Unsplash API Error:',
                    xhr.status,
                    xhr.responseText
                );


                if (xhr.status === 403) {

                    alert(
                        'Το Unsplash API έφτασε πιθανότατα το rate limit.'
                    );

                } else {

                    alert(
                        'Σφάλμα API. Δοκίμασε σε λίγο.'
                    );

                }

            },


            complete: function () {

                loading = false;

                $('#loader').prop('hidden', true);

            }

        });

    }


    // =========================================
    // 2. RENDER PHOTOS
    // =========================================

    function renderPhotos(photos) {

        const favorites =
            JSON.parse(
                localStorage.getItem('myFavs')
            ) || [];


        photos.forEach(function (photo) {

            if (!photo.urls) {
                return;
            }


            const smallUrl =
                photo.urls.small;


            const fullUrl =
                photo.urls.regular ||
                photo.urls.full ||
                photo.urls.small;


            const isFavorite =
                favorites.includes(smallUrl);


            const favoriteClass =
                isFavorite
                    ? 'active'
                    : '';


            const imgHtml = `

                <article class="photo-item">

                    <img
                        src="${smallUrl}"
                        data-full="${fullUrl}"
                        class="gallery-img"
                        alt="${photo.alt_description || 'Unsplash image'}"
                        loading="lazy"
                    >


                    <button
                        class="heart-icon ${favoriteClass}"
                        data-url="${smallUrl}"
                        type="button"
                        aria-label="Προσθήκη στα αγαπημένα"
                    >

                        <i class="fa-solid fa-heart"></i>

                    </button>

                </article>

            `;


            $('#gallery-container')
                .append(imgHtml);

        });

    }


    // =========================================
    // 3. BACK HOME
    // =========================================

    function goBackHome() {

        currentQuery = '';

        page = 1;

        showingFavorites = false;

        $('#search-input').val('');

        $('#gallery-container').empty();

        $('#back-home-btn').prop('hidden', true);


        $('.category-btn')
            .removeClass('active');

        $('.category-btn')
            .first()
            .addClass('active');


        loadImages();

    }


    $('#back-home-btn').on(
        'click',
        goBackHome
    );


    // =========================================
    // 4. SEARCH
    // =========================================

    function performSearch() {

        const query =
            $('#search-input')
                .val()
                .trim();


        if (!query) {
            return;
        }


        currentQuery = query;

        page = 1;

        showingFavorites = false;


        $('#gallery-container')
            .empty();


        $('#back-home-btn')
            .prop('hidden', false);


        $('.category-btn')
            .removeClass('active');


        loadImages(currentQuery);

    }


    $('#search-btn').on(
        'click',
        performSearch
    );


    $('#search-input').on(
        'keypress',
        function (e) {

            if (e.which === 13) {

                performSearch();

            }

        }
    );


    // =========================================
    // 5. CATEGORIES
    // =========================================

    $('.category-btn').on(
        'click',
        function () {

            const category =
                $(this).data('category');


            $('.category-btn')
                .removeClass('active');


            $(this)
                .addClass('active');


            currentQuery = category;

            page = 1;

            showingFavorites = false;


            $('#gallery-container')
                .empty();


            $('#back-home-btn')
                .prop('hidden', false);


            loadImages(category);

        }
    );


    // =========================================
    // 6. FAVORITES
    // =========================================

    $('#show-favorites').on(
        'click',
        function () {

            showingFavorites = true;


            $('#gallery-container')
                .empty();


            $('#back-home-btn')
                .prop('hidden', false);


            const favorites =
                JSON.parse(
                    localStorage.getItem('myFavs')
                ) || [];


            if (favorites.length === 0) {

                $('#gallery-container').html(`

                    <p class="empty-favorites">

                        Κανένα αγαπημένο.

                    </p>

                `);

                return;

            }


            const favObjects =
                favorites.map(function (url) {

                    return {

                        urls: {

                            small: url,

                            regular: url

                        }

                    };

                });


            renderPhotos(favObjects);

        }
    );


    // =========================================
    // 7. FAVORITE HEART
    // =========================================

    $('#gallery-container').on(
        'click',
        '.heart-icon',
        function (e) {

            e.stopPropagation();


            const $button =
                $(this);


            const imgUrl =
                $button.data('url');


            let favorites =
                JSON.parse(
                    localStorage.getItem('myFavs')
                ) || [];


            if (favorites.includes(imgUrl)) {

                favorites =
                    favorites.filter(
                        function (url) {

                            return url !== imgUrl;

                        }
                    );


                $button.removeClass('active');


                if (showingFavorites) {

                    $button
                        .closest('.photo-item')
                        .remove();

                }

            } else {

                favorites.push(imgUrl);

                $button.addClass('active');

            }


            localStorage.setItem(
                'myFavs',
                JSON.stringify(favorites)
            );

        }
    );


    // =========================================
    // 8. INFINITE SCROLL
    // =========================================

    $(window).on(
        'scroll',
        function () {

            if (showingFavorites) {
                return;
            }


            if (loading) {
                return;
            }


            const scrollPosition =
                $(window).scrollTop() +
                $(window).height();


            const documentHeight =
                $(document).height();


            if (
                scrollPosition >=
                documentHeight - 800
            ) {

                loadImages(currentQuery);

            }

        }
    );


    // =========================================
    // 9. LIGHTBOX
    // =========================================

    $('#gallery-container').on(
        'click',
        '.gallery-img',
        function () {

            const fullImage =
                $(this).data('full');


            $('#lightbox-img')
                .attr('src', fullImage);


            $('#lightbox')
                .prop('hidden', false)
                .css('display', 'flex');

        }
    );


    $('#lightbox').on(
        'click',
        function (e) {

            if (
                e.target ===
                document.getElementById('lightbox')
                ||
                e.target ===
                document.getElementById('close-lightbox')
            ) {

                closeLightbox();

            }

        }
    );


    function closeLightbox() {

        $('#lightbox')
            .fadeOut(200, function () {

                $(this)
                    .prop('hidden', true)
                    .css('display', '');

            });

    }


    // =========================================
    // 10. IMAGE / VIDEO SWITCH
    // =========================================

    function setImageMode() {

        mediaMode = 'image';


        $('#image-mode')
            .addClass('active');


        $('#video-mode')
            .removeClass('active');


        const video =
            document.getElementById(
                'hero-video'
            );


        video.pause();

        video.currentTime = 0;


        $('#hero-video')
            .removeClass('visible');


        $('#hero-image')
            .removeClass('hidden');


        $('#hero-title')
            .text('Αναζήτηση Εικόνων');


        $('#hero-description-text')
            .text(
                'Βρες υπέροχες φωτογραφίες υψηλής ανάλυσης'
            );


        $('#search-input')
            .attr(
                'placeholder',
                'Αναζήτηση εικόνων...'
            );

    }


    function setVideoMode() {

        mediaMode = 'video';


        $('#video-mode')
            .addClass('active');


        $('#image-mode')
            .removeClass('active');


        $('#hero-image')
            .addClass('hidden');


        $('#hero-video')
            .addClass('visible');


        const video =
            document.getElementById(
                'hero-video'
            );


        video.play().catch(
            function (error) {

                console.error(
                    'Video playback error:',
                    error
                );

            }
        );


        $('#hero-title')
            .text('Αναζήτηση Βίντεο');


        $('#hero-description-text')
            .text(
                'Βρες υπέροχα βίντεο υψηλής ανάλυσης'
            );


        $('#search-input')
            .attr(
                'placeholder',
                'Αναζήτηση βίντεο...'
            );

    }


    $('#image-mode').on(
        'click',
        setImageMode
    );


    $('#video-mode').on(
        'click',
        setVideoMode
    );


    // =========================================
    // 11. THEME
    // =========================================

    let darkMode = false;


    const savedTheme =
        localStorage.getItem('theme');


    if (savedTheme === 'dark') {

        darkMode = true;

    } else if (savedTheme === 'light') {

        darkMode = false;

    } else {

        darkMode =
            window.matchMedia(
                '(prefers-color-scheme: dark)'
            ).matches;

    }


    if (darkMode) {

        $('body')
            .addClass('dark');

    }


    $('#theme-toggle').on(
        'click',
        function () {

            $('body')
                .toggleClass('dark');


            const isDark =
                $('body')
                    .hasClass('dark');


            localStorage.setItem(
                'theme',
                isDark
                    ? 'dark'
                    : 'light'
            );

        }
    );


    // =========================================
    // 12. INITIAL LOAD
    // =========================================

    loadImages();

});
