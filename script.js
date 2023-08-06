const SHARP_NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
//const FLAT_NOTES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

function onPageLoad(){
    createKeyCards();
    createNoteCards();
    setUpSVG();
    render('treble', 'C');
    checkMIDISupport();
}

function closeInfoBox() {
    document.getElementById("infobox").style.display = 'none';
}

function showInfoBox(message) {
    document.getElementById("infobox_text").innerHTML = message;
    document.getElementById("infobox").style.display = 'block';
}

function scrollToID(elID) {
    document.getElementById(elID).scrollIntoView({ behavior: 'smooth' });
}

function toggleShowNames() {
    let noteNameDiv = document.getElementById("renderedNoteName");
    if(document.getElementById("showNoteNames").checked){
        noteNameDiv.style.visibility = 'visible';
    }
    else {
        noteNameDiv.style.visibility = 'hidden';
    }
}

// creating and selecting key and note cards
function createKeyCards(){
    // C Major / A Minor
    let kc = document.getElementById("CMajorKeyContainer");
    const CMajKeyCard = createCard('C Major / A Minor', onKeyCardClick);
    kc.appendChild(CMajKeyCard);
    setCardSelection(CMajKeyCard, true);

    // sharp keys
    const sharpKeys = [
        'G Major / E Minor', 'D Major / B Minor', 'A Major / F# Minor',
        'E Major / C# Minor', 'B Major / G# Minor', 'F# Major / D# Minor',
        'C# Major / A# Minor'
    ];

    kc = document.getElementById("sharpKeysContainer");
    for(let k of sharpKeys) {
        kc.appendChild(createCard(k, onKeyCardClick));
    }

    // flat keys
    const flatKeys = [
        'F Major / D Minor', 'Bb Major / G Minor', 'Eb Major / C Minor',
        'Ab Major / F Minor', 'Db Major / Bb Minor', 'Gb Major / Eb Minor',
        'Cb Major / Ab Minor'
    ];

    kc = document.getElementById("flatKeysContainer");
    for(let k of flatKeys) {
        kc.appendChild(createCard(k, onKeyCardClick));
    }
}

function onKeyCardClick(e){
    const card = e.currentTarget;
    handleCardSelection(card);
}

function createNoteCards(){
    // treble clef
    const trebleClefNotes = [
        'E/3', 'F/3', 'G/3', 'A/3', 'B/3',
        'C/4', 'D/4', 'E/4', 'F/4', 'G/4', 'A/4', 'B/4',
        'C/5', 'D/5', 'E/5', 'F/5', 'G/5', 'A/5', 'B/5',
        'C/6', 'D/6', 'E/6', 'F/6', 'G/6', 'A/6', 'B/6',
        'C/7', 'D/7', 'E/7', 'F/7', 'G/7', 'A/7', 'B/7',
        'C/8'
    ];
    const tc = document.getElementById("trebleClefNoteNamesContainer");
    for(let i = 0; i < trebleClefNotes.length; i += 1){
        const n = trebleClefNotes[i];
        const card = createCard(n, onNoteCardClick);
        tc.appendChild(card);
        if(i >= 5 && i <= 19) { // select notes from C4 to C6 by default
            setCardSelection(card, true);
        }
    }

    // bass clef
    const bassClefNotes = [
        'A/0', 'B/0',
        'C/1', 'D/1', 'E/1', 'F/1', 'G/1', 'A/1', 'B/1',
        'C/2', 'D/2', 'E/2', 'F/2', 'G/2', 'A/2', 'B/2',
        'C/3', 'D/3', 'E/3', 'F/3', 'G/3', 'A/3', 'B/3',
        'C/4', 'D/4', 'E/4', 'F/4', 'G/4', 'A/4',
    ];
    const bc = document.getElementById("bassClefNoteNamesContainer");
    for(let i = 0; i < bassClefNotes.length; i += 1){
        const n = bassClefNotes[i];
        const card = createCard(n, onNoteCardClick);
        bc.appendChild(card);
        if(i >= 9 && i <= 23) { // select notes from C2 to C4 by default
            setCardSelection(card, true);
        }
    }
}

function onNoteCardClick(e){
    const card = e.currentTarget;
    handleCardSelection(card);
}

function createCard(text, clickHandler) {
    const noteCard = document.createElement("div");
    noteCard.innerHTML = text;
    noteCard.onclick = clickHandler;
    noteCard.className = "note_card";
    return noteCard;
}

function setCardSelection(card, shouldSelect){
    if(TEST_IS_ACTIVE){
        stopTesting();
    }
    if(shouldSelect) {
        card.classList.add("selected_note_card");
    }
    else {
        card.classList.remove("selected_note_card");
    }
}

