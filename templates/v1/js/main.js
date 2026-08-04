(function ($) {
  ("use strict");

  /* -----------------------------------
	  Menu Sticky
  ----------------------------------- */
  var windows = $(window);
  var sticky = $(".header-sticky");
  windows.on("scroll", function () {
    var scroll = windows.scrollTop();
    if (scroll < 250) {
      sticky.removeClass("stick");
    } else {
      sticky.addClass("stick");
    }
  });

  /* -----------------------------------
	  Mobile Menu
  ----------------------------------- */
  // var multiPageMenu = $(".multi-page-menu");
  // multiPageMenu.meanmenu({
  //   meanScreenWidth: "991",
  //   meanMenuContainer: ".mobile-menu.multi-page",
  //   meanMenuClose: '<ion-icon name="close"></ion-icon>',
  //   meanMenuOpen: '<ion-icon name="menu"></ion-icon>',
  //   meanRevealPosition: "right",
  //   meanMenuCloseSize: "30px",
  // });
  // var onePageMenu = $(".one-page-menu");
  // onePageMenu.meanmenu({
  //   meanScreenWidth: "991",
  //   meanMenuContainer: ".mobile-menu.one-page",
  //   meanMenuClose: '<ion-icon name="close"></ion-icon>',
  //   meanMenuOpen: '<ion-icon name="menu"></ion-icon>',
  //   meanRevealPosition: "right",
  //   meanMenuCloseSize: "30px",
  //   onePage: true,
  // });

  /* -----------------------------------
	  One Page Menu
  ----------------------------------- */
  var headerSection = $(".header-section");
  var TopOffsetId = headerSection.height() - 1;
  var menuSection = $(".menu-section");
  var menuToggle = $(".menu-toggle");

  // onePageMenu.onePageNav({
  //   currentClass: "active",
  //   scrollThreshold: 0.2,
  //   scrollSpeed: 1000,
  //   scrollOffset: TopOffsetId,
  // });

  menuToggle.on("click", function () {
    if (headerSection.hasClass("menu-open")) {
      headerSection.removeClass("menu-open");
      $(this).html('<ion-icon name="menu"></ion-icon>');
      menuSection.removeClass("active");
    } else {
      headerSection.addClass("menu-open");
      $(this).html('<ion-icon name="close"></ion-icon>');
      menuSection.addClass("active");
    }
  });

  /* -----------------------------------
	  Isotop with ImagesLoaded
  ----------------------------------- */
  var cardFilter = $(".card-filter-bar");
  var cardGrid = $(".card-grid");
  var cardGridMasonry = $(".card-grid-masonry");
  var cardGridItem = ".card-item";
  
  var VIEW_KEY = "repogallery-view";

  function readStoredView() {
    try {
      return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
    } catch (e) {
      // Storage throws in private mode or with cookies blocked.
      return "grid";
    }
  }
	
  $("#toggle-filter-search").on("click", function () {
    $("#card-filter-text").toggle().focus();
  });

  $(document).on("click", function (e) {
    var container = $("#toggle-filter-search, #card-filter-text");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
      $("#card-filter-text").hide();
    }
  });

  $(document).ready(function () {
    $("#sort-dropdown .dropdown-menu a").on("click", function (e) {
      e.preventDefault();

      $("#sort-dropdown .dropdown-menu a").removeClass("active");
      $(this).addClass("active");

      var sortBy = $(this).attr("data-sort");

      cardGrid.isotope({
        sortBy: sortBy,
        sortAscending: false,
      });
    });
  });

  cardGrid.imagesLoaded(function () {
    cardGrid.isotope({
      itemSelector: cardGridItem,
      layoutMode: "fitRows",
      masonry: {
        columnWidth: 1,
      },
      getSortData: {
        name: (itemElem) => $(itemElem).find(".title").text() || "",
        stars: (itemElem) => parseInt($(itemElem).attr("data-stars")) || 0,
        forks: (itemElem) => parseInt($(itemElem).attr("data-forks")) || 0,
        pushed_at: (itemElem) => {
          const dateStr = $(itemElem).attr("data-pushed-at") || "";
          return new Date(dateStr).getTime() || 0;
        },
        updated_at: (itemElem) => {
          const dateStr = $(itemElem).attr("data-updated-at") || "";
          return new Date(dateStr).getTime() || 0;
        },
        created_at: (itemElem) => {
          const dateStr = $(itemElem).attr("data-created-at") || "";
          return new Date(dateStr).getTime() || 0;
        },
      },
    });
    cardGridMasonry.isotope({
      itemSelector: cardGridItem,
      layoutMode: "masonry",
      masonry: {
        columnWidth: 1,
      },
    });

    // View toggle. Set up here because it needs an initialised Isotope
    // instance to re-layout after the item widths change.
    var viewToggle = $("#toggle-view");

    function applyView(view) {
      cardGrid.toggleClass("list-view", view === "list");
      viewToggle.html(
        view === "list"
          ? '<ion-icon name="grid"></ion-icon>'
          : '<ion-icon name="list"></ion-icon>'
      );
      cardGrid.isotope("layout");
    }

    applyView(readStoredView());

    viewToggle.on("click", function () {
      var view = cardGrid.hasClass("list-view") ? "grid" : "list";
      applyView(view);
      try {
        localStorage.setItem(VIEW_KEY, view);
      } catch (e) {
        // Ignore write failures; the toggle still works for this page view.
      }
    });

    function applyFilter(filterValue) {
      if (filterValue === "*") {
        cardGrid.isotope({ filter: "*" });
      } else {
        cardGrid.isotope({
          filter: function () {
            var categoryValue = $(this).data("category") || "";
            return categoryValue.includes(filterValue);
          },
        });
      }
    }

    // Button filter event
    cardFilter.on("click", "button", function () {
      if ($(this).is("#toggle-filter-search")) return;
      if ($(this).is("#card-sort")) return;
	  if ($(this).is("#toggle-view")) return;
      cardFilter.find("button").removeClass("active");
      $(this).addClass("active");
      applyFilter($(this).attr("data-filter"));
      $("#search-not-found").hide();
    });

    // Search filter event
    $("#card-filter-text").on("keyup", function () {
      var searchVal = $(this).val().toLowerCase();
      cardGrid.isotope({
        filter: function () {
          var titleText = $(this).find(".title").text().toLowerCase();
          var categories = $(this).attr("data-category").toLowerCase();
          return (
            titleText.indexOf(searchVal) !== -1 ||
            categories.indexOf(searchVal) !== -1
          );
        },
      });
      var matched = cardGrid.data("isotope").filteredItems.length;
      matched === 0
        ? $("#search-not-found").show()
        : $("#search-not-found").hide();
    });

    // Category tag filter event
    $(".category-tag").on("click", function (e) {
      e.preventDefault();
      applyFilter($(this).attr("data-filter"));
    });
  });

  /* -----------------------------------
    ScrollUp
  ----------------------------------- */
  $.scrollUp({
    scrollText: '<i class="ion-chevron-up"></i>',
    easingType: "linear",
    scrollSpeed: 1000,
    animation: "fadeOut",
  });

  // The button is position: fixed, so at the bottom of the page it lands on
  // top of the dark footer bar. Push it up by however far that bar reaches
  // into the viewport, and leave it at its resting offset otherwise.
  var footerBottom = $(".footer-bottom");
  var scrollUpEl = null;
  var scrollUpRestingBottom = 0;
  var SCROLL_UP_GAP = 20;

  function keepScrollUpAboveFooter() {
    if (!footerBottom.length) return;

    if (!scrollUpEl) {
      // The plugin injects the element, so look it up lazily.
      var found = $("#scrollUp");
      if (!found.length) return;
      scrollUpEl = found;
      // Read the resting offset from base.css before overriding it.
      scrollUpRestingBottom = parseInt(found.css("bottom"), 10) || 0;
    }

    var footerTop = footerBottom.offset().top - windows.scrollTop();
    var intrusion = window.innerHeight - footerTop;
    scrollUpEl.css(
      "bottom",
      Math.max(scrollUpRestingBottom, intrusion + SCROLL_UP_GAP) + "px"
    );
  }

  windows.on("scroll resize", keepScrollUpAboveFooter);
  keepScrollUpAboveFooter();
  /* -----------------------------------
    Theme Toggle
  ----------------------------------- */
  var THEME_KEY = "repogallery-theme";

  function readStoredTheme() {
    try {
      var stored = localStorage.getItem(THEME_KEY);
      return stored === "light" || stored === "dark" ? stored : null;
    } catch (e) {
      // Storage throws in private mode or with cookies blocked.
      return null;
    }
  }

  $(document).ready(function () {
    var themeToggle = $("#theme-toggle");

    function applyTheme(theme) {
      $("html").attr("data-bs-theme", theme);
      themeToggle.html(
        theme === "light"
          ? '<ion-icon name="moon"></ion-icon>'
          : '<ion-icon name="sunny"></ion-icon>'
      );
    }

    // Sync the icon with the theme the inline head script already applied.
    // Without a stored choice the theme from config.yaml is kept as is.
    var storedTheme = readStoredTheme();
    if (storedTheme) {
      applyTheme(storedTheme);
    }

    themeToggle.click(function () {
      var theme = $("html").attr("data-bs-theme") === "light" ? "dark" : "light";
      applyTheme(theme);
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {
        // Ignore write failures; the toggle still works for this page view.
      }
    });
  });

  //   /*--
  //     Search Toggle
  // -----------------------------------*/
  //   var headerSearch = $(".header-search");
  //   var searchToggle = $(".search-toggle");
  //   searchToggle.on("click", function () {
  //     if (headerSearch.hasClass("open")) {
  //       headerSearch.removeClass("open");
  //       $(this).html('<ion-icon name="search"></ion-icon>');
  //     } else {
  //       headerSearch.addClass("open");
  //       $(this).html('<ion-icon name="menu"></ion-icon>');
  //     }
  //   });

  //   /*--
  //     Background Parallax
  // -----------------------------------*/
  //   var parallaxWindow = $(".parallax-window");
  //   parallaxWindow.parallax();

  //   /*--
  //     Smooth Scroll
  // -----------------------------------*/
  //   $("[data-scroll], .mobile-menu.one-page .mean-nav ul li a").on(
  //     "click",
  //     function (e) {
  //       e.preventDefault();
  //       var link = this;
  //       $.smoothScroll({
  //         speed: 1000,
  //         scrollTarget: link.hash,
  //         offset: -TopOffsetId,
  //       });
  //     }
  //   );
})(jQuery);
