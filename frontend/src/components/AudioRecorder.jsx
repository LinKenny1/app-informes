import { useState, useRef } from 'react'

function AudioRecorder({ onSave, onCancel }) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [descripcion, setDescripcion] = useState('')
  
  const mediaRecorderRef = useRef(null)
  const timerRef = useRef(null)
  const audioChunksRef = useRef([])

  const startRecording = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser')
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Iniciar contador de tiempo
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error accediendo al micrófono:', error)
      alert('No se pudo acceder al micrófono. Verifica los permisos.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSave = () => {
    if (audioBlob) {
      onSave(audioBlob, descripcion)
    }
  }

  const handleCancel = () => {
    if (isRecording) {
      stopRecording()
    }
    setAudioBlob(null)
    setDescripcion('')
    setRecordingTime(0)
    onCancel()
  }

  return (
    <div className="audio-recorder">
      <div className="recorder-header">
        <h3>🎤 Grabar Nota de Voz</h3>
      </div>

      <div className="recorder-content">
        {!audioBlob ? (
          // Estado de grabación
          <div className="recording-section">
            <div className="recording-display">
              {isRecording ? (
                <div className="recording-active">
                  <div className="pulse-dot"></div>
                  <span>Grabando... {formatTime(recordingTime)}</span>
                </div>
              ) : (
                <div className="recording-idle">
                  <span>Presiona el botón para empezar a grabar</span>
                </div>
              )}
            </div>

            <div className="recording-controls">
              {!isRecording ? (
                <button className="btn btn-primary btn-record" onClick={startRecording}>
                  🎤 Iniciar Grabación
                </button>
              ) : (
                <button className="btn btn-secondary btn-record" onClick={stopRecording}>
                  ⏹️ Detener Grabación
                </button>
              )}
            </div>
          </div>
        ) : (
          // Estado de revisión
          <div className="review-section">
            <div className="audio-preview">
              <p>✅ Grabación completada ({formatTime(recordingTime)})</p>
              <audio controls src={URL.createObjectURL(audioBlob)} />
            </div>

            <div className="form-group">
              <label>Descripción (opcional)</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe brevemente el contenido de esta nota de voz..."
                rows="3"
              />
            </div>
          </div>
        )}
      </div>

      <div className="recorder-actions">
        <button className="btn btn-secondary" onClick={handleCancel}>
          Cancelar
        </button>
        {audioBlob && (
          <button className="btn btn-primary" onClick={handleSave}>
            Guardar Nota de Voz
          </button>
        )}
      </div>
    </div>
  )
}

export default AudioRecorder