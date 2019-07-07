var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

import {phrases} from './vocabulary.js'


var phrasePara = document.querySelector('.phrase');
var resultPara = document.querySelector('.result');
var diagnosticPara = document.querySelector('.output');
var testBtn = document.querySelector('button');
var stackWords = []
var correctly = document.getElementById('correctly'); // отобразить правильно произносенные слова
var difficulties = document.getElementById('difficulties'); // отобразить затруднения



//  Helper Function
function randomPhrase(ar) {
  var number = Math.floor(Math.random() * ar.length);
  return number;
}

function arrayRemove(arr, value) {
  return arr.filter(function(ele){
      return ele != value;
  });

}

function nextWord(ar) {
  var phrase = ar[randomPhrase(ar)];
  phrase = phrase.toLowerCase();
  phrasePara.textContent = phrase;
  return phrase
}

function insertHTML(nd,wr) {
  var entry = document.createElement('li');
  entry.appendChild(document.createTextNode(wr));
  nd.appendChild(entry);
}

function setNumberWordInStorage(key) {
  if (localStorage.getItem(key)) {
    var coun = Number(localStorage.getItem(key)) + 1
    localStorage.setItem(key, String(coun))
  } else {
    localStorage.setItem(key, '1')
    coun = 1
  }
  return coun
}

function displayWordsFromStorage (key, stem, column) {
  for (let i=1; i <= Number(localStorage.getItem(key)); i++) {
    insertHTML(column, localStorage.getItem(String(i) + stem));
  }
}


// End Helper Function

let r_count = 0

function testSpeech() {
  testBtn.disabled = true;
  testBtn.textContent = 'Идет тест';

  let phrase = phrasePara.textContent;
  resultPara.textContent = 'Правильно или нет?';
  resultPara.style.background = 'rgba(0,0,0,0.2)';
  diagnosticPara.textContent = 'Здесь будет то, как Я услышал';

  var grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + phrase +';';
  var recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'ru-RU';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  console.log("1")
  recognition.start();
  console.log("12")

  recognition.onresult = function(event) {
    var speechResult = event.results[0][0].transcript.toLowerCase();
    diagnosticPara.textContent = 'Услышано: -> ' + speechResult + '.';
    if(speechResult === phrase) {
      stackWords = arrayRemove(stackWords, phrase);
      nextWord(stackWords); 

      insertHTML(correctly, phrase);
      w_count = setNumberWordInStorage('rightKey')
      localStorage.setItem(String(w_count) + '_right', phrase )

      resultPara.textContent = 'Я услышал правильную фразу!';
      resultPara.style.background = 'lime';
    } else {
      
      resultPara.textContent = 'Это звучит неправильно';
      resultPara.style.background = 'red';
    }

    console.log('Confidence: ' + event.results[0][0].confidence);
  }

  recognition.onspeechend = function() {
    recognition.stop();
    testBtn.disabled = false;
    testBtn.textContent = 'Начать новый тест';
  }

  recognition.onerror = function(event) {
    testBtn.disabled = false;
    testBtn.textContent = 'Начать новый тест';
    diagnosticPara.textContent = 'Error occurred in recognition: ' + event.error;
  }
  
  recognition.onaudiostart = function(event) {
      //Fired when the user agent has started to capture audio.
      console.log('SpeechRecognition.onaudiostart');
  }
  
  recognition.onaudioend = function(event) {
      //Fired when the user agent has finished capturing audio.
      console.log('SpeechRecognition.onaudioend');
  }
  
  recognition.onend = function(event) {
      //Fired when the speech recognition service has disconnected.
      console.log('SpeechRecognition.onend');
  }
  
  recognition.onnomatch = function(event) {
      //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
      console.log('SpeechRecognition.onnomatch');
  }
  
  recognition.onsoundstart = function(event) {
      //Fired when any sound — recognisable speech or not — has been detected.
      console.log('SpeechRecognition.onsoundstart');
  }
  
  recognition.onsoundend = function(event) {
      //Fired when any sound — recognisable speech or not — has stopped being detected.
      console.log('SpeechRecognition.onsoundend');
  }
  
  recognition.onspeechstart = function (event) {
      //Fired when sound that is recognised by the speech recognition service as speech has been detected.
      console.log('SpeechRecognition.onspeechstart');
  }
  recognition.onstart = function(event) {
      //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
      console.log('SpeechRecognition.onstart');
  }
}


Array.prototype.push.apply(stackWords, phrases)
// Убрать из буфера правильно проговореные слова сохр в localStorage
for (let i=1; i <= Number(localStorage.getItem('rightKey')); i++) {
  var wrd = localStorage.getItem(String(i) + '_right')
  stackWords = arrayRemove(stackWords, wrd)
}

nextWord(stackWords);
testBtn.addEventListener('click', testSpeech);


// Проговорить текст 

var synth = window.speechSynthesis;
var inputTxt = document.querySelector('p.phrase.text');

function speak(){
  if (synth.speaking) {
      console.error('speechSynthesis.speaking');
      return;
  }
  if (inputTxt.value !== '') {
  var utterThis = new SpeechSynthesisUtterance(inputTxt.textContent);
  utterThis.onend = function (event) {
      console.log('SpeechSynthesisUtterance.onend');
  }
  utterThis.onerror = function (event) {
      console.error('SpeechSynthesisUtterance.onerror');
  }

  //utterThis.voice = synth.getVoices()[64]
  utterThis.voice = setting_voice
  //utterThis.pitch = pitch.value;
  //utterThis.rate = rate.value;
  synth.speak(utterThis);
}
}

var setting_voice = '';

inputTxt.onclick = function(event) {
  //event.preventDefault();
  setting_voice = synth.getVoices().find(obj => {
    return obj.name === localStorage.getItem("voice")
  })
  speak();
}

displayWordsFromStorage('rightKey', '_right', correctly)
displayWordsFromStorage('wrongKey', '_wrong', difficulties)


let w_count = 0
resultPara.onclick = function(event) {
  w_count = setNumberWordInStorage('wrongKey')
  let phrase = phrasePara.textContent;
  insertHTML(difficulties, phrase);
  localStorage.setItem(String(w_count) + '_wrong', phrase )
  nextWord(stackWords);
}


