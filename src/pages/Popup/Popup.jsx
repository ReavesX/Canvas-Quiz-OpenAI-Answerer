import React,{useState,useEffect} from 'react';
import logo from '../../assets/img/logo.svg';
import Greetings from '../../containers/Greetings/Greetings';
import './Popup.css';



const Popup = () => {
  const [apiKey, setApiKey] = useState("");

  useEffect(()=>{
    chrome.storage.local.get(['openaiApiKey']).then(({openaiApiKey}) => {
      setApiKey(openaiApiKey);
    })
  },[]);

  return (
    <div className="Container">
      <form>
        <div className="mb-3">
          <label htmlFor="apiKey" className="form-label">
          </label>
          <input 
          type = "text"
          className="form-control"
          id="apiKey"
          name="apiKey"
          placeholder="insert openapi key"
          value={apiKey}
          onChange={(e) =>{setApiKey(e.target.value);
          chrome.storage.local.set({ openaiApiKey: e.target.value });



          }}
          />
          <div id="apiKeyHelp" className="form-text">Go to OpenAI and get your api key from the dashboard.</div>
        </div>
      </form>
      
    </div>
  );
};

export default Popup;
