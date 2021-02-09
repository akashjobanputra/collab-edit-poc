import Quill from "quill";
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { WebsocketProvider } from 'y-websocket';
import QuillCursors from "quill-cursors";

// Register QuillCursors module to add ability to show multiple cursors on the editor.
Quill.register('modules/cursors', QuillCursors);

window.addEventListener('load', () => {
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider('ws://localhost:3312', 'velotio-demo', ydoc);
  const type = ydoc.getText('Velotio-Blog');

  const editorContainer = document.getElementById('editor');
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

  const binding = new QuillBinding(type, editor, provider.awareness);

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

  window.example = { provider, ydoc, type, binding, Y }
});


/**
 * TODO:
 * ---
 * - Run server using `PORT=3312 npx y-websocket-server`
 * - run this quill demo
 * - test writing on multiple tabs
 */