(function ($) {
  "use strict";

  var windows = $(window);

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

  function setMenuOpen(open) {
    headerSection.toggleClass("menu-open", open);
    menuSection.toggleClass("active", open);
    menuToggle
      .html('<ion-icon name="' + (open ? "close" : "menu") + '"></ion-icon>')
      .attr("aria-label", open ? "Close menu" : "Open menu")
      .attr("aria-expanded", open ? "true" : "false");
  }

  menuToggle.on("click", function () {
    setMenuOpen(!headerSection.hasClass("menu-open"));
  });

  // The overlay covers the whole viewport, so it needs a keyboard way out.
  windows.on("keydown", function (e) {
    if (e.key === "Escape" && headerSection.hasClass("menu-open")) {
      setMenuOpen(false);
      menuToggle.trigger("focus");
    }
  });

  /* -----------------------------------
	  Isotop with ImagesLoaded
  ----------------------------------- */
  var cardFilter = $(".card-filter-bar");
  var cardGrid = $(".card-grid");
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

  /* -----------------------------------
	  Pagination
  ----------------------------------- */
  var pager = $("#card-pagination");
  // Page size comes from config.yaml through a data attribute. Fall back to
  // 10 if it is missing or not a positive number.
  var configuredPageSize = parseInt(pager.attr("data-page-size"), 10);
  var PAGE_SIZE = configuredPageSize > 0 ? configuredPageSize : 10;
  var projectSection = $(".project-section");
  var currentPage = 1;
  // Predicate run against each card element, owned by the filter and search
  // handlers. Pagination narrows whatever this matches.
  var currentMatch = function () {
    return true;
  };

  function renderPager(totalPages) {
    pager.empty();
    if (totalPages <= 1) return;

    function pageButton(label, page, disabled, active, ariaLabel) {
      return $("<button>", { type: "button", text: label })
        .attr("data-page", page)
        .attr("aria-label", ariaLabel || "Page " + page)
        .prop("disabled", !!disabled)
        .toggleClass("active", !!active);
    }

    var onFirst = currentPage === 1;
    var onLast = currentPage === totalPages;

    pager.append(pageButton("«", 1, onFirst, false, "First page"));
    pager.append(
      pageButton("‹", currentPage - 1, onFirst, false, "Previous page")
    );
    for (var i = 1; i <= totalPages; i++) {
      pager.append(pageButton(String(i), i, false, i === currentPage));
    }
    pager.append(
      pageButton("›", currentPage + 1, onLast, false, "Next page")
    );
    pager.append(pageButton("»", totalPages, onLast, false, "Last page"));
  }

  function renderPage() {
    var iso = cardGrid.data("isotope");
    if (!iso) return;

    // Pass 1: apply the filter alone, without transition, so Isotope hands
    // back the matching items already in the active sort order. Both passes
    // run in the same task, so the intermediate state is never painted.
    cardGrid.isotope({ transitionDuration: "0s", filter: currentMatch });
    var ordered = iso.filteredItems.map(function (item) {
      return item.element;
    });

    var totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    var pageElements = ordered.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE
    );

    // Pass 2: narrow to the current page with the normal animation restored.
    cardGrid.isotope({
      transitionDuration: "0.4s",
      filter: function () {
        return pageElements.indexOf(this) !== -1;
      },
    });

    $("#search-not-found").toggle(ordered.length === 0);
    renderPager(totalPages);
  }

  function setMatch(matchFn) {
    currentMatch = matchFn;
    currentPage = 1;
    renderPage();
  }

  pager.on("click", "button", function () {
    var page = parseInt($(this).attr("data-page"), 10);
    if (!page || page === currentPage) return;
    currentPage = page;
    renderPage();
    $("html, body").animate(
      { scrollTop: projectSection.offset().top - 20 },
      300
    );
  });

  $(document).ready(function () {
    // Direction comes from config.yaml. It used to be hardcoded to descending,
    // which contradicted the initial order whenever the config said otherwise.
    var sortDescending =
      $("#sort-dropdown").attr("data-descending") !== "false";
    var sortItems = $("#sort-dropdown .dropdown-menu a");
    var sortKey = sortItems.filter(".active").attr("data-sort") || "stars";
    // Matches the order the page was generated with, so the arrow shown on
    // load describes what is actually on screen.
    var sortAscending = !sortDescending;

    function defaultAscending(key) {
      // Per key, independent of config.yaml: alphabetical reads naturally A to
      // Z, counts and dates read naturally highest or newest first. config only
      // decides the initial order, which the arrow above already mirrors.
      return key === "name";
    }

    function markSortItem() {
      sortItems.removeClass("active").find(".sort-arrow").remove();
      sortItems
        .filter('[data-sort="' + sortKey + '"]')
        .addClass("active")
        .append(
          ' <span class="sort-arrow">' + (sortAscending ? "↑" : "↓") + "</span>"
        );
    }

    markSortItem();

    sortItems.on("click", function (e) {
      e.preventDefault();

      var key = $(this).attr("data-sort");
      // Clicking the key that is already selected flips the direction, so Name
      // covers both A to Z and Z to A without editing config.yaml.
      sortAscending = key === sortKey ? !sortAscending : defaultAscending(key);
      sortKey = key;
      markSortItem();

      cardGrid.isotope({
        sortBy: sortKey,
        sortAscending: sortAscending,
      });
      // The order changed, so start again from the first page.
      currentPage = 1;
      renderPage();
    });
  });

  function initCardGrid() {
    // One init only. The old code called .isotope() twice on the same element,
    // because both class names sit on the same div, so the fitRows mode of the
    // first call was immediately replaced by masonry from the second.
    cardGrid.isotope({
      itemSelector: cardGridItem,
      layoutMode: "masonry",
      masonry: {
        columnWidth: 1,
      },
      getSortData: {
        // Lowercased to match the case insensitive order the page is built with.
        name: (itemElem) => $(itemElem).find(".title").text().toLowerCase() || "",
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

    var searchInput = $("#card-filter-text");
    var searchTimer = null;

    // Every entry point below routes through these two, so the filter bar, the
    // search box and the grid can never disagree about what is being shown.
    function setActiveFilterButton(filterValue) {
      var buttons = cardFilter.find("button[data-filter]");
      buttons.removeClass("active");
      if (filterValue) {
        buttons
          .filter('[data-filter="' + filterValue + '"]')
          .addClass("active");
      }
    }

    function applyFilter(filterValue) {
      if (filterValue === "*") {
        setMatch(function () {
          return true;
        });
        return;
      }
      // data-category is pipe delimited, so wrapping the value in delimiters
      // matches whole entries only. Plain includes() would let "Java" match
      // "JavaScript" and "cnn" match "cnn-classification".
      var needle = "|" + filterValue + "|";
      setMatch(function () {
        var categoryValue = $(this).attr("data-category") || "";
        return categoryValue.indexOf(needle) !== -1;
      });
    }

    function selectFilter(filterValue) {
      searchInput.val("");
      setActiveFilterButton(filterValue);
      applyFilter(filterValue);
    }

    function runSearch() {
      var searchVal = searchInput.val().toLowerCase();
      if (!searchVal) {
        setActiveFilterButton("*");
        applyFilter("*");
        return;
      }
      // Free text matches no filter button, so clear the highlight rather than
      // leaving a stale one lit next to unrelated results.
      setActiveFilterButton(null);
      setMatch(function () {
        var titleText = $(this).find(".title").text().toLowerCase();
        // The description carries the terms people actually search for, such
        // as SHAP or U-Net, which the title and tags do not mention.
        var descText = $(this).find(".desc").text().toLowerCase();
        var categories = ($(this).attr("data-category") || "").toLowerCase();
        return (
          titleText.indexOf(searchVal) !== -1 ||
          descText.indexOf(searchVal) !== -1 ||
          categories.indexOf(searchVal) !== -1
        );
      });
    }

    // Button filter event
    cardFilter.on("click", "button", function () {
      if ($(this).is("#toggle-filter-search")) return;
      if ($(this).is("#card-sort")) return;
      if ($(this).is("#toggle-view")) return;
      selectFilter($(this).attr("data-filter"));
    });

    // "input" rather than "keyup", so pasting with the mouse and the browser's
    // own clear button update the grid too. Debounced, so a burst of keystrokes
    // costs one pass instead of two Isotope layouts per character.
    searchInput.on("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(runSearch, 180);
    });

    // Category tag filter event
    $(".category-tag").on("click", function (e) {
      e.preventDefault();
      selectFilter($(this).attr("data-filter"));
    });

    $("#toggle-filter-search").on("click", function () {
      if (searchInput.is(":visible")) {
        searchInput.hide();
        if (searchInput.val()) {
          selectFilter("*");
        }
      } else {
        searchInput.show().trigger("focus");
      }
    });

    $(document).on("click", function (e) {
      var container = $("#toggle-filter-search, #card-filter-text");
      if (container.is(e.target) || container.has(e.target).length) return;
      // Stay open while a search is active, otherwise the grid keeps its
      // filter with nothing left on screen explaining why.
      if (!searchInput.val()) {
        searchInput.hide();
      }
    });

    // Everything is wired up, so draw the first page.
    renderPage();
  }

  initCardGrid();

  // Lay out straight away and refine as each image arrives. Waiting for every
  // image before the first layout let one slow external image block the whole
  // grid, and lazy loaded images never resolve until they are scrolled to.
  cardGrid.imagesLoaded().progress(function () {
    cardGrid.isotope("layout");
  });

  /* -----------------------------------
    ScrollUp
  ----------------------------------- */
  $.scrollUp({
    scrollText: '<ion-icon name="chevron-up-outline"></ion-icon>',
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

    // The head script already resolved the stored choice and the system
    // preference, so treat what is on the element as the source of truth and
    // just bring the icon into line with it.
    applyTheme($("html").attr("data-bs-theme") === "dark" ? "dark" : "light");

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
