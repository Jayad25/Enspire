import React from "react";
import { withRouter } from "react-router-dom";
import "./grammar.css"
import conversation from './conversation';
import interview from './interview';

class GrammarForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      prevs: "",
      idvView: "",
      stream: false,
      prompt: "",
      name: ''
    };

    this.topic = 'Conversation'
    this.prompt = conversation;

    this.transcript = "";
    this.handleSpeech = this.handleSpeech.bind(this);

    this.speaker = new SpeechSynthesisUtterance();
    this.speaker.lang = "en-US";
    this.speaker.text = "Welcome To Enspire";
    speechSynthesis.speak(this.speaker);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderErrors = this.renderErrors.bind(this);
    this.updatetext = this.updatetext.bind(this);
    this.updateName = this.updateName.bind(this)
    this.renderLastCorrect = this.renderLastCorrect.bind(this);
    this.handlePormpt = this.handlePormpt.bind(this);
  }

  handleSpeech(e) {
    e.preventDefault();
    let SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (this.state.stream) {
      this.setState({ stream: false });
      this.recognition.stop();
      this.recognition.removeEventListener("end", this.recognition.start);
      this.recognition = null;

      this.setState({ text: this.transcript });
    } else {
      this.setState({ stream: true });

      this.recognition = new SpeechRecognition();
      this.recognition.interimResults = true;

      const texts = document.querySelector(".text");

      let p = document.createElement("p");
      texts.appendChild(p);

      this.recognition.addEventListener("result", e => {
        const transcript = Array.from(e.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join("");

        p.textContent = transcript;
        if (e.results[0].isFinal) {
          this.transcript += p.textContent + ". ";
          this.setState({ text: this.transcript });
          p = document.createElement("p");
          texts.appendChild(p);
        }
      });

      this.recognition.start();
      this.recognition.addEventListener("end", this.recognition.start);
    }
  }

  componentWillMount() {
    this.props.fetchCorrections();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.allCorrections) {
      this.setState({ prevs: Object.values(nextProps.allCorrections) });
    }
  }

  updatetext(e) {
    this.setState({
      text: e.currentTarget.value
    });
  }
  updateName(e) {
    this.setState({
      name: e.currentTarget.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();

      let obj = {text:this.state.text, name:this.state.name}
    this.props.correct(obj);
  }

  renderLastCorrect() {
    let responses = this.props.lastCorrection;
    if (!responses) return null;
    let result = [];

    for (let i = 0; i < responses.correcttext.length; i++) {
      const errs = responses.correcttext[i];
      const bad = errs.bad;
      const type = errs.type;
      const better = errs.better.slice(0, 2).join(" , ");

      result.push(<div  key={i}>
        <ul className="error-list">
          <li className="error-title">Error {i + 1}</li>
          <li><span className='bold'>Type:</span> {type} </li>
          <li><span className='bold'>Mistake:</span> {bad}</li>
          <li><span className='bold'>Fix:</span> {better}</li>
        </ul>
        </div>);
    }
    return result;
  }

  speak(text, e) {
    if (e) {
      e.preventDefault()
    }
    this.speaker.text = text;
    speechSynthesis.speak(this.speaker);
  }

  handlePormpt() {
    let idx = (this.prompt.indexOf(this.state.prompt) + 1) % this.prompt.length;
    let text = this.prompt[idx];
    this.setState({ prompt: text });
    this.speak(text);
  }

  changeTopic() {
    if (this.prompt[2] === interview[2]) {
      this.prompt = conversation
      this.topic = "Conversation"
      this.speak("Topic changed to Conversation");
    } else {
      this.prompt = interview
      this.topic = "Interview";
      this.speak("Topic changed to Interview");
    }
    this.setState({prompt: ''})
  }

  renderErrors() {
    return (
      <ul>
        {Object.keys(this.props.errors).map((error, i) => (
          <li key={`error-${i}`}>{this.props.errors[error]}</li>
        ))}
      </ul>
    );
  }

  render() {
    let numErros;
    if (this.props.lastCorrection) {
      numErros = this.props.lastCorrection.correcttext.length;
    }

    let buttonText = this.state.stream ? "Stop" : "Record";

    return <div className="grammar-page">
        <br />
  
        <div className="grammar-box">
          <div className="flex">
            <button className="change-button" onClick={this.changeTopic.bind(this)}>
              Change Topic
            </button>
            <h1 className="interview">{this.topic}</h1>
          </div>

          <div className="flex">
            <button className="change-button" onClick={this.handlePormpt.bind(this)}>
              New Prompt
            </button>
            {/* {this.speak(this.state.prompt)} */}
            <h2 className="interview">{this.state.prompt}</h2>
          </div>

          <h3 className="render-errors">{this.renderErrors()}</h3>
          <br />

          <div className="flex-right">
            <div className="interview">
              Title:
              <input className="title-input" placeholder="Enter Title of Recording" type="text" onChange={this.updateName} value={this.state.name} />
            </div>
          
            <button className="record-button" onClick={this.handleSpeech}>
              {buttonText}
            </button>
          </div>

          <form onSubmit={this.handleSubmit}>
            <div>
              <textarea className="text-input" value={this.state.text} onChange={this.updatetext} />
            </div>

            <div className="flex-right">
              <button className="hidden" />
              <div>
                <button className="grammar-button" onClick={() => this.speak(this.state.text)}>
                  Read Text
                </button>
                <input className="grammar-button" type="submit" value="Check Grammar" />
              </div>
            </div>
          </form>

          <div>
            {/* <h3> Number of errors: {numErros} </h3> */}
            <div className='flex'>{this.renderLastCorrect()}</div>
          </div>
        </div>

      <div className="text super-hidden"></div> 
      
      </div>;
  }
}

export default withRouter(GrammarForm);