function cardIsSelected(card) {
    return card.classList.contains("selected_note_card");
}

function selectAll(containerID) {
    for (let c of document.getElementById(containerID).getElementsByClassName("note_card")) {
        setCardSelection(c, true);
    }
}

function selectNone(containerID) {
    for (let c of document.getElementById(containerID).getElementsByClassName("note_card")) {
        setCardSelection(c, false);
    }
}

function invertSelection(containerID) {
    for (let c of document.getElementById(containerID).getElementsByClassName("note_card")) {
        setCardSelection(c, !cardIsSelected(c));
    }
}

// range selection functionality
const RangeSelectionState = {
    NotActive: 0,
    Initiated: 1,
    FirstCardSelected: 2,
};
Object.freeze(RangeSelectionState);

let RANGE_SELECTION_STATE = RangeSelectionState.NotActive;
let RANGE_SELECTION_CONTAINER_ID = "";
let RANGE_SELECTION_FIRST_SELECTED_CARD = null;

function onRangeSelectionBtnClick(event, containerID){
    if(TEST_IS_ACTIVE){
        stopTesting();
    }

    const clickedButton = event.currentTarget;
    // clicking on a button for the second time cancels range selection
    if(clickedButton.classList.contains("active_btn")){
        cancelRangeSelection();
        return;
    }

    // cancel range selection initiated for other containers
    for(let b of document.getElementsByClassName("active_btn")){
        b.classList.remove("active_btn");
    }
    clickedButton.classList.add("active_btn");
    RANGE_SELECTION_CONTAINER_ID = containerID;
    RANGE_SELECTION_STATE = RangeSelectionState.Initiated;
}

function selectRange(card1, card2){
    if(card1 === card2){
        setCardSelection(card1, true);
        return;
    }

    const container = card1.parentElement;
    let selectionStage = 0;
    for(let c of container.getElementsByClassName("note_card")){
        if(c === card1 || c === card2){
            selectionStage += 1;
        }

        if(selectionStage > 0){
            setCardSelection(c, true);
        }

        if(selectionStage === 2){
            break;
        }
    }
}

function cancelRangeSelection(){
    RANGE_SELECTION_CONTAINER_ID = "";
    RANGE_SELECTION_STATE = RangeSelectionState.NotActive;
    for(let b of document.getElementsByClassName("active_btn")){
        b.classList.remove("active_btn");
    }
}


function handleCardSelection(card){
    // cancel range selection if the card is not in the container
    // for which range selection was initiated
    if(
        RANGE_SELECTION_STATE !== RangeSelectionState.NotActive
        && card.parentElement.id !== RANGE_SELECTION_CONTAINER_ID
    ) {
        cancelRangeSelection();
    }

    switch(RANGE_SELECTION_STATE){
        case RangeSelectionState.NotActive:
            setCardSelection(card, !cardIsSelected(card));
            break;
        case RangeSelectionState.Initiated:
            setCardSelection(card, true);
            RANGE_SELECTION_FIRST_SELECTED_CARD = card;
            RANGE_SELECTION_STATE = RangeSelectionState.FirstCardSelected;
            break;
        case RangeSelectionState.FirstCardSelected:
            selectRange(RANGE_SELECTION_FIRST_SELECTED_CARD, card);
            for(let b of document.getElementsByClassName("active_btn")){
                b.classList.remove("active_btn");
            }
            RANGE_SELECTION_FIRST_SELECTED_CARD = null;
            RANGE_SELECTION_STATE = RangeSelectionState.NotActive;
            break;
    }
}

// svg
function setUpSVG(){
    const svg = document.getElementById("piano_keyboard_svg").contentDocument;
    svg.addEventListener('click', onSVGClick);
}


function hideSVGKeyboard(){
    const svgObj = document.getElementById("piano_keyboard_svg");
    svgObj.style.display = "none";

    const ignoreOctaveCheckBox = document.getElementById("ignoreOctaveNumber");
    ignoreOctaveCheckBox.checked = false;
    ignoreOctaveCheckBox.disabled = false;
    document.getElementById("ignoreOctaveNumberLabel").classList.remove("disabled");
}


function onSVGClick(e) {
    if(!TEST_IS_ACTIVE) {
        return;
    }
    const noteName = e.target.id;
    // svg keyboard uses note names with sharps as rect ids
    const noteNumber = SHARP_NOTES.indexOf(noteName);
    // octave number should be ignored when using SVG keyboard
    checkNote(noteNumber, 0);
}


