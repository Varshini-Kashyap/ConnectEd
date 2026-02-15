# Confetti (heart celebration)

- **Utility:** `src/utils/confetti.js`  
  - `fireHeartConfetti(options)` – single burst with heart shapes and warm colors  
  - `fireHeartConfettiBurst()` – center + two side bursts (used on success)

- **Used in:**
  - **Student questionnaire** – `src/pages/StudentQuestionnaire.jsx`: after successful “Complete profile” submit, before redirect to stream selector.
  - **Alumni questionnaire** – `src/pages/AlumniQuestionnaire.jsx`: same (after successful profile completion).

Both call `fireHeartConfettiBurst()` once when the user finishes the 3-step profile setup successfully.
