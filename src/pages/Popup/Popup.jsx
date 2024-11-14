import React, {useState, useEffect} from 'react';
import logo from '../../assets/img/logo.svg';
import Greetings from '../../containers/Greetings/Greetings';
import './Popup.css';

const Popup = () => {
  const [apiKey, setApiKey] = useState("");
  return (
    <div
      className="container">
      <form>
        <div className="mb-3">
              <label htmlFor="apiKey" className="form-label">
                API Key
              </label>
              <input type="text" className="form-control" id="apiKey"
                     name="apiKey"
                     placeholder="OpenAi API Key"
                     value={apiKey}
                     onChange={(e) => {setApiKey(e.target.value)}}
              />
              <div id="apiKeyHelp" className='form-text'>Go to OpenAI Api Dashboard and obtain your secret key</div>
        </div>
      </form>
    </div>
  );
};

export default Popup;
