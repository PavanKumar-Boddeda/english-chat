import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import "./App.css";

function correctSentence(sentence){

if(!sentence) return sentence;

let s = sentence.trim();

/* Capitalize first letter */
s = s.charAt(0).toUpperCase() + s.slice(1);

/* Basic word corrections */
const fixes = {
"hlo":"Hello",
"helo":"Hello",
"hiu":"Hi",
"msg":"message",
"pls":"please",
"plz":"please"
};

Object.keys(fixes).forEach(word=>{
const regex = new RegExp("\\b"+word+"\\b","gi");
s = s.replace(regex,fixes[word]);
});

/* punctuation */
if(!/[.!?]$/.test(s)){
s += ".";
}

return s;

}

export default function App(){

  const [messages,setMessages] = useState([]);
  const [text,setText] = useState("");
  const [name,setName] = useState(localStorage.getItem("chat-name"));
  const [nameInput,setNameInput] = useState("");

  const bottomRef = useRef(null);

  useEffect(()=>{

    const q = query(
      collection(db,"messages"),
      orderBy("time","asc")
    );

    const unsub = onSnapshot(q,(snapshot)=>{
      const msgs = snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }));

      setMessages(msgs);
    });

    return ()=>unsub();

  },[]);

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages]);

  const sendMessage = async ()=>{

    if(!text.trim()) return;

    const corrected = correctSentence(text);

    await addDoc(collection(db,"messages"),{
      text:text,
      corrected:corrected,
      name:name,
      time:serverTimestamp()
    });

    setText("");
  };

  const saveName = ()=>{
    if(!nameInput.trim()) return;

    setName(nameInput);
    localStorage.setItem("chat-name",nameInput);
  };

  const formatTime = (timestamp)=>{
    if(!timestamp || !timestamp.toDate) return "";

    const date = timestamp.toDate();

    return date.toLocaleTimeString([],{
      hour:"2-digit",
      minute:"2-digit"
    });
  };

  if(!name){

    return(

      <div className="login">

        <h2>Enter your name</h2>

        <input
          value={nameInput}
          onChange={(e)=>setNameInput(e.target.value)}
          placeholder="Your name"
        />

        <button onClick={saveName}>
          Join Chat
        </button>

      </div>

    );

  }

  return(

    <div className="app">

      <div className="header">
        English Practice Chat
      </div>

      <div className="chat-box">

        {messages.map((msg)=>{

          const mine = msg.name === name;

          return(

            <div
              key={msg.id}
              className={mine ? "my-message" : "other-message"}
            >

              <div className="message-header">

                <b>{msg.name}</b>

                <span className="time">
                  {formatTime(msg.time)}
                </span>

              </div>

  <div className="message-text">
  {msg.text}
</div>

{msg.corrected && msg.corrected !== msg.text && (

  <div className="correction">
    ✓ Correct: {msg.corrected}
  </div>

)}

            </div>

          );

        })}

        <div ref={bottomRef}></div>

      </div>

      <div className="input-box">

        <input
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder="Type message..."
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

    </div>

  );

}

