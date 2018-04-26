'use strict';
// Your client side JavaScript code goes here.
// This file is included in every page.
var endpoint = '/api/lists';

var listAddArea = "<div class='listAdd_Area hide'> \n" +
"<textarea onkeyup='autoGrow(this)' id='{{nextPos}}' class='listAdd_Text' wrap='hard' cols='50' rows='1'></textarea> \n" +
"<button class='listAdd_Button' onclick='SubmitList(event)'>Add</button> \n" +
"<a class='listAdd_CancelBtn' onclick='listAddCancel(event)'></a> \n" +
"</div>";
var addListTemplate = Handlebars.compile(listAddArea);
var cardTextArea = "<div class='cardAdd_Area hide'> \n" +
"<textarea onkeyup='autoGrow(this)' class='cardAdd_Text' wrap='hard' name='' id='cardAddText'+{{id}} cols='50' rows='4'></textarea> \n" +
"<button class='cardAdd_Button' onclick='SubmitCard(event, {{id}})'>Add</button> \n" +
"<a class='cardAdd_CancelBtn' onclick='cardAddCancel(event)'></a> \n" +
"</div>";

var card = "<li class='card'><textarea onkeypress='checkforSubmit(event, {{cardID}}, {{listID}});' class='cardText'>{{cardText}}</textarea>" + 
"<a class='Btn_DelCard' onclick='deleteCard(event,{{cardID}},{{listID}})'></a></li>"
var addCardTemplate = Handlebars.compile(cardTextArea);
var cardTemplate = Handlebars.compile(card);


document.addEventListener("DOMContentLoaded", function(event) {
  $("textarea").each(function(textarea) {
    $this.height( $this[0].scrollHeight ).find( 'textarea' ).change();
  });
}); 
$('#root').on( 'onLoad change keyup keydown paste cut', 'textarea', function (){
  $(this).height(0).height(this.scrollHeight);
}).find( 'textarea' ).change();
function autoGrow (oField) {
  if (oField.scrollHeight > oField.clientHeight) {
    oField.style.height = oField.scrollHeight + "px";
  }
}


// Example code for creating a list on the server
function createList(name, pos, cards) {
  return $.ajax('/api/lists', {
    type: 'POST',
    data: {
      name: name,
      pos: pos,
      cards: cards
    }
  });
}
// Example code for getting all `list`s from server
function loadLists() {
  return $.ajax('/api/lists');
}

function loadList(id) {
  return $.ajax('/api/lists' + id)
}
// Add List
function addList(event) {
  var button = event.target;
  var parent = button.parentElement;
  button.classList.add('hide');
  parent.getElementsByClassName("listAdd_Area")[0].classList.remove('hide');
}
function listAddCancel() {
  var btn = event.target;
  var parent = btn.parentElement.parentElement;
  var textarea = 
  parent.getElementsByClassName("Btn_AddList")[0].classList.remove('hide');
  parent.getElementsByClassName("listAdd_Area")[0].classList.add('hide');
}
function SubmitList(event) {
  var button = event.target;
  var parent = button.parentElement;
  console.log(parent);
  var textElm = parent.getElementsByTagName("textarea")[0];
  var name = textElm.value;
  createList(name, textElm.id).then(function() {
    refresh();
  });
}

// Update List
function checkforListSubmit(e, listID) {
  var key = window.event.keyCode;
  var textarea = event.target;
  if (e.keyCode == 13 && !e.shiftKey) {
    e.preventDefault();
    var txt = textarea.value;
    return $.ajax('api/lists/' + listID)
    .then(function(data) {
      console.log(data);
      var data = data;
      data.name = txt;
      $.ajax('api/lists/' + listID, {
        type: 'POST',
        data: data
      });
    }).then(function() {
      refresh();
    });
  } 
}

// Delete List
function deleteList(e, listID) {
  return $.ajax('/api/lists/' + listID, {
    type: 'DELETE'
  }).then(function() {
    refresh();
  });
}

// Add Card
function addCard(event, listID) {
  var button = event.target;
  var parent = button.parentElement;
  button.classList.add('hide');
  parent.getElementsByClassName("cardAdd_Area")[0].classList.remove('hide');
}
function cardAddCancel(event) {
  var btn = event.target;
  var parent = btn.parentElement.parentElement;
  var textarea = 
  parent.getElementsByClassName("Btn_AddCard")[0].classList.remove('hide');
  parent.getElementsByClassName("cardAdd_Area")[0].classList.add('hide');
}
function SubmitCard(event, listID) {
  var button = event.target;
  var parent = button.parentElement;
  console.log(parent);
  var textElm = parent.getElementsByTagName("textarea")[0];
  var cardText = textElm.value;
  return $.ajax('api/lists/' + listID)
  .then(function(data) {
    console.log(data);
    var data = data;
    if(data.cards) {
      data.cards.push(cardText);
    }
    else {
      data.cards = [cardText];
    }
    
    $.ajax('api/lists/' + listID, {
      type: 'POST',
      data: data
    });
  }).then(function() {
    refresh();
  });
  
}

