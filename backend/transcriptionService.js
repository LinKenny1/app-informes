const { AssemblyAI } = require('assemblyai');
const path = require('path');

class TranscriptionService {
  constructor() {
    this.client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY || "25aea4d8b8884d298f9612d0697a5289",
    });
  }

  async transcribeAudio(audioFilePath) {
    try {
      // Convert local file path to full path
      const fullPath = path.resolve(audioFilePath);
      
      const params = {
        audio: fullPath,
        speech_model: "universal",
        language_code: "es", // Spanish language
      };

      console.log(`Starting transcription for: ${fullPath}`);
      const transcript = await this.client.transcripts.transcribe(params);
      
      if (transcript.status === 'error') {
        throw new Error(transcript.error);
      }

      return {
        success: true,
        text: transcript.text,
        confidence: transcript.confidence,
        audio_duration: transcript.audio_duration
      };
    } catch (error) {
      console.error('Transcription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTranscriptionStatus(transcriptId) {
    try {
      const transcript = await this.client.transcripts.get(transcriptId);
      return {
        status: transcript.status,
        text: transcript.text,
        confidence: transcript.confidence
      };
    } catch (error) {
      console.error('Error getting transcription status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = TranscriptionService;