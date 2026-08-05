const textArea = document.querySelector('#speechText');
const wordCount = document.querySelector('#wordCount');
const languageHint = document.querySelector('#languageHint');
const voiceName = document.querySelector('#voiceName');
const speakButton = document.querySelector('#speakButton');
const speakLabel = document.querySelector('#speakLabel');
const statusMessage = document.querySelector('#statusMessage');
const rate = document.querySelector('#rate');
const pitch = document.querySelector('#pitch');
let voices = [], selectedLanguage = 'en-IN', selectedGender = 'female', speaking = false;

function updateCount() { wordCount.textContent = `${textArea.value.length} / 600`; }
function preferredVoice() {
  const languagePrefix = selectedLanguage.slice(0, 2);
  const matches = voices.filter(v => v.lang.toLowerCase().startsWith(languagePrefix));
  const genderTerms = selectedGender === 'female' ? /female|zira|susan|hazel|aria|heera|kavya/i : /male|david|mark|ravi|hemant|aarav|rahul/i;
  return matches.find(v => genderTerms.test(v.name)) || matches[0] || voices.find(v => v.lang.startsWith('en'));
}
function refreshVoiceName() {
  const voice = preferredVoice();
  voiceName.textContent = voice ? voice.name.replace(/Microsoft |Google |Apple /gi, '') : 'Default device voice';
}
function loadVoices() { voices = window.speechSynthesis.getVoices(); refreshVoiceName(); }
function stopSpeech() { window.speechSynthesis.cancel(); speaking = false; speakLabel.textContent = 'Listen to your voice'; speakButton.classList.remove('playing'); }
function speak() {
  if (speaking) return stopSpeech();
  const content = textArea.value.trim();
  if (!content) { statusMessage.textContent = 'Add a few words first, then we’ll give them a voice.'; textArea.focus(); return; }
  const utterance = new SpeechSynthesisUtterance(content);
  const voice = preferredVoice();
  if (voice) { utterance.voice = voice; utterance.lang = voice.lang; } else utterance.lang = selectedLanguage;
  utterance.rate = Number(rate.value); utterance.pitch = Number(pitch.value);
  utterance.onstart = () => { speaking = true; speakLabel.textContent = 'Stop playback'; speakButton.classList.add('playing'); statusMessage.textContent = `Speaking with ${voice ? voice.name : 'your device voice'}…`; };
  utterance.onend = utterance.onerror = () => { speaking = false; speakLabel.textContent = 'Listen to your voice'; speakButton.classList.remove('playing'); statusMessage.textContent = 'Ready when you are.'; };
  window.speechSynthesis.speak(utterance);
}
textArea.addEventListener('input', updateCount);
document.querySelectorAll('[data-text]').forEach(button => button.addEventListener('click', () => { textArea.value = button.dataset.text; updateCount(); textArea.focus(); }));
document.querySelectorAll('#languageSwitch button').forEach(button => button.addEventListener('click', () => { stopSpeech(); selectedLanguage = button.dataset.lang; document.querySelectorAll('#languageSwitch button').forEach(b => b.classList.toggle('selected', b === button)); languageHint.textContent = selectedLanguage === 'hi-IN' ? 'Hindi / भारत' : 'English / India'; refreshVoiceName(); }));
document.querySelectorAll('.voice-card').forEach(button => button.addEventListener('click', () => { stopSpeech(); selectedGender = button.dataset.gender; document.querySelectorAll('.voice-card').forEach(b => b.classList.toggle('selected', b === button)); refreshVoiceName(); }));
rate.addEventListener('input', () => document.querySelector('#rateOutput').textContent = `${Number(rate.value).toFixed(1)}×`);
pitch.addEventListener('input', () => { const value = Number(pitch.value); document.querySelector('#pitchOutput').textContent = value === 1 ? 'Normal' : value > 1 ? 'Higher' : 'Lower'; });
speakButton.addEventListener('click', speak);
document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => document.querySelector(button.dataset.scroll).scrollIntoView({behavior:'smooth'})));
window.speechSynthesis.onvoiceschanged = loadVoices; loadVoices(); updateCount();