// Update Card
function checkforSubmit (e, cardID, listID) {
  var key = window.event.keyCode;
  var textarea = event.target;
  if (e.keyCode == 13 && !e.shiftKey) {
    e.preventDefault();
    var txt = textarea.value;
    return $.ajax('api/lists/' + listID)
    .then(function(data) {
      console.log(data);
      var data = data;
      data.cards[cardID] = txt;
      $.ajax('api/lists/' + listID, {
        type: 'POST',
        data: data
      });
    });
  } 
}

// Delete Card
function deleteCard(event, cardID, listID) {
  return $.ajax('api/lists/' + listID)
  .then(function(data) {
    console.log(data);
    var data = data;
    data.cards.splice(cardID, 1);
    $.ajax('api/lists/' + listID, {
      type: 'POST',
      data: data
    });
  }).then(function() {
    refresh();
  });
}


// Example code for displaying lists in the browser
function displayLists(lists) {
  // Lists should be ordered based on their 'pos' field
  lists.rows = _.sortBy(lists.rows, 'pos');
  
  lists.rows.forEach(function(list, index, array) {
    var curElem = $('<li>', {
      class: 'list',
      id: list.id,
      pos: list.pos
    });
    console.log(list);
    curElem.append($('<textarea>', {
      class: 'listTitle',
      rows: '1',
      onkeypress: 'checkforListSubmit(event, ' + list.id + ');'
    }).text(list.name));
    curElem.append($('<a>', {
      class: 'Btn_DelList',
      onclick: 'deleteList(event, ' + list.id + ')'
    }));
    if (list.cards) {
      var innerUl = $('<ul>', {
        class: 'cards'
      });
      list.cards.forEach(function(card, index) {
        var crd = cardTemplate({
          cardID: index,
          cardText: card,
          listID: list.id
        })
        innerUl.append(crd);
      });
      curElem.append(innerUl);
    }
    var addCardArea = $('<div>', {
      class: 'addCardArea'
    });
    var addCardButton = $('<button>', {
      class: 'Btn_AddCard',
      id: list.id,
      onclick: 'addCard( event, ' + list.id + ' );'
    }).text('Add Card');
    var addcardprocess = addCardTemplate({
      id: list.id
    })
    addCardArea.append(addcardprocess);
    addCardArea.append(addCardButton);
    curElem.append(addCardArea);
    $('#lists').append(curElem);

    if(index == array.length-1) {
      var addList_Area = $('<div>', {
        class: 'list addListArea'
      });
    
      var addListButton = $('<button>', {
        class: 'Btn_AddList',
        onclick: 'addList( event );'
      }).text('Add List..');
      addList_Area.append(addListButton);
    
      var addList = addListTemplate({
        nextPos: list.pos+1
      });
      addList_Area.append(addList);
     
      $('#lists').append(addList_Area);
    }
  });

}

function refresh () {
  document.getElementById('lists').innerHTML = '';
  loadLists()
  .then(function(data) {
    console.log('Lists', data.rows);
    if (data.rows.length) {
      // If some lists are found display them
      displayLists(data);
    }
  });
}

loadLists()
  .then(function(data) {
    console.log('Lists', data.rows);
    if (data.rows.length) {
      // If some lists are found display them
      displayLists(data);
    } else {
      // If no lists are found, create sample list
      // and re-display.
      console.log('No lists found, creating one.');
      createList('Hello', 0, ['Card 1', 'Card 2'])
        .then(function(list) {
          console.log('Created list', list);
          return loadLists();
        })
        .then(function(lists) {
          displayLists(lists);
        });
        // .then(function() {
        //   $('.list').draggable({
        //     grid: [200, 20],
        //     start: function() {
        //       counts[ 0 ]++;
        //       updateCounterStatus( $start_counter, counts[ 0 ] );
        //     },
        //     drag: function() {
        //       counts[ 1 ]++;
        //       updateCounterStatus( $drag_counter, counts[ 1 ] );
        //     },
        //     stop: function() {
        //       counts[ 2 ]++;
        //       updateCounterStatus( $stop_counter, counts[ 2 ] );
        //     }
          
        //   });
        // });
    }

  });

  
  