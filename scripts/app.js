'use strict';

var app = (function () {

  // Private variables
  var appName    = 'Receptář'
    , appVersion = '23.04.05.222214'
    , appOwner   = 'Tomáš \'Stínolez\' Vitásek';

  // DOM variables
  var loader     = document.querySelector('.loader');

  // Create element
  function createElement(elementType, data) {

    /********************************************************************
    | Element | Data                                                    |
    ---------------------------------------------------------------------
    | div     | [className, attributes, HTML content]                   |
    | span    |                                                         |
    | h2      |                                                         |
    | p       |                                                         |
    | tr      |                                                         |
    | td      |                                                         |
    | li      |                                                         |
    | img     |                                                         |
    ---------------------------------------------------------------------
    | ul      | [className, attributes, [                               |
    | ol      |                           [className, attributes, 1],   |
    |         |                           [className, attributes, 2],   |
    |         |                           ...                           |
    |         |                         ]]                              |
    |         |                                                         |
    ********************************************************************/

    // Create element by the type
    let element    = document.createElement(elementType)
      , attributes = JSON.parse(data[1]);

    // Use different settings for different element types
    switch(elementType) {

      // Element: div, span, ul, li
      case 'div':
      case 'span':
      case 'h2':
      case 'p':
      case 'tr':
      case 'td':
      case 'li':
      case 'img':

        element.className = data[0];
        element.innerHTML = data[2];

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

        let listData = data[2];
        element.className = data[0];

        for (let attr in attributes) {
          if (attr.indexOf('data-') === -1) {
            element[attr] = attributes[attr];
          } else {
            element.dataset[attr.replace('data-', '')] = attributes[attr];
          }
        }

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

  // Function to comparable string
  function comparable(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  // Sort array by key
  function sortByKey(array, key) {
    return array.sort(function(a, b) {
      let x = comparable(a[key])
        , y = comparable(b[key]);
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
      let name  = data[i].name
        , tags  = comparable(name + '|' + data[i].tags.join('|'))
        , uid   = data[i].uid
        , image = '../images/' + (data[i].image ? 'data/' + uid + '.png' : 'system/no-image.png')
        , d_attr = {"data-tags": tags, "data-uid": uid}
        , i_attr = {"src": image}
        , recipe = createElement('div', ['recipe', JSON.stringify(d_attr), ''])
        , title  = createElement('div', ['recipe-title', '{}', name])
        , img    = createElement('img', ['recipe-image', JSON.stringify(i_attr), ''])

      // Append the elements
      recipe.appendChild(img);
      recipe.appendChild(title);
      recipes.appendChild(recipe);

    }

    // Register click
    if (document.getElementsByClassName('recipe').length > 0) {
      for (let i = 0; i < document.getElementsByClassName('recipe').length; i++) {
        document.getElementsByClassName('recipe')[i].addEventListener('click', function(e) {
          location.href = 'recipe.html?uid=' + e.target.parentNode.dataset.uid;
        });
      }
    }

  }

  // Registering recipe
  function registerRecipe(json) {

    let data   = JSON.parse(json)
      , recipe = document.getElementById('recipe');

    // Add recipe name
    document.getElementsByTagName('h1')[0].innerText = data.name;

    // Going through ingredients
    for (let i = 0; i < data.ingredients.length; i++) {

      let name        = data.ingredients[i].name
        , ingredients = [];

      // Fill ingredients list
      for (let j = 0; j < data.ingredients[i].data.length; j++) {
        ingredients.push(['', '{}', data.ingredients[i].data[j]]);
      }

      // Create elements
      let div    = createElement('div', ['ingredients', '{}', ''])
        , header = createElement('h2' , ['', '{}', name])
        , list   = createElement('ul' , ['', '{}', ingredients]);

      // Append the elements
      div.appendChild(header);
      div.appendChild(list);
      recipe.appendChild(div);

    }

    // Going through steps
    for (let i = 0; i < data.steps.length; i++) {

      let name        = data.steps[i].name
        , steps = [];

      // Fill steps list
      for (let j = 0; j < data.steps[i].data.length; j++) {
        steps.push(['', '{}', data.steps[i].data[j]]);
      }

      // Create elements
      let div    = createElement('div', ['steps', '{}', ''])
        , header = createElement('h2' , ['', '{}', name])
        , list   = createElement('ol' , ['', '{}', steps]);

      // Append the elements
      div.appendChild(header);
      div.appendChild(list);
      recipe.appendChild(div);

    }

    // Going through notes
    let notes_div    = createElement('div', ['notes', '{}', ''])
      , notes_header = createElement('h2' , ['', '{}', 'Poznámky']);

    // Append the elements
    notes_div.appendChild(notes_header);

    // List of notes
    for (let i = 0; i < data.notes.length; i++) {
      let notes_data = createElement('p', ['', '{}', data.notes[i]]);
      notes_div.appendChild(notes_data);
    }

    // Append the elements
    if (data.notes.length > 0) {
      recipe.appendChild(notes_div);
    }

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

      // Register the refresh icon
      if (document.getElementById('headerRefresh')) {
        document.getElementById('headerRefresh').addEventListener('click', function(e) {
          location.reload();
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

          let search = comparable(document.getElementById('recipeSearch').value);

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
