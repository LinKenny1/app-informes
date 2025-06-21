import { useState, useRef } from 'react'

function PhotoUploader({ onSave, onCancel }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [descripcion, setDescripcion] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      alert('Por favor selecciona un archivo de imagen válido.')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
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
      handleFileSelect(files[0])
    }
  }

  const handleSave = () => {
    if (selectedFile) {
      onSave(selectedFile, descripcion)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreview(null)
    setDescripcion('')
    onCancel()
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="photo-uploader">
      <div className="uploader-header">
        <h3>📷 Subir Foto</h3>
      </div>

      <div className="uploader-content">
        {!selectedFile ? (
          // Zona de selección/arrastre
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
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <p className="drop-zone-hint">
                Formatos soportados: JPG, PNG, GIF, WebP
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          // Preview de la imagen seleccionada
          <div className="image-preview">
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
            </div>
            
            <div className="file-info">
              <p><strong>Archivo:</strong> {selectedFile.name}</p>
              <p><strong>Tamaño:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>

            <div className="form-group">
              <label>Descripción (opcional)</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe esta imagen (ej: 'Vista general del sistema instalado', 'Detalle de cableado', etc.)"
                rows="3"
              />
            </div>

            <button 
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSelectedFile(null)
                setPreview(null)
              }}
            >
              Cambiar imagen
            </button>
          </div>
        )}
      </div>

      <div className="uploader-actions">
        <button className="btn btn-secondary" onClick={handleCancel}>
          Cancelar
        </button>
        {selectedFile && (
          <button className="btn btn-primary" onClick={handleSave}>
            Subir Foto
          </button>
        )}
      </div>
    </div>
  )
}

export default PhotoUploader