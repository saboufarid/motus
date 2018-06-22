let words = require("./words.json");
let correspondances = require("./correspondance.js");
let wordLength = 5;
let loopSleep = 300;
let secretWord;
let wordTries = 6;
let wordTry = 1;
let discovered = [];

$(document).ready(function() {
  $("#answer").attr(
    "placeholder",
    "Veuillez entrer un mot de " + wordLength + " lettres"
  );
  $("#answer").attr("pattern", "[a-zA-Z]{" + wordLength + "}");
  $("#answer").bind("enterKey", function(e) {
    let answer = $("#answer")
      .val()
      .toUpperCase();
    $("#answer").attr("disabled", "disabled");
    if (answer.length != wordLength) {
      $("#lose-sound").trigger("play");
      sleep(1000).then(() => {
        displaySolution();
      });
    } else {
      displayCorrespondances(answer);
      $("#answer").val("");
    }
  });
  $("#answer").keyup(function(e) {
    if (e.keyCode == 13) {
      $(this).trigger("enterKey");
    }
  });

  initGrid();
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function displaySolution() {
  let correspondance = correspondances(secretWord, secretWord);
  for (let i = 0; i < correspondance.length; i++) {
    sleep(i * loopSleep).then(() => {
      displayCorrespondance(i, correspondance[i]);
    });
  }
}

async function displayCorrespondances(response) {
  let correspondance = correspondances(response, secretWord);
  for (let i = 0; i < correspondance.length; i++) {
    sleep(i * loopSleep).then(() => {
      displayCorrespondance(i, correspondance[i]);
    });
  }
  sleep(secretWord.length * loopSleep).then(() => {
    if (response === secretWord) {
      $("#win-sound").trigger("play");
    } else if (wordTry === wordTries) {
      $("#lose-sound").trigger("play");
      displaySolution();
    } else {
      wordTry++;
      displayDiscoveredLetters();
      $("#answer").removeAttr("disabled");
      $("#answer").focus();
    }
  });
}

async function displayCorrespondance(col, correspondance) {
  let node = display(col, correspondance.lettre);
  node.removeClass("misplaced").removeClass("valid");
  if (correspondance.couleur === "jaune") {
    $("#misplaced-sound").trigger("play");
    node.addClass("misplaced");
  } else if (correspondance.couleur === "rouge") {
    node.addClass("valid");
    discovered[col] = correspondance.lettre;
    $("#valid-sound").trigger("play");
  } else {
    $("#wrong-sound").trigger("play");
  }
}

async function displayDiscoveredLetters() {
  let correspondance = correspondances(discovered.join(""), secretWord);
  for (let i = 0; i < correspondance.length; i++) {
    displayDiscoveredLetter(i, correspondance[i]);
  }
}

async function displayDiscoveredLetter(col, correspondance) {
  let node = display(col, correspondance.lettre);
  if (correspondance.couleur === "rouge") {
    node.addClass("valid");
  }
}

function getSecretWord(wordLength) {
  let listWords = words
    .map(word => word.label)
    .filter(label => label.length === wordLength);
  let word = listWords[Math.floor(Math.random() * listWords.length)];
  // Remove accents
  word = word.replace(/à/g, "a");
  word = word.replace(/â/g, "a");
  word = word.replace(/ç/g, "c");
  word = word.replace(/è/g, "e");
  word = word.replace(/é/g, "e");
  word = word.replace(/ê/g, "e");
  word = word.replace(/î/g, "i");
  word = word.replace(/ï/g, "i");
  word = word.replace(/ô/g, "o");
  word = word.replace(/ù/g, "u");
  word = word.replace(/û/g, "u");

  return word.toUpperCase();
}

function initGrid() {
  secretWord = getSecretWord(wordLength);
  // let secretWord = "CHIEN";

  let table_tds = "";
  for (let i = 0; i < wordLength; i++) {
    table_tds += "<td></p></td>";
  }
  for (let i = 0; i < 6; i++) {
    let table_tr = "<tr>" + table_tds + "</tr>";
    $("#grid").append(table_tr);
  }

  discovered = Array(secretWord.length).fill("."); // fill array with .
  // Put first letter in clear
  discovered[0] = secretWord[0];

  displayDiscoveredLetters();
}

function display(col, letter) {
  return $("#grid")
    .find("tr")
    .eq(wordTry - 1)
    .find("p")
    .eq(col)
    .text(letter);
}
