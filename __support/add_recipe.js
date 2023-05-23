'use strict';

var app = (function () {

  // Private variables
  var appName    = 'Receptář - Přidat recept'
    , appOwner   = 'Tomáš \'Stínolez\' Vitásek';

  // DOM variables
  var loader     = document.querySelector('.loader');

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

  // Trim array
  function trimArray(array) {
    let arr = array.map(element => element.trim());
    return arr.filter(elm => elm);
  }

  // Get new UID + create tag cloud
  function mainJSON(json) {

    let data      = JSON.parse(json).data
      , maxID     = ''
      , tags      = []
      , tag_cloud = document.getElementById('tag-cloud');

    // Data sort
    data = sortByKey(data, 'uid');

    // Get the most recent ID
    maxID = data[(data.length - 1)].uid || '0';

    // Get all tags
    for (let i = 0; i < data.length; i++) {
      tags.push.apply(tags, data[i].tags);
    }

    // Return new ID
    document.getElementById('uid').value = ('00000' + (Number(maxID) + 1)).slice(-5);

    // Create tag cloud
    let occurrences = tags.reduce(function (acc, curr) {
      return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
    }, {});

    // Place the tag cloud
    for (let key in occurrences) {
      let span = document.createElement('span');
      span.innerText          = key;
      span.classList          = 'tag-cloud-detail';
      span.dataset.occurences = occurrences[key];
      tag_cloud.appendChild(span);
    }

  }

  // Generate JSONs
  function generateJSON() {

    let main              = {}
      , main_container    = document.getElementById('main_json')
      , recipe            = {}
      , recipe_container  = document.getElementById('recipe_json')
      , ingredients_group = document.getElementsByClassName('ingredients-group')
      , step_group        = document.getElementsByClassName('recipe-group')
      , notes_group       = document.getElementsByClassName('notes-group-item');

    // Create main JSON
    main.name  = document.getElementById('recipe-name').value || '';
    main.uid   = document.getElementById('uid').value || '';
    main.image = true;
    main.tags  = document.getElementById('tags').value.split(',') || [];
    main.tags  = trimArray(main.tags);

    // Recipe JSON
    recipe.name  = document.getElementById('recipe-name').value || '';

    // List of ingredients
    recipe.ingredients = [];

    for (let i = 0; i < ingredients_group.length; i++) {

      let ingredients = {};

      ingredients.name = ingredients_group[i].getElementsByClassName("ingredients-group-name")[0].value;
      ingredients.data = [];

      let ingredients_items = ingredients_group[i].getElementsByClassName('ingredients-group-item');
      for (let j = 0; j < ingredients_items.length; j++) {
        if (ingredients_items[j].value != '') {
          ingredients.data.push(ingredients_items[j].value);
        }
      }

      recipe.ingredients.push(ingredients);
    }

    // List of steps
    recipe.steps = [];

    for (let i = 0; i < step_group.length; i++) {

      let step = {};

      step.name = step_group[i].getElementsByClassName("recipe-group-name")[0].value;
      step.data = [];

      let step_items = step_group[i].getElementsByClassName('recipe-group-item');
      for (let j = 0; j < step_items.length; j++) {
        if (step_items[j].value != '') {
          step.data.push(step_items[j].value);
        }
      }

      recipe.steps.push(step);
    }

    // List of notes
    recipe.notes = [];

    for (let i = 0; i < notes_group.length; i++) {
      if (notes_group[i].value != '') {
        recipe.notes.push(notes_group[i].value);
      }
    }

    // Show JSONs
    main_container.innerText = ', ' + JSON.stringify(main);
    recipe_container.innerText = JSON.stringify(recipe);

  }

  // Return an object exposed to the public
  return {

    // Get application name
    getAppName: function() {
      return appName;
    },

    // Get application owner
    getAppOwner: function() {
      return appOwner;
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

      // Create tag cloud + get new ID
      loadJSON(mainJSON, '../data/_main.json');

      // Add ingredient item
      document.getElementsByClassName('add-ingredient-item')[0].addEventListener('click', function(e) {
        let input = document.createElement('input');
        input.type      = 'text';
        input.name      = 'ingredients-group-item';
        input.classList = 'ingredients-group-item';
        e.target.before(input);
      });

      // Add ingredient group
      document.getElementsByClassName('add-ingredient-group')[0].addEventListener('click', function(e) {

        let section    = document.createElement('section')
          , label_name = document.createElement('label')
          , input_name = document.createElement('input')
          , label_item = document.createElement('label')
          , input_item = document.createElement('input')
          , button     = document.createElement('button');

        section.classList    = 'ingredients-group';
        label_name.htmlFor   = 'ingredients-group-name';
        label_name.innerText = 'Název skupiny:';
        input_name.type      = 'text';
        input_name.name      = 'ingredients-group-name';
        input_name.classList = 'ingredients-group-name';
        label_item.htmlFor   = 'ingredients-group-item';
        label_item.innerText = 'Ingredience:';
        input_item.type      = 'text';
        input_item.name      = 'ingredients-group-item';
        input_item.classList = 'ingredients-group-item';
        button.classList     = 'add-ingredient-item';
        button.innerText     = 'Přidat ingredienci';

        button.addEventListener('click', function(e) {
          let input = document.createElement('input');
          input.type      = 'text';
          input.name      = 'ingredients-group-item';
          input.classList = 'ingredients-group-item';
          e.target.before(input);
        });

        section.appendChild(label_name);
        section.appendChild(input_name);
        section.appendChild(label_item);
        section.appendChild(input_item);
        section.appendChild(button);
        e.target.before(section);
      });

      // Add step
      document.getElementsByClassName('add-recipe-item')[0].addEventListener('click', function(e) {
        let textarea = document.createElement('textarea');
        textarea.rows      = '2';
        textarea.name      = 'recipe-group-item';
        textarea.classList = 'recipe-group-item';
        e.target.before(textarea);
      });

      // Add step group
      document.getElementsByClassName('add-recipe-group')[0].addEventListener('click', function(e) {

        let section    = document.createElement('section')
          , label_name = document.createElement('label')
          , input_name = document.createElement('input')
          , label_item = document.createElement('label')
          , area_item  = document.createElement('textarea')
          , button     = document.createElement('button');

        section.classList    = 'recipe-group';
        label_name.htmlFor   = 'recipe-group-name';
        label_name.innerText = 'Název skupiny:';
        input_name.type      = 'text';
        input_name.name      = 'recipe-group-name';
        input_name.classList = 'recipe-group-name';
        label_item.htmlFor   = 'recipe-group-item';
        label_item.innerText = 'Krok:';
        area_item.name       = 'recipe-group-item';
        area_item.classList  = 'recipe-group-item';
        area_item.rows       = '2';
        button.classList     = 'add-recipe-item';
        button.innerText     = 'Přidat krok';

        button.addEventListener('click', function(e) {
          let textarea = document.createElement('textarea');
          textarea.rows      = '2';
          textarea.name      = 'recipe-group-item';
          textarea.classList = 'recipe-group-item';
          e.target.before(textarea);
        });

        section.appendChild(label_name);
        section.appendChild(input_name);
        section.appendChild(label_item);
        section.appendChild(area_item);
        section.appendChild(button);
        e.target.before(section);
      });

      // Add note
      document.getElementsByClassName('add-notes-item')[0].addEventListener('click', function(e) {
        let input = document.createElement('input');
        input.type      = 'text';
        input.name      = 'notes-group-item';
        input.classList = 'notes-group-item';
        e.target.before(input);
      });

      // Generate
      document.getElementById('generate').addEventListener('click', function(e) {
        generateJSON();
      });

      // Setup the copyright
      document.getElementById('copyright').innerHTML = app.getAppName() + ', &copy; ' + app.getAppOwner() + ', ' + new Date().getFullYear();

      // Hide loader
      hideLoader();

    }

  };
})();

// Run the init function
app.init();
