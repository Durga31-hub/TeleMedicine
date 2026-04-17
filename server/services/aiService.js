const analyzeSymptoms = (symptoms) => {
  const input = symptoms.toLowerCase();
  
  // Default Response
  let result = {
    condition: "Undetermined / General Consultation",
    confidence: 0.55,
    severity: "Routine",
    advice: "Continue to video call for a professional examination. Keep track of any changes in your symptoms.",
    suggestedQuestions: ["Describe the pain in detail?", "Have you had this before?"],
    category: "General Medicine"
  };

  const categories = [
    {
      keywords: ['cough', 'throat', 'fever', 'cold', 'flu', 'congestion', 'breath'],
      condition: "Respiratory Infection / ILI",
      confidence: 0.88,
      severity: "Moderate",
      advice: "Stay hydrated and rest. Use a humidifier if available.",
      questions: ["Is the cough dry or productive?", "Any chest pain when breathing?"]
    },
    {
      keywords: ['headache', 'migraine', 'vision', 'light', 'dizzy', 'skull'],
      condition: "Neurological / Tension Type",
      confidence: 0.82,
      severity: "Moderate",
      advice: "Rest in a darkened room. Avoid screens and loud noises.",
      questions: ["Is the pain on one side?", "Any sensitivity to light?"]
    },
    {
      keywords: ['stomach', 'nausea', 'pain', 'vomit', 'diarrhea', 'belly', 'gut'],
      condition: "Gastrointestinal Distress",
      confidence: 0.75,
      severity: "Moderate",
      advice: "Follow the BRAT diet. Monitor for signs of dehydration.",
      questions: ["Where is the pain located?", "When was your last meal?"]
    },
    {
      keywords: ['chest', 'heart', 'tight', 'pressure', 'arm', 'jaw'],
      condition: "Cardiovascular Assessment Required",
      confidence: 0.92,
      severity: "Urgent",
      advice: "Sit down and rest. Prepare to discuss cardiac history with the doctor immediately.",
      questions: ["Does the pain radiate to your arm?", "Is there shortness of breath?"]
    },
    {
      keywords: ['back', 'spine', 'neck', 'joint', 'muscle', 'bone'],
      condition: "Musculoskeletal Strain",
      confidence: 0.78,
      severity: "Routine",
      advice: "Apply heat/cold packs. Avoid heavy lifting until examined.",
      questions: ["Was there a specific injury?", "Is there any numbness?"]
    },
    {
      keywords: ['skin', 'rash', 'itch', 'red', 'spot', 'bump'],
      condition: "Dermatological Condition",
      confidence: 0.85,
      severity: "Routine",
      advice: "Avoid scratching. Keep the area clean and dry.",
      questions: ["When did the rash appear?", "Have you used new products recently?"]
    },
    {
      keywords: ['anxiety', 'stress', 'panic', 'sleep', 'depressed', 'mood'],
      condition: "Psychosomatic / Mental Health",
      confidence: 0.80,
      severity: "Moderate",
      advice: "Practice deep breathing. Be open about your stressors during the call.",
      questions: ["How is your sleep pattern?", "Any recent major life changes?"]
    }
  ];

  // Try to find a match
  for (const cat of categories) {
    if (cat.keywords.some(kw => input.includes(kw))) {
      result = {
        condition: cat.condition,
        confidence: cat.confidence,
        severity: cat.severity,
        advice: cat.advice,
        suggestedQuestions: cat.questions,
        category: cat.condition
      };
      break;
    }
  }

  return {
    ...result,
    timestamp: new Date()
  };
};

module.exports = { analyzeSymptoms };
