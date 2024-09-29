import React, { useState, useRef, useEffect } from 'react';

// Pose data
const poses = ["bird", "folded leaf", "straddle bat", "bow", "whale", "back bend", "jedi plank", "star", "reverse star", "throne", "reverse throne", "reverse bird", "side star", "reverse side star", "inside side star", "inside reverse side star", "outside side star", "reverse outside side star", "foot to shin", "foot to hand", "shin to foot", "foot to hand extended", "bird on hands"];

// Random transition phrases
const transitionPhrases = [
  "Great! Let's move into ",
  "Good job! Now try ",
  "Next up, let's do ",
  "Awesome! Time for ",
  "You're doing great! Let's go to ",
  "Now switch to ",
  "Keep going! Next pose is ",
  "Fantastic! Let's do ",
  "Excellent! Now, move into ",
  "Nice work! Now try "
];

// Random starting phrases
const startPhrases = [
  "Let's get started. Start off in ",
  "Here we go! Begin with ",
  "Welcome! Let's start with ",
  "Alright, let's begin in ",
  "Start things off with "
];

function AcroPoseApp() {
  const [currentPose, setCurrentPose] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(5); // Set initial countdown to 5 seconds
  const [isPaused, setIsPaused] = useState(false); // New state to track if paused
  const [isFirstStart, setIsFirstStart] = useState(true); // New state to track first start
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const speechRef = useRef(null); // Keep track of ongoing speech synthesis

  // Function to get a random pose
  const getRandomPose = (prevPose) => {
    let newPose = prevPose;
    while (newPose === prevPose) {
      newPose = poses[Math.floor(Math.random() * poses.length)];
    }
    return newPose;
  };

  // Function to get a random transition phrase
  const getRandomTransitionPhrase = () => {
    return transitionPhrases[Math.floor(Math.random() * transitionPhrases.length)];
  };

  // Function to get a random start phrase
  const getRandomStartPhrase = () => {
    return startPhrases[Math.floor(Math.random() * startPhrases.length)];
  };

  // Function to speak the pose and wait for it to finish
  const speakPose = (pose, isStarting, callback) => {
    if (speechRef.current) {
      speechSynthesis.cancel(); // Stop any ongoing speech
    }

    const speech = new SpeechSynthesisUtterance();
    if (isStarting) {
      speech.text = getRandomStartPhrase() + pose;
    } else {
      speech.text = getRandomTransitionPhrase() + pose;
    }

    // Start the countdown after the audio finishes
    speech.onend = () => {
      if (callback) {
        callback(); // Call the callback function (start the countdown)
      }
    };

    speechSynthesis.speak(speech);
    speechRef.current = speech; // Track the active speech synthesis
  };

  // Function to start or resume the timer
  const startTimer = () => {
    if (isFirstStart) {
      // On first start, initialize the first pose and set isFirstStart to false
      const initialPose = getRandomPose('');
      setCurrentPose(initialPose);
      setIsFirstStart(false); // Set it to false after first start

      // Speak the initial pose with a welcome intro
      speakPose(initialPose, true, () => {
        startCountdownAndInterval(); // Start countdown and pose switching
      });
    } else if (isPaused) {
      // If paused, just resume the countdown without resetting the pose
      setIsPaused(false);
      startCountdown(countdown); // Resume from the paused countdown value
    } else {
      // If not paused, just switch to a new pose and start
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }

      const newPose = getRandomPose(currentPose);
      setCurrentPose(newPose);

      // Speak the new pose and start the countdown after speech
      speakPose(newPose, false, () => {
        startCountdownAndInterval(); // Start countdown and pose switching
      });
    }
  };

  // Function to handle countdown and then switch pose
  const startCountdownAndInterval = () => {
    startCountdown(5); // Reset the countdown to 5 seconds
  };

  // Countdown logic
  const startCountdown = (initialCountdown) => {
    setCountdown(initialCountdown); // Set the countdown to the given value

    countdownRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown === 1) {
          clearInterval(countdownRef.current); // Stop countdown at 0
          nextPose(); // Switch to the next pose
          return 5;
        }
        return prevCountdown - 1; // Decrease countdown
      });
    }, 1000);
  };

  const nextPose = () => {
    setCurrentPose((prevPose) => {
      const newPose = getRandomPose(prevPose);
      speakPose(newPose, false, startCountdownAndInterval); // Speak new pose and start countdown after it finishes
      return newPose;
    });
  };

  // Function to stop/pause the timer
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current); // Clear the countdown interval
    }
    speechSynthesis.cancel(); // Stop any ongoing speech synthesis
    intervalRef.current = null;
    countdownRef.current = null;
    setIsPaused(true); // Mark as paused instead of resetting everything
    setIsRunning(false);
  };

  // Toggle function
  const toggleTimer = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
      setIsRunning(true);
    }
  };

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <div>
      <h1>Acro Pose Timer</h1>
      <p>Current Pose: {currentPose}</p>
      <p>Next pose in: {countdown} seconds</p>
      <button onClick={toggleTimer}>
        {isFirstStart ? "Let's Get Started" : (isRunning ? 'Pause' : isPaused ? 'Resume' : 'Play')}
      </button>
    </div>
  );
}

export default AcroPoseApp;
