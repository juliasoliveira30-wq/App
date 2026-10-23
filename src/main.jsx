import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import './camera.css';

function CameraCard() {
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function choosePhoto() {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const native = window.Capacitor?.isNativePlatform?.() ?? false;
      if (native) {
        let permissions = await Camera.checkPermissions();
        if (permissions.camera !== 'granted' || permissions.photos === 'denied') {
          permissions = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
        }
        if (permissions.camera !== 'granted' && permissions.photos !== 'granted' && permissions.photos !== 'limited') {
          setMessage('Permissão necessária. Ative câmera ou fotos nas configurações do aplicativo.');
          return;
        }

        const result = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Prompt,
          promptLabelHeader: 'Selecionar imagem',
          promptLabelPhoto: 'Escolher da galeria',
          promptLabelPicture: 'Tirar uma foto',
          promptLabelCancel: 'Cancelar',
        });
        setPhoto(result.webPath);
      } else {
        const result = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Prompt,
        });
        setPhoto(result.webPath);
      }
      setMessage('Imagem carregada com sucesso.');
    } catch (error) {
      const reason = String(error?.message || error).toLowerCase();
      if (reason.includes('cancel')) setMessage('Ação cancelada. Você pode tentar novamente.');
      else setMessage('Não foi possível abrir a câmera ou galeria. Tente novamente.');
      console.info('Seleção de imagem encerrada:', error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="camera-card" aria-labelledby="camera-title">
      <p className="camera-eyebrow">FOTO DE REFERÊNCIA</p>
      <h2 id="camera-title">Envie uma foto do seu olhar</h2>
      <p className="camera-intro">Tire uma foto agora ou escolha uma imagem da galeria do dispositivo.</p>
      <div className={`photo-preview ${photo ? 'has-photo' : ''}`}>
        {photo ? <img src={photo} alt="Prévia da imagem selecionada" /> : (
          <div className="empty-preview">
            <span className="camera-icon" aria-hidden="true">📷</span>
            <strong>Nenhuma imagem selecionada</strong>
            <span>Use o botão abaixo para começar</span>
          </div>
        )}
      </div>
      <button className="camera-button" type="button" onClick={choosePhoto} disabled={busy}>
        {busy ? 'Abrindo câmera…' : photo ? 'Tirar outra foto / Galeria' : 'Tirar Foto / Galeria'}
      </button>
      <p className="camera-message" role="status" aria-live="polite">{message}</p>
      <div className="camera-help">
        <span>COMO FUNCIONA</span>
        <p>Escolha tirar uma foto ou selecionar uma imagem. A prévia aparece aqui na tela.</p>
      </div>
    </section>
  );
}

createRoot(document.getElementById('camera-root')).render(<CameraCard />);
