import Quill from "quill";
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { WebsocketProvider } from 'y-websocket';
import QuillCursors from "quill-cursors";
import { sample } from "lodash-es";

// Register QuillCursors module to add ability to show multiple cursors on the editor.
Quill.register('modules/cursors', QuillCursors);
const YJS_SERVER = process.env.YJS_SERVER;
console.log('yjs-host:', YJS_SERVER);
console.log('NODE_ENV', process.env.NODE_ENV);

const docsMap = {};
var editor, selectedRoom;
var ydoc, provider, type, binding;
var username = getRandomUsername();

function getRandomUsername() {
  return `User_${Math.random().toString(36).slice(2, 7)}`
}

function getCursorColor() {
  return sample(['blue', 'red', 'orange', 'green']);
}

function mapToJson(map) {
  return JSON.stringify([...map]);
}
function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr));
}

function loadYjsDoc(room) {
  if (binding) {
    binding.destroy();
  }
  if (!docsMap[room]) {
    const ydoc = new Y.Doc();
    provider = new WebsocketProvider(YJS_SERVER, room, ydoc);
    const type = ydoc.getText(room);
    provider.awareness.setLocalStateField('user', {
      name: username,
      color: getCursorColor()
    })
    setInterval(() => {
      const states = provider.awareness.getStates();
      console.log('JSONified states');
      console.log(mapToJson(states));
    }, 1000*10);
  
    editor = loadQuill();
    binding = new QuillBinding(type, editor, provider.awareness);
    window.example = { provider, ydoc, type, binding, Y }
    docsMap[room] = {
      ydoc, provider, type, binding
    }
  } else {
    const { ydoc, provider, type } = docsMap[room];
    editor = loadQuill();
    provider.awareness.setLocalStateField('user', {
      name: username,
      color: getCursorColor()
    });
    binding = new QuillBinding(type, editor, provider.awareness);
    window.example = { provider, ydoc, type, binding, Y }
  }
}

function cleanEditorAndToolBar() {
  const mainDiv = Array.from(document.getElementsByClassName('main'))[0];
  const toolbarsToRemove = Array.from(mainDiv.childNodes).filter(ele => ele.className === "ql-toolbar ql-snow");
  toolbarsToRemove.forEach(ele => mainDiv.removeChild(ele));
  const editorContainer = document.getElementById('editor');
  editorContainer.innerHTML = '';
}

function loadQuill() {
  const editorContainer = document.getElementById('editor');
  cleanEditorAndToolBar()
  const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
    // array for drop-downs, empty array = defaults
    [{ 'size': [] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['image', 'video'],
    ['clean']                                         // remove formatting button
  ];

  const editor = new Quill(editorContainer, {
    modules: {
      cursors: true,
      toolbar: toolbarOptions,
      history: {
        userOnly: true
      }
    },
    placeholder: "collab-edit-test",
    theme: "snow"
  });
  return editor;
}

window.addEventListener('load', () => {
  const rooms = ['demo1', 'demo2', 'demo3'];
  populateSelect('select-room', rooms);
  const usernameBox = document.getElementById('username');
  usernameBox.setAttribute('value', username);
  console.log('username', usernameBox.value);
  username = usernameBox.value;
  editor = loadQuill();
  loadYjsDoc(rooms[0]);
  const roomSelector = document.getElementById('select-room');
  roomSelector.addEventListener('change', function (ele) {
    selectedRoom = ele.target.value;
    console.log('Room Selector value', selectedRoom);
    // Change room
    loadYjsDoc(selectedRoom);
  });
  usernameBox.addEventListener('blur', function (ele) {
    username = ele.target.value ||  new Date().valueOf().toString();
    provider.awareness.setLocalStateField('user', {
      name: username,
      color: getCursorColor()
    })
  })

  const connectBtn = document.getElementById('connect-btn');
  connectBtn.addEventListener('click', () => {
    if (provider.shouldConnect) {
      provider.disconnect();
      connectBtn.textContent = 'Connect'
    } else {
      provider.connect();
      connectBtn.textContent = 'Disconnect'
    }
  });

});

function populateSelect(target, options){
  if (!target){
    return false;
  } else {
    const select = document.getElementById(target);
    options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.innerHTML = option;
      select.appendChild(opt);
    });
  }
}


/**
 * BUG: Collaborative not working cross device. Probably not able to connect to yjs server.
 * A tip from gitter:  That should be pretty simple. You simply need to clone the y-websocket repository and push it to heroku.
 * Heroku recognizes that this is a nodejs project and executes the "start" script by default (which starts the websocket server). 
 * 
 * TODO: create Map of below Samples using jsonToMap.
 * Sample1: [[2002054554,{"user":{"name":"Nis","color":"blue"},"cursor":{"anchor":{"type":null,"tname":"demo1","item":{"client":3943573794,"clock":3},"assoc":0},"head":{"type":null,"tname":"demo1","item":{"client":3943573794,"clock":3},"assoc":0}}}],[1529470841,{"user":{"name":"akashj","color":"red"},"cursor":{"anchor":{"type":null,"tname":"demo1","item":{"client":3770036896,"clock":3},"assoc":0},"head":{"type":null,"tname":"demo1","item":{"client":3770036896,"clock":3},"assoc":0}}}]]
 * Sample2: [[2002054554,{"user":{"name":"Nis","color":"blue"},"cursor":{"anchor":{"type":null,"tname":"demo1","item":null,"assoc":0},"head":{"type":null,"tname":"demo1","item":null,"assoc":0}}}],[1529470841,{"user":{"name":"akashj","color":"red"},"cursor":{"anchor":{"type":null,"tname":"demo1","item":{"client":3770036896,"clock":3},"assoc":0},"head":{"type":null,"tname":"demo1","item":{"client":3770036896,"clock":3},"assoc":0}}}]]
 * 
 * Write method to extract info, number of users, usernames and their color.
 * 
 * // "start:yjs:ser": "YPERSISTENCE=./dbDir DEBUG=y*,-y:connector-message node yjs-server.js --port 3312",
 */