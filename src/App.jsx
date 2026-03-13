import { useState, useEffect } from "react";
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
if(!sentence) return sentence

const first = sentence.charAt(0).toUpperCase()
const rest = sentence.slice(1)

return first + rest
}

export default function App(){

const [messages,setMessages] = useState([])
const [text,setText] = useState("")
const [name,setName] = useState(localStorage.getItem("chat-name") || "")
const [nameInput,setNameInput] = useState("")

useEffect(()=>{

const q = query(
collection(db,"messages"),
orderBy("time")
)

const unsub = onSnapshot(q,(snapshot)=>{
setMessages(snapshot.docs.map(doc=>doc.data()))
})

return ()=>unsub()

},[])

const sendMessage = async ()=>{

if(!text.trim()) return

const corrected = correctSentence(text)

await addDoc(collection(db,"messages"),{
text:text,
corrected:corrected,
name:name,
time:serverTimestamp()
})

setText("")
}

const saveName = ()=>{
if(!nameInput.trim()) return

setName(nameInput)
localStorage.setItem("chat-name",nameInput)
}

const formatTime = (timestamp)=>{
if(!timestamp) return ""

const date = timestamp.toDate()

return date.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
})
}

if(!name){

return(

<div className="login">

<h2>Enter your name</h2>

<input
value={nameInput}
onChange={(e)=>setNameInput(e.target.value)}
placeholder="Your name"
/>

<button onClick={saveName}>Join Chat</button>

</div>

)

}

return(

<div className="app">

<h1>English Learning Chat</h1>

<div className="chat-box">

{messages.map((msg,i)=>{

const mine = msg.name === name

return(

<div
key={i}
className={mine ? "my-message":"other-message"}
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

{msg.corrected !== msg.text &&(

<div className="correction">
{msg.corrected}
</div>

)}

</div>

)

})}

</div>

<div className="input-box">

<input
value={text}
onChange={(e)=>setText(e.target.value)}
placeholder="Type message..."
/>

<button onClick={sendMessage}>Send</button>

</div>

</div>

)

}
