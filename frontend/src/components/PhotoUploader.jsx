import { useState, useRef } from 'react'

function PhotoUploader({ onSave, onCancel }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [descripcion, setDescripcion] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const handleFilesSelect = (files) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert('Por favor selecciona archivos de imagen válidos.')
      return
    }

    const newFiles = imageFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      preview: null
    }))

    // Crear previews
    newFiles.forEach(fileObj => {
      const reader = new FileReader()
      reader.onload = (e) => {
        fileObj.preview = e.target.result
        setSelectedFiles(prev => [...prev.filter(f => f.id !== fileObj.id), fileObj])
      }
      reader.readAsDataURL(fileObj.file)
    })

    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const handleFileChange = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFilesSelect(files)
    }
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFilesSelect(files)
    }
  }

  const startCamera = async () => {
    try {
      console.log('Starting camera...')
      
      // Try with back camera first, fallback to any camera
      let stream;
      try {
        console.log('Trying back camera...')
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }
        })
        console.log('Back camera stream obtained:', stream)
      } catch (backCameraError) {
        console.log('Back camera not available, trying any camera...', backCameraError)
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true
        })
        console.log('Any camera stream obtained:', stream)
      }
      
      setCameraStream(stream)
      setShowCamera(true)
      
      // Wait for video element to be rendered, then assign stream
      setTimeout(() => {
        if (videoRef.current && stream) {
          console.log('Assigning stream to video element...')
          videoRef.current.srcObject = stream
          
          // Force video to play
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, playing...')
            videoRef.current.play().catch(e => {
              console.error('Error playing video:', e)
            })
          }
        } else {
          console.error('Video ref or stream not available:', { 
            videoRef: videoRef.current, 
            stream 
          })
        }
      }, 100)
      
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
  }

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      
      canvas.toBlob(blob => {
        const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
        handleFilesSelect([file])
        stopCamera()
      }, 'image/jpeg', 0.8)
    }
  }

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleSave = async () => {
    if (selectedFiles.length === 0) return
    
    setUploading(true)
    try {
      for (const fileObj of selectedFiles) {
        await onSave(fileObj.file, descripcion)
      }
      handleCancel()
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFiles([])
    setDescripcion('')
    stopCamera()
    onCancel()
  }

  const openFileDialog = () => {
    // Reset the input value so the same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  return (
    <div className="photo-uploader">
      <div className="uploader-header">
        <h3>📷 Subir Fotos</h3>
      </div>

      <div className="uploader-content">
        {showCamera ? (
          // Vista de cámara
          <div className="camera-view">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="camera-video"
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                backgroundColor: '#000',
                borderRadius: '8px'
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <div className="camera-controls">
              <button className="btn btn-primary" onClick={takePhoto}>
                📸 Tomar Foto
              </button>
              <button className="btn btn-secondary" onClick={stopCamera}>
                Cancelar
              </button>
            </div>
          </div>
        ) : selectedFiles.length === 0 ? (
          // Zona de selección/arrastre
          <div className="upload-options">
            <div 
              className={`drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <div className="drop-zone-content">
                <div className="drop-zone-icon">📷</div>
                <p className="drop-zone-text">
                  Arrastra imágenes aquí o haz clic para seleccionar
                </p>
                <p className="drop-zone-hint">
                  Formatos soportados: JPG, PNG, GIF, WebP<br/>
                  Puedes seleccionar múltiples archivos
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="upload-separator">
              <span>o</span>
            </div>

            <div className="camera-option">
              <button className="btn btn-outline" onClick={startCamera}>
                📸 Usar Cámara
              </button>
              <p className="camera-hint">
                Asegúrate de permitir el acceso a la cámara cuando tu navegador lo solicite
              </p>
            </div>
          </div>
        ) : (
          // Preview de las imágenes seleccionadas
          <div className="images-preview">
            <div className="preview-grid">
              {selectedFiles.map(fileObj => (
                <div key={fileObj.id} className="preview-item">
                  {fileObj.preview && (
                    <div className="preview-container">
                      <img src={fileObj.preview} alt="Preview" className="preview-image" />
                      <button 
                        className="remove-btn"
                        onClick={() => removeFile(fileObj.id)}
                        title="Eliminar imagen"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="file-info">
                    <p className="file-name">{fileObj.file.name}</p>
                    <p className="file-size">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Descripción para todas las fotos (opcional)</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe estas imágenes (ej: 'Instalación completa del sistema', 'Detalles de conexiones', etc.)"
                rows="3"
              />
            </div>

            <div className="add-more-section">
              <button className="btn btn-outline btn-sm" onClick={openFileDialog}>
                ➕ Agregar más fotos
              </button>
              <button className="btn btn-outline btn-sm" onClick={startCamera}>
                📸 Tomar otra foto
              </button>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="additional-files"
              />
            </div>
          </div>
        )}
      </div>

      <div className="uploader-actions">
        <button className="btn btn-secondary" onClick={handleCancel}>
          Cancelar
        </button>
        {selectedFiles.length > 0 && (
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={uploading}
          >
            {uploading ? 'Subiendo...' : `Subir ${selectedFiles.length} foto${selectedFiles.length > 1 ? 's' : ''}`}
          </button>
        )}
      </div>
    </div>
  )
}

export default PhotoUploader