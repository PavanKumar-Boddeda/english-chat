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

async function correctSentence(text) {

  try {

    const response = await fetch(
      "https://api.languagetool.org/v2/check",
    console.log(data);     
 {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          text: text,
          language: "en-US"
        })
      }
    );

    const data = await response.json();

    let corrected = text;

    // Apply corrections from LAST to FIRST
    const matches = data.matches.sort(
      (a, b) => b.offset - a.offset
    );

    matches.forEach(match => {

      if (match.replacements.length > 0) {

        const suggestion = match.replacements[0].value;

        corrected =
          corrected.slice(0, match.offset) +
          suggestion +
          corrected.slice(match.offset + match.length);

      }

    });

    return corrected;

  } catch (error) {

    console.log("Grammar API error:", error);
    return text;

  }

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
      orderBy("time")
    );

    const unsub = onSnapshot(q,(snapshot)=>{
      setMessages(snapshot.docs.map(doc=>doc.data()));
    });

    return ()=>unsub();

  },[]);

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages]);

  const sendMessage = async () => {

  if (!text.trim()) return;

  const corrected = await correctSentence(text);

  await addDoc(collection(db, "messages"), {
    text: text,
    corrected: corrected,
    name: name,
    time: serverTimestamp()
  });

  setText("");

};

  const saveName = ()=>{
    if(!nameInput.trim()) return;

    setName(nameInput);
    localStorage.setItem("chat-name",nameInput);
  };

   const formatTime = (timestamp) => {

  if (!timestamp) return "";

  // if Firebase Timestamp
  if (timestamp.toDate) {
    const date = timestamp.toDate();

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  // if normal JS date
  const date = new Date(timestamp);

  if (isNaN(date)) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
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

      <h1>English Practice Chat</h1>

      <div className="chat-box">

        {messages.map((msg,i)=>{

          const mine = msg.name === name;

          return(

            <div
              key={i}
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