// rendering notes
function render(clef, key, note) {
    const canvas = document.createElement('canvas');
    canvas.className = "renderCanvas";
    const container = document.getElementById("renderedNote");
    container.innerHTML = "";
    container.appendChild(canvas);

    const { Renderer, Stave } = Vex.Flow;
    const renderer = new Renderer(canvas, Renderer.Backends.CANVAS);

    renderer.resize(400, 250);
    const context = renderer.getContext();
    //context.setFont('Arial', 10);

    const stave = new Stave(10, 75, 350);
    stave.addClef(clef).addTimeSignature('4/4').setKeySignature(key);
    stave.setContext(context).draw();

    if(note == null || note == ""){
        return;
    }

    const notes = [
        new Vex.Flow.StaveNote({ clef: clef, keys: [note], duration: "w" })
    ];

    const voice = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables(notes);
    new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 350);
    voice.draw(context, stave);
}

// MIDI keyboard
function checkMIDISupport() {
    if (navigator.requestMIDIAccess) {
        navigator
            .requestMIDIAccess()
            .then(onMIDISuccess, onMIDIFailure);
    }
    else {
        showInfoBox(
            "No Web MIDI support. You may need to enable it your browser. "
            + "Or you can use the on-screen keyboard."
        );
    }
}


function onMIDISuccess(midiAccess) {
    let inputsCount = 0;
    for (let input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
        inputsCount += 1;
    }

    if(inputsCount === 0) {
        showInfoBox("No MIDI devices found. You can use the on-screen keyboard.");
    }
    else {
        closeInfoBox();
        hideSVGKeyboard();
    }
}

function onMIDIFailure() {
    showInfoBox("Could not access MIDI devices. You can use the on-screen keyboard.");
}

function getMIDIMessage(message) {
    const command = message.data[0];
    const note = message.data[1];
    // a velocity value might not be included with a noteOff command
    const velocity = (message.data.length > 2) ? message.data[2] : 0;

    switch (command) {
        case 144: // noteOn
            if (velocity > 0) {
                noteOn(note, velocity);
            }
            else {
                noteOff(note);
            }
            break;
        case 128: // noteOff
            noteOff(note);
            break;
    }
}

function noteOn(noteCode) {
    if(!TEST_IS_ACTIVE){
        return;
    }
    const noteNumber = noteCode % 12;
    const octaveNumber = Math.floor(noteCode / 12) - 1;
    checkNote(noteNumber, octaveNumber);
}

function noteOff(noteCode) {
    return;
}

// test itself
let TEST_IS_ACTIVE = false;
let CORRECT_ANSWERS = 0;
let INCORRECT_ANSWERS = 0;
let SELECTED_KEYS = [];
let SELECTED_TREBLE_CLEF_NOTES = [];
let SELECTED_BASS_CLEF_NOTES = [];

function startTesting() {
    cancelRangeSelection();
    const keyContainers = ["CMajorKeyContainer", "sharpKeysContainer", "flatKeysContainer"];
    SELECTED_KEYS = [];
    for(let containerID of keyContainers){
        for (let card of document.getElementById(containerID).getElementsByClassName("note_card")) {
            if(cardIsSelected(card)){
                const cardText = card.textContent;
                const key = cardText.split(' ')[0];
                SELECTED_KEYS.push(key);
            }
        }
    }

    if(SELECTED_KEYS.length === 0){
        showInfoBox("No keys selected");
        return;
    }

    SELECTED_TREBLE_CLEF_NOTES = [];
    SELECTED_BASS_CLEF_NOTES = [];

    const trebleClefContainer = document.getElementById("trebleClefNoteNamesContainer");
    for (let card of trebleClefContainer.getElementsByClassName("note_card")) {
        if(cardIsSelected(card)) {
            SELECTED_TREBLE_CLEF_NOTES.push(card.textContent);
        }
    }

    const bassClefContainer = document.getElementById("bassClefNoteNamesContainer");
    for (let card of bassClefContainer.getElementsByClassName("note_card")) {
        if(cardIsSelected(card)) {
            SELECTED_BASS_CLEF_NOTES.push(card.textContent);
        }
    }

    if(SELECTED_TREBLE_CLEF_NOTES.length === 0 && SELECTED_BASS_CLEF_NOTES.length === 0){
        showInfoBox("No notes selected");
        return;
    }

    TEST_IS_ACTIVE = true;
    updateScore(0, 0);
    pickRandomNote();
    closeInfoBox();
}

function stopTesting(){
    if(!TEST_IS_ACTIVE){
        return;
    }
    TEST_IS_ACTIVE = false;
    updateScore(0, 0);
    render("treble", "C");
    document.getElementById('renderedNoteName').innerHTML = "";
}

