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
var username = new Date().valueOf().toString();

function getCursorColor() {
  return sample(['blue', 'red', 'orange', 'green']);
}

function loadYjsDoc(room) {
  if (binding) {
    binding.destroy();
  }
  if (!docsMap[room]) {
    const ydoc = new Y.Doc();
    provider = new WebsocketProvider(YJS_SERVER, room, ydoc);
    provider.on('event', (ele) => { console.log(ele);})
    const type = ydoc.getText(room);
    provider.awareness.setLocalStateField('user', {
      name: username,
      color: getCursorColor()
    })
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
    provider.on('event', (ele) => { console.log(ele);})
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
