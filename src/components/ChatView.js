import React, { useState, useRef, useEffect, useContext } from 'react';
import ChatMessage from './ChatMessage';
import { ChatContext } from '../context/chatContext';
import { MdSend, MdLightbulbOutline } from 'react-icons/md';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Modal from './Modal';
import Setting from './Setting';
import PromptPerfect from './PromptPerfect';
import intents from '../Intent.json';
import TreatmentOption from './TreatmentOption';
import './ChatView.css';
import axios from 'axios'; 

const ChatView = () => {
  const messagesEndRef = useRef();
  const inputRef = useRef();
  const [formValue, setFormValue, calll] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, addMessage] = useContext(ChatContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPromptOpen, setModalPromptOpen] = useState(false);
  const [context, setContext] = useState('');
  const [setUserAnswers] = useState([]);
  const [displayedEntities, setDisplayedEntities] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [generatedData] = useState('');

  /**
   * Scrolls the chat area to the bottom.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Adds a new message to the chat.
   *
   * @param {string} newValue - The text of the new message.
   * @param {boolean} [ai=false] - Whether the message was sent by an AI or the user.
   */
  const updateMessage = (newValue, ai = false) => {
    const id = Date.now() + Math.floor(Math.random() * 1000000);
    const newMsg = {
      id: id,
      createdAt: Date.now(),
      text: newValue,
      ai: ai,
    };

    addMessage(newMsg);
  };

  /**
   * Sends our prompt to our API and get response to our request from openai.
   *
   * @param {Event} e - The submit event of the form.
   */
  const sendMessage = async (e) => {
    e?.preventDefault();
  
    const cleanPrompt = formValue.trim();
    const userMessage = cleanPrompt;
  
    setFormValue('');
    updateMessage(userMessage, false);
  
    const matchingIntent = intents.intents.find((intent) => {
      if (intent.text.includes(userMessage)) {
        return true;
      }
      if (userMessage === ' ') {
        return false;
      }
    });
  
    let response = "I'm sorry, I don't understand.";
  
    if (matchingIntent && matchingIntent.responses && matchingIntent.responses.length > 0) {
      response = matchingIntent.responses[Math.floor(Math.random() * matchingIntent.responses.length)];
      if (matchingIntent.intent === 'TreatmentType') {
        updateMessage(response, true);
        setDisplayedEntities(matchingIntent.entities);
        setContext('TimeSlotProvided');
        console.log('Hdsi')
        //const contextIntent = intents.intents.find(obj=> obj.context.out === context)
        response =
            contextIntent && contextIntent.responses.length > 0
              ? contextIntent.responses[Math.floor(Math.random() * contextIntent.responses.length)]
              : "I'm sorry, I don't understand.";
        console.log('Hisa')
        console.log("selectedOption", selectedOption)
        // function calll (selected) {
        //   handleSelectedTreatment(selected);
        // }
        console.log('Hi')
        }
    } else if (context) {
      const contextIntent = intents.intents.find((intent) => intent.context.in === context);
      if (contextIntent) {
        setContext(contextIntent.context.out);
        response =
          contextIntent.responses && contextIntent.responses.length > 0
            ? contextIntent.responses[Math.floor(Math.random() * contextIntent.responses.length)]
            : "I'm sorry, I don't understand.";
      }
    }

    if (selectedTreatment) {
      // Filter the dataset based on the selected treatment
      const filteredData = generatedData.filter(entry => entry.Service === selectedTreatment);
  
      // Select one of the Appointment Time entries
      const selectedAppointmentTime = filteredData.length > 0
        ? filteredData[Math.floor(Math.random() * filteredData.length)].AppointmentTime
        : null;
  
      // Perform linear regression on the duration where Show/NoShow is "Show"
      const showData = filteredData.filter(entry => entry.ShowNoShow === "Show");
      const durationPrediction = predictLinearRegression(showData);
  
      // Display the selected Appointment Time in a card format
      const appointmentCard = {
        id: Date.now(),
        createdAt: Date.now(),
        text: `Selected Treatment: ${selectedTreatment}\nAppointment Time: ${selectedAppointmentTime}\nPredicted Duration: ${durationPrediction} minutes`,
        ai: true,
      };
  
      // Update AI response
      addMessage(appointmentCard);
    }
  
    updateMessage(response, true);
    setUserAnswers((prevAnswers) => [...prevAnswers, userMessage]);
  };
  
  const displayAppointmentTimePrediction = (prediction) => {
    const appointmentCard = {
      id: Date.now(),
      createdAt: Date.now(),
      text: `Predicted Appointment Time: ${prediction}`,
      ai: true,
    };
  
    // Update AI response
    addMessage(appointmentCard);
  };
  
  

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage(e);
      inputRef.current.style.height = 'auto';
    }
  };

  const handleChange = (event) => {
    setFormValue(event.target.value);
  };

  const updatePrompt = async () => {
    const api = 'https://us-central1-prompt-ops.cloudfunctions.net/optimize';
    const secretKey = process.env.REACT_APP_API_KEY;

    try {
      setLoading(true);
      const response = await fetch(api, {
        headers: {
          'x-api-key': `token ${secretKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            prompt: formValue.trim(),
            targetModel: 'chatgpt',
          },
        }),
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }

      const responseData = await response.json();
      setPrompt(responseData.result.promptOptimized);
      setLoading(false);
      setModalPromptOpen(true);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleUseClicked = () => {
    setFormValue(prompt);
    setModalPromptOpen(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

//   useEffect(()=>{
//     if(selectedTreatment !== ''){
// handleSelectedTreatment(selectedTreatment);
//     }
//   },[selectedTreatment])

  useEffect(() => {
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
  }, [formValue]);

  const predictLinearRegression = (data) => {
    // Your linear regression implementation
    // This is a placeholder, replace it with your actual logic
    return Math.floor(Math.random() * 60) + 30; // Random duration between 30 and 90 minutes
  };

  const selectEntity = (selectedEntity) => {
    setFormValue(selectedEntity);
    setSelectedOption(selectedEntity);
    setDisplayedEntities([]); // Clear displayed entities after selection
    sendMessage();
  };

  const handleSelectedTreatment = async (selectedTreatment) => {
    //setSelectedTreatment(selectedTreatment);
    console.log('Hi1')
    try {
      console.log(selectedTreatment);
      const slotResponse = await axios.post("http://localhost:5000/predict_slot", selectedTreatment);
      console.log('Hi1')

      console.log(slotResponse.value)
  
      const slotData = slotResponse.data;
      console.log("This is the data Vyasa:", slotData)
      const selectedAppointmentTime = slotData['selected_appointment_time'];
      const selectedDay = slotData['selected_day'];
      console.log('Hi1')
      // Display the suggested Appointment Time and Day in the chatbot
      const promptMessage = `How about ${selectedAppointmentTime} on ${selectedDay}? (Yes/No)`;
      updateMessage(promptMessage, true);
  
      // Continue with the duration prediction...
    } catch (error) {
      console.error('Error fetching slot prediction:', error);
    }
  };
  
  
  return (
    <div className="chatview">
      <main className="chatview__chatarea">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={{ ...message }} />
        ))}
        {displayedEntities.length > 0 && (
          <div className="treatment-options">
          {displayedEntities.map((option) => (
            <TreatmentOption
              key={option}
              option={option}
              isSelected={selectedOption === option}
              const selected={selectedOption === option}
              onClick={(selected) => {
                setFormValue(selected);
                setSelectedOption(selected);
                setDisplayedEntities([]);
                setTimeout(() =>{
                  handleSelectedTreatment(selected);
                }, 3000)
                
              }}
            />
          ))}
        </div>
        )}
        <span ref={messagesEndRef}></span>
      </main>
      <form className="form" onSubmit={sendMessage}>
        <div className="flex items-stretch justify-between w-full">
          <textarea
            ref={inputRef}
            className="chatview__textarea-message"
            rows={1}
            value={formValue}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
          />
          <div className="flex items-center">
            <button type="submit" className="chatview__btn-send" disabled={!formValue}>
              <MdSend size={30} />
            </button>
            <button
              id="tooltip"
              type="button"
              className="chatview__btn-send"
              disabled={!formValue}
              onClick={updatePrompt}
            >
              {loading ? <div className="loading-spinner" /> : <MdLightbulbOutline size={30} />}
            </button>
          </div>
        </div>
        <ReactTooltip
          anchorId="tooltip"
          place="top"
          variant="dark"
          content="Help me with this prompt!"
        />
      </form>
      <Modal title="Setting" modalOpen={modalOpen} setModalOpen={setModalOpen}>
        <Setting modalOpen={modalOpen} setModalOpen={setModalOpen} />
      </Modal>
      <Modal title="Prompt Perfect" modalOpen={modalPromptOpen} setModalOpen={setModalPromptOpen}>
        <PromptPerfect
          prompt={prompt}
          onChange={setPrompt}
          onCancelClicked={() => setModalPromptOpen(false)}
          onUseClicked={handleUseClicked}
        />
      </Modal>
    </div>
  );
};

export default ChatView;
