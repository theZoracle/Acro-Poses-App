// src/SetupScreen.js
import React, { useState } from 'react';

const levels = {
  1: [
    "Tabletop", "Lying Down Supine", "Frog", "Seated Forward Fold", "Child’s Pose",
    "Reclined Bound Angle Pose", "Happy Baby", "Bridge Pose", "Legs Up the Wall", "Cat-Cow"
  ],
  2: [
    "Bird", "Throne", "Folded Leaf", "Bow Pose", "Back Bend",
    "Supported Shoulder Stand", "Reverse Bird", "Side Star", "Reverse Side Star", "Jedi Plank"
  ],
  3: [
    "Straddle Bat", "Foot to Hand", "Foot to Shin", "Inside Side Star", "Outside Side Star",
    "Foot to Hand Extended", "Bow on Hands", "One-Legged King Pigeon Pose", "Whale Pose", "Crow Pose"
  ],
  4: [
    "Handstand", "Headstand", "Forearm Stand", "Scorpion Pose", "Hand to Foot Pose",
    "Chaturanga Dandasana", "Double Plank", "Twisted T", "Acro Star", "Tuck Planche"
  ]
};

const SetupScreen = ({ onSetupComplete }) => {
  const [selectedPoses, setSelectedPoses] = useState(new Set());
  const [interval, setInterval] = useState(5);
  const [levelSelections, setLevelSelections] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const togglePose = (pose) => {
    setSelectedPoses(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(pose)) {
        newSelected.delete(pose);
      } else {
        newSelected.add(pose);
      }
      return newSelected;
    });
  };

  const toggleLevel = (level) => {
    const newLevelSelections = { ...levelSelections };
    const currentLevelSelected = newLevelSelections[level];

    newLevelSelections[level] = !currentLevelSelected;

    const newSelected = new Set(selectedPoses); // Initialize newSelected here

    // Check/uncheck all poses in the level
    if (!currentLevelSelected) {
      levels[level].forEach(pose => newSelected.add(pose));
    } else {
      levels[level].forEach(pose => newSelected.delete(pose));
    }

    setSelectedPoses(newSelected);
    setLevelSelections(newLevelSelections);
  };

  const handleSubmit = () => {
    onSetupComplete(Array.from(selectedPoses), interval);
  };

  return (
    <div>
      <h1>Setup Your Acro Pose Timer</h1>
      <label>
        Time Interval (seconds):
        <input
          type="number"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          min="1"
        />
      </label>
      <h2>Select Poses</h2>
      {Object.entries(levels).map(([level, poses]) => (
        <div key={level}>
          <h3>
            <label>
              <input
                type="checkbox"
                checked={levelSelections[level]}
                onChange={() => toggleLevel(level)}
              />
              Level {level}
            </label>
          </h3>
          {poses.map(pose => (
            <label key={pose}>
              <input
                type="checkbox"
                checked={selectedPoses.has(pose)}
                onChange={() => togglePose(pose)}
              />
              {pose}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Start Timer</button>
    </div>
  );
};

export default SetupScreen;
