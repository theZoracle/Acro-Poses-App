import React, { Component } from 'react';
import './App.css';

// Pose data organized by levels
const posesByLevel = {
  level1: ["bird", "folded leaf", "straddle bat", "whale", "back bend", "jedi plank", "throne", "foot to shin", "mermaid", "chair"],
  level2: ["reverse bird", "bow", "foot to hand", "reverse throne", "star", "side star", "shin to foot", "bird on hands", "floating poshi", "hammock"],
  level3: ["reverse side star", "inside side star", "outside side star", "inside reverse side star", "outside reverse side star", "side star", "foot to hand extended", "supported candle stick", "free side star"],
  level4: ["unsupported candle stick", "croc", "bicep stand", "free star", "foot to foot"]
};


// Random transition phrases
const transitionPhrases = [
  "Great! Let's move into ", "Good job! Now try ", "Next up, let's do ", 
  "Awesome! Time for ", "You're doing great! Let's go to ", "Now switch to ", 
  "Keep going! Next pose is ", "Fantastic! Let's do ", "Excellent! Now, move into ", 
  "Nice work! Now try "
];

// Random starting phrases
const startPhrases = [
  "Let's get started. Start off in ", "Here we go! Begin with ", 
  "Welcome! Let's start with ", "Alright, let's begin in ", "Start things off with "
];

class SetupScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localSelectedPoses: props.selectedPoses,
      timerInterval: 30
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedPoses !== this.props.selectedPoses) {
      this.setState({ localSelectedPoses: this.props.selectedPoses });
    }
  }

  handleLevelSelection = (level) => {
    const poses = posesByLevel[level];
    this.setState((prevState) => {
      const newPoses = prevState.localSelectedPoses.includes(poses[0]) 
        ? prevState.localSelectedPoses.filter(p => !poses.includes(p)) 
        : [...new Set([...prevState.localSelectedPoses, ...poses])];
      return { localSelectedPoses: newPoses };
    });
  };

  handlePoseSelection = (pose) => {
    this.setState((prevState) => 
      prevState.localSelectedPoses.includes(pose) 
        ? { localSelectedPoses: prevState.localSelectedPoses.filter(p => p !== pose) } 
        : { localSelectedPoses: [...prevState.localSelectedPoses, pose] }
    );
  };

  handleSubmit = () => {
    this.props.onSetupComplete(this.state.localSelectedPoses, this.state.timerInterval);
  };

  render() {
    const { localSelectedPoses, timerInterval } = this.state;

    return (
      <div>
        <h1>Setup Your Poses</h1>
        <div>
          {Object.keys(posesByLevel).map(level => (
            <div key={level}>
              <h2>
                <label>
                  <input type="checkbox" 
                         checked={localSelectedPoses.some(p => posesByLevel[level].includes(p))} 
                         onChange={() => this.handleLevelSelection(level)} />
                </label>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </h2>

              {posesByLevel[level].map(pose => (
                <div key={pose}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={localSelectedPoses.includes(pose)} 
                      onChange={() => this.handlePoseSelection(pose)} 
                    />
                    {pose}
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div><p></p>
          <label>
            Timer Interval (seconds):
            <input 
              type="number" 
              value={timerInterval} 
              onChange={(e) => this.setState({ timerInterval: Number(e.target.value) })} 
              min="1" 
            />
          </label>
        </div><p></p>
        <button onClick={this.handleSubmit}>Start</button>
      </div>
    );
  }
}

class AcroPoseApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPose: '',
      isRunning: false,
      countdown: 5,
      isPaused: false,
      selectedPoses: [],
      timerInterval: 5,
      isSetup: true // New state to control navigation
    };
    this.countdownRef = React.createRef();
    this.speechRef = React.createRef();
  }

  getRandomPose = () => {
    const newPose = this.state.selectedPoses[Math.floor(Math.random() * this.state.selectedPoses.length)];
    return newPose;
  };

  getDifferentPose = (currentPose) => {
    let newPose;
    do {
      newPose = this.getRandomPose();
    } while (newPose === currentPose);
    return newPose;
  };

  getRandomTransitionPhrase = () => {
    return transitionPhrases[Math.floor(Math.random() * transitionPhrases.length)];
  };

  getRandomStartPhrase = () => {
    return startPhrases[Math.floor(Math.random() * startPhrases.length)];
  };

  speakPose = (pose, isStarting, callback) => {
    if (this.speechRef.current) {
      speechSynthesis.cancel();
    }

    const speech = new SpeechSynthesisUtterance();
    speech.text = isStarting ? this.getRandomStartPhrase() + pose : this.getRandomTransitionPhrase() + pose;

    speech.onend = () => {
      if (callback) {
        callback();
      }
    };

    speechSynthesis.speak(speech);
    this.speechRef.current = speech;
  };

  startTimer = () => {
    if (!this.state.isRunning) {
      const initialPose = this.getRandomPose();
      this.setState({ currentPose: initialPose, isRunning: true, countdown: this.state.timerInterval });
      this.speakPose(initialPose, true, () => {
        this.startCountdown(this.state.timerInterval);
      });
    }
  };

  startCountdown = (initialCountdown) => {
    this.setState({ countdown: initialCountdown });
    this.countdownRef.current = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.countdown <= 1) {
          clearInterval(this.countdownRef.current);
          const newPose = this.getDifferentPose(prevState.currentPose); // Get a new pose that is different
          this.setState({ currentPose: newPose }, () => {
            this.speakPose(newPose, false, () => {
              this.startCountdown(this.state.timerInterval); // Start the next countdown
            });
          });
          return { countdown: 0 }; // Reset countdown to zero
        }
        return { countdown: prevState.countdown - 1 };
      });
    }, 1000);
  };

  handleSetupComplete = (poses, interval) => {
    this.setState({ selectedPoses: poses, timerInterval: interval, isSetup: false }, this.startTimer);
  };

  handleSetupClick = () => {
    this.setState({
      isSetup: true, // Set to true to show the setup screen
      currentPose: '',
      isRunning: false,
    });
    this.clearIntervals();
  };

  clearIntervals = () => {
    if (this.countdownRef.current) {
      clearInterval(this.countdownRef.current);
      this.countdownRef.current = null; // Clear reference
    }
    if (this.speechRef.current) {
      speechSynthesis.cancel();
    }
  };

  componentWillUnmount() {
    this.clearIntervals();
  }

  togglePause = () => {
    if (this.state.isPaused) {
      // Resume countdown from the current countdown value
      this.setState({ isPaused: false }, () => {
        this.startCountdown(this.state.countdown); // Start a new interval with the stored count
      });
    } else {
      // Pause the timer
      this.setState({ isPaused: true });
      clearInterval(this.countdownRef.current); // Clear the current interval
    }
  };

  render() {
    const { currentPose, countdown, isPaused, selectedPoses, isSetup } = this.state;

    return (
      <div>
        {isSetup ? (
          <SetupScreen 
            onSetupComplete={this.handleSetupComplete} 
            selectedPoses={this.state.selectedPoses} // Pass current selected poses to setup
          />
        ) : (
          <div>
            <h1>Current Pose: {currentPose}</h1>
            <h2>Time Remaining: {countdown}</h2>
            <button onClick={this.togglePause}>
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button onClick={this.handleSetupClick}>Setup</button>
          </div>
        )}
      </div>
    );
  }
}

export default AcroPoseApp;
