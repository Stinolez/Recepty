'use strict';

var app = (function () {

  // Private variables
  var appName    = 'Receptář'
    , appVersion = '23.04.02.002514'
    , appOwner   = 'Tomáš \'Stínolez\' Vitásek';

  // DOM variables
  var loader     = document.querySelector('.loader');

  // Create element
  function createElement(elementType, data) {

    /********************************************************
    | Element | Data                                        |
    ---------------------------------------------------------
    | div     | [className, attributes, HTML content]       |
    | span    |                                             |
    | tr      |                                             |
    | td      |                                             |
    | li      |                                             |
    ---------------------------------------------------------
    | ul      | [className, [                               |
    | ol      |               [className, attributes, 1],   |
    |         |               [className, attributes, 2],   |
    |         |               ...                           |
    |         |             ]]                              |
    |         |                                             |
    ********************************************************/

    // Create element by the type
    let element = document.createElement(elementType);

    // Use different settings for different element types
    switch(elementType) {

      // Element: div, span, ul, li
      case 'div':
      case 'span':
      case 'tr':
      case 'td':
      case 'li':

        element.className = data[0];
        element.innerHTML = data[2];

        let attributes = JSON.parse(data[1]);
        for (let attr in attributes) {
          if (attr.indexOf('data-') === -1) {
            element[attr] = attributes[attr];
          } else {
            element.dataset[attr.replace('data-', '')] = attributes[attr];
          }
        }
        break;

      // List elements
      case 'ul':
      case 'ol':

        let listData = data[1];
        element.className = data[0];
        for (let i = 0; i < listData.length; i++) {
          let sub = createElement('li', listData[i]);
          element.appendChild(sub);
        }
        break;

    }

    return element;

  }

  // Show loader
  function showLoader() {
    loader.hidden = false;
  }

  // Hide loader
  function hideLoader() {
    loader.hidden = true;
  }

  // Load JSON file
  function loadJSON(callback, filepath) {

    var xobj = new XMLHttpRequest();

    xobj.overrideMimeType("application/json");
    xobj.open('GET', filepath, true);

    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(xobj.responseText);
      }
    };

    xobj.send(null);
  }

  // Sort array by key
  function sortByKey(array, key) {
    return array.sort(function(a, b) {
      let x = a[key].toLowerCase()
        , y = b[key].toLowerCase();
      return ((x < y ? -1 : ((x > y) ? 1 : 0)));
    });
  }

  // Registering list of recipes on the main page
  function registerRecipes(json) {

    let data    = JSON.parse(json).data
      , recipes = document.getElementById('recipes');

    // Data sort
    data = sortByKey(data, 'name');

    // Going through list of recipes
    for (let i = 0; i < data.length; i++) {

      // Defining recipe data / new elements
      let name = data[i].name
        , attr = {"data-tags": name.toLowerCase() + '|' + data[i].tags.join('|').toLowerCase(), "data-uid": data[i].uid}
        , recipe = createElement('div', ['recipe', JSON.stringify(attr), name]);

      // Append the elements
      recipes.appendChild(recipe);

    }

    // Register click
    if (document.getElementsByClassName('recipe').length > 0) {
      for (let i = 0; i < document.getElementsByClassName('recipe').length; i++) {
        document.getElementsByClassName('recipe')[i].addEventListener('click', function(e) {
          location.href = 'recipe.html?uid=' + e.target.dataset.uid;
        });
      }
    }

  }

  // Registering recipe
  function registerRecipe(json) {
    let data = JSON.parse(json);

    // Add recipe name
    document.getElementsByTagName('h1')[0].innerText = data.name;


  }

  // Return an object exposed to the public
  return {

    // Get application name
    getAppName: function() {
      return appName;
    },

    // Get application version
    getAppVersion: function() {
      return appVersion;
    },

    // Get application owner
    getAppOwner: function() {
      return appOwner;
    },

    // Publicly facing createElement function
    createElement: function(elementType, data) {
      return createElement(elementType, data);
    },

    // Function to show or hide the loading spinner
    setLoading: function(bool) {
      if (bool) {
        showLoader();
      } else {
        hideLoader();
      }
    },

    // Init function
    init: function() {

      // Show loader
      showLoader();

      // Setup the copyright
      document.getElementById('copyright').innerHTML = app.getAppName() + ', v.' + app.getAppVersion() + ', &copy; ' + app.getAppOwner() + ', ' + new Date().getFullYear();

      // Back button action
      if (document.getElementById('headerBack')) {
        document.getElementById('headerBack').addEventListener('click', function(e) {
          location.href = e.target.dataset.url;
        });
      }

      // Register the search icon
      if (document.getElementById('headerSearch')) {

        document.getElementById('headerSearch').addEventListener('click', function(e) {

          let title  = document.getElementsByClassName('headerTitle')[0].style.display || 'block'
            , search = document.getElementsByClassName('headerSearchBox')[0].style.display || 'none';

          document.getElementsByClassName('headerTitle')[0].style.display = (title  === 'block' ? 'none' : 'block');
          document.getElementsByClassName('headerSearchBox')[0].style.display = (search === 'flex' ? 'none' : 'flex');

          if (document.getElementsByClassName('headerSearchBox')[0].style.display === 'flex') {
            document.getElementById('recipeSearch').focus();
          } else {
            document.getElementById('recipeSearch').value = '';
            document.getElementById('recipeSearch').dispatchEvent(new KeyboardEvent('keyup', { keyCode: 70, ctrlKey: true }));
          }

        });
      }

      // Register search function
      if (document.getElementById('recipeSearch')) {

        document.getElementById('recipeSearch').addEventListener('keyup', function(e) {

          let search = document.getElementById('recipeSearch').value.toLowerCase();

          if (search !== '') {
            for (let i = 0; i < document.getElementsByClassName('recipe').length; i++) {
              let tags = document.getElementsByClassName('recipe')[i].dataset.tags.split('|')
                , matches = tags.filter(s => s.includes(search));
              if (matches.length === 0) {
                document.getElementsByClassName('recipe')[i].style.display = 'none';
              } else {
                document.getElementsByClassName('recipe')[i].style.display = 'block';
              }
            }
          } else {
            for (let i = 0; i < document.getElementsByClassName('recipe').length; i++) {
              document.getElementsByClassName('recipe')[i].style.display = 'block';
            }
          }

        });

      }

      // Register list of recipes
      if (document.getElementById('recipes')) {
        loadJSON(registerRecipes, '../data/_main.json');
      }

      // Register recipe
      if (document.getElementById('recipe')) {
        const queryString = window.location.search
            , urlParams   = new URLSearchParams(queryString);

        loadJSON(registerRecipe, '../data/' + urlParams.get('uid') + '.json');
      }

      // Hide loader
      hideLoader();

    }

  };
})();

// Run the init function
app.init();
