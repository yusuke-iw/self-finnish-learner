exports.synthesize = async (req, res) => {
  const { text, speed } = req.body;
  const apiKey = process.env.GOOGLE_TTS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'Google TTS API key not configured on server.' });
  }

  if (!text) {
    return res.status(400).json({ success: false, error: 'Text is required.' });
  }

  try {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'fi-FI', name: 'fi-FI-Wavenet-A' },
        audioConfig: { audioEncoding: 'MP3', speakingRate: speed || 1.0 }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google TTS Error:', data);
      return res.status(500).json({ success: false, error: data.error?.message || 'Failed to synthesize speech' });
    }

    // data.audioContent is a base64 encoded string containing the MP3
    res.json({ success: true, audioContent: data.audioContent });
  } catch (err) {
    console.error('Error fetching from Google TTS API:', err);
    res.status(500).json({ success: false, error: 'Internal server error while fetching TTS' });
  }
};