const SHARP_KEYS = {
    'G':  ['F'],
    'D':  ['F', 'C'],
    'A':  ['F', 'C', 'G'],
    'E':  ['F', 'C', 'G', 'D'],
    'B':  ['F', 'C', 'G', 'D', 'A'],
    'F#': ['F', 'C', 'G', 'D', 'A', 'E'],
    'C#': ['F', 'C', 'G', 'D', 'A', 'E', 'B'],
};

const FLAT_KEYS = {
    'F':  ['B'],
    'Bb': ['B', 'E'],
    'Eb': ['B', 'E', 'A'],
    'Ab': ['B', 'E', 'A', 'D'],
    'Db': ['B', 'E', 'A', 'D', 'G'],
    'Gb': ['B', 'E', 'A', 'D', 'G', 'C'],
    'Cb': ['B', 'E', 'A', 'D', 'G', 'C', 'F'],
}

let TEST_NOTE_NUMBER = 0;
let TEST_OCTAVE_NUMBER = 0;

function pickRandomNote() {
    const key = getRandomArrayElement(SELECTED_KEYS);
    const clefs = [];
    if(SELECTED_TREBLE_CLEF_NOTES.length !== 0){
        clefs.push("treble");
    }
    if(SELECTED_BASS_CLEF_NOTES.length !== 0){
        clefs.push("bass");
    }
    const clef = getRandomArrayElement(clefs);
    const notesArr = clef === "treble" ? SELECTED_TREBLE_CLEF_NOTES : SELECTED_BASS_CLEF_NOTES;
    const note = getRandomArrayElement(notesArr);

    render(clef, key, note);

    const noteAndOctave = note.split('/');
    let noteName = noteAndOctave[0];
    TEST_OCTAVE_NUMBER = parseInt(noteAndOctave[1]);
    // noteName never contains a sharp or a flat sign
    TEST_NOTE_NUMBER = SHARP_NOTES.indexOf(noteName);

    if(SHARP_KEYS.hasOwnProperty(key) && SHARP_KEYS[key].includes(noteName)){
        TEST_NOTE_NUMBER += 1;
        noteName += "♯";
        if(TEST_NOTE_NUMBER === 12){
            TEST_NOTE_NUMBER = 0;
            TEST_OCTAVE_NUMBER += 1;
        }
    }

    if(FLAT_KEYS.hasOwnProperty(key) && FLAT_KEYS[key].includes(noteName)){
        TEST_NOTE_NUMBER -= 1;
        noteName += "♭";
        if(TEST_NOTE_NUMBER === -1) {
            TEST_NOTE_NUMBER = 11;
            TEST_OCTAVE_NUMBER -= 1;
        }
    }

    document.getElementById('renderedNoteName').innerHTML = noteName;
}

function getRandomArrayElement(arr){
    return arr[Math.floor(Math.random() * arr.length)];
}

function checkNote(noteNumber, octaveNumber){
    const ignoreOctave = document.getElementById("ignoreOctaveNumber").checked;
    if(noteNumber === TEST_NOTE_NUMBER){
        if(!ignoreOctave && octaveNumber !== TEST_OCTAVE_NUMBER){
            const errorSize = Math.abs(TEST_OCTAVE_NUMBER - octaveNumber);
            const errorDirection = TEST_OCTAVE_NUMBER > octaveNumber ? "lower" : "higher";
            let errMsg =
                "You pressed the right note but "
                + `${errorSize} octave${errorSize > 1 ? "s" : ""} ${errorDirection}. `
                + "Try again. (You can use octave shift buttons on your MIDI keyboard "
                + "or check 'Ignore octave number' checkbox if you have a small MIDI keyboard.)";
            showInfoBox(errMsg);
        }
        else{
            closeInfoBox();
            updateScore(CORRECT_ANSWERS + 1, INCORRECT_ANSWERS);
            pickRandomNote();
        }
    }
    else{
        closeInfoBox();
        updateScore(CORRECT_ANSWERS, INCORRECT_ANSWERS + 1);
    }
}

function updateScore(newCorrectAnswers, newIncorrectAnswers){
    if(CORRECT_ANSWERS !== newCorrectAnswers){
        CORRECT_ANSWERS = newCorrectAnswers;
        document.getElementById('correct_answers').innerHTML =
            `<span class="right_answer">Correct: ${CORRECT_ANSWERS}</span>`;
    }
    if(INCORRECT_ANSWERS !== newIncorrectAnswers){
        INCORRECT_ANSWERS = newIncorrectAnswers;
        document.getElementById('incorrect_answers').innerHTML =
            `<span class="wrong_answer">Incorrect: ${INCORRECT_ANSWERS}</span>`;
    }
}
