import React, { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false ]}],
  [{ font: []}],
  [{ list: 'ordered'}, { list: 'bullet'}],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super"}],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"]
]

const SAVE_INTERVAL_MS = 5000

const TextEditor = () => {
  const { id: documentId } = useParams()
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()

  useEffect(() => {
    const socketClient = io('http://localhost:8080')
    setSocket(socketClient)
    
    return () => {
      socketClient.disconnect()
    }
  }, [])

  const editorRef = useCallback((editor) => {
    if(editor === null) return
    editor.innerHTML = ''
    const textEditor = document.createElement('div')
    editor.append(textEditor)
    const q = new Quill(textEditor, { theme: 'snow', modules: { toolbar: TOOLBAR_OPTIONS }})

    q.disable()
    q.setText('Loading document...')
    setQuill(q)
    
  }, [])

  useEffect(() => {
    if(socket == null || quill == null) return

    const handler = (delta, oldDelta, source) => {
      if (source == 'api') return 
      if (source == 'user') {
        socket.emit("send-changes", delta)
      }
    }; 

    quill.on('text-change', handler)

    return () => {
      quill.off('text-change', handler)
    }
  }, [socket, quill])

  useEffect(() => {
    if(socket == null || quill == null) return
    const handler = (delta) => {
      quill.updateContents(delta)
    }; 

    socket.on('receive-changes', handler)

    return () => {
      quill.off('receive-changes', handler)
    }
  }, [socket, quill])

  useEffect(() => {
    if(socket == null || quill == null || (documentId == null || undefined)) return

    socket.once("load-document", document => {
      quill.setText(document)
      quill.enable()
    })

    socket.emit('get-document', documentId)
  }, [socket, quill, documentId])


  useEffect(() => {
    if(socket == null || quill == null || (documentId == null || undefined)) return

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }

  }, [socket, quill, documentId])

  

  // useCallback(() => {
  //   const handler = (delta, oldDelta, source) => {
  //     if (source == 'api') return 
  //     if (source == 'user') {
  //       console.log("A user action triggered this change.");
  //       socket.emit("send-changes", delta)
  //     }
  //   }; 

  //   quill.on('text-change', handler)
  // }, [quill, socket])


  return (
    <div id='editor-container' ref={editorRef}>

    </div>
  )
}

export default TextEditor
