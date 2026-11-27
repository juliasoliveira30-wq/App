import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { supabase } from './services/supabase.js';
import './camera.css';

const native = Capacitor.isNativePlatform();
const imageExtensions = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/gif', 'gif'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

async function uploadPhoto({ webPath, format }) {
  if (!supabase) {
    throw new Error('Preencha a URL e a chave publicável do Supabase em .env.local.');
  }

  const response = await fetch(webPath);
  if (!response.ok) throw new Error('Não foi possível ler o arquivo da câmera.');

  const blob = await response.blob();
  if (!blob.size) throw new Error('O arquivo da câmera está vazio.');
  if (blob.size > 6 * 1024 * 1024) throw new Error('Escolha uma imagem de até 6 MB.');

  const contentType = blob.type.startsWith('image/') ? blob.type : `image/${format}`;
  const extension = imageExtensions.get(contentType);
  if (!extension) throw new Error('Escolha uma imagem JPEG, PNG, GIF, WebP ou AVIF.');

  const bucket = supabase.storage.from('fotos-camera');
  const path = `${crypto.randomUUID()}.${extension}`;
  const file = new File([blob], path, { type: contentType });
  const { data, error } = await bucket.upload(path, file, { upsert: false });
  if (error) throw error;

  return bucket.getPublicUrl(data.path).data.publicUrl;
}

function CameraCard() {
  const [localUrl, setLocalUrl] = useState(null);
  const [publicUrl, setPublicUrl] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [message, setMessage] = useState('');
  const busy = phase !== 'idle';

  useEffect(() => {
    return () => {
      if (localUrl?.startsWith('blob:')) URL.revokeObjectURL(localUrl);
    };
  }, [localUrl]);

  async function choosePhoto(source) {
    if (busy) return;
    setPhase('camera');
    setMessage('');

    let result;
    try {
      if (native) {
        let permissions = await Camera.checkPermissions();
        if (permissions.camera !== 'granted' || permissions.photos === 'denied') {
          permissions = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
        }
        if (permissions.camera !== 'granted' && permissions.photos !== 'granted' && permissions.photos !== 'limited') {
          setMessage('Permissão necessária. Ative câmera ou fotos nas configurações do aplicativo.');
          setPhase('idle');
          return;
        }
      }

      result = await Camera.getPhoto({
        quality: 90,
        width: 1600,
        height: 1600,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source,
        promptLabelHeader: 'Selecionar imagem',
        promptLabelPhoto: 'Escolher da galeria',
        promptLabelPicture: 'Tirar uma foto',
        promptLabelCancel: 'Cancelar',
      });
      if (!result.webPath) throw new Error('Caminho da imagem indisponível.');
    } catch (error) {
      const reason = String(error?.message || error).toLowerCase();
      setMessage(reason.includes('cancel')
        ? 'Ação cancelada. Você pode tentar novamente.'
        : 'Não foi possível abrir a câmera ou galeria. Tente novamente.');
      setPhase('idle');
      return;
    }

    setLocalUrl(result.webPath);
    setPublicUrl(null);
    setPhase('upload');
    setMessage('Enviando imagem ao Supabase…');

    try {
      setPublicUrl(await uploadPhoto(result));
      setMessage('Imagem enviada ao Supabase.');
    } catch (error) {
      setMessage(`Falha no envio. ${error.message || 'Tente selecionar a imagem novamente.'}`);
    } finally {
      setPhase('idle');
    }
  }

  function handleImageError() {
    if (!publicUrl) return;
    setPublicUrl(null);
    setMessage('A foto foi enviada, mas o link público falhou. Verifique se o bucket está público.');
  }

  const photo = publicUrl ?? localUrl;

  return (
    <section className="camera-card" aria-labelledby="camera-title">
      <p className="camera-eyebrow">FOTO DE REFERÊNCIA</p>
      <h2 id="camera-title">Envie uma foto do seu olhar</h2>
      <p className="camera-intro">
        Tire uma foto ou escolha uma imagem. O aplicativo enviará a foto automaticamente e ela poderá ser aberta por qualquer pessoa com o link.
      </p>
      <div className={`photo-preview ${photo ? 'has-photo' : ''}`}>
        {photo ? <img src={photo} alt="Prévia da imagem selecionada" onError={handleImageError} /> : (
          <div className="empty-preview">
            <span className="camera-icon" aria-hidden="true">📷</span>
            <strong>Nenhuma imagem selecionada</strong>
            <span>Use o botão abaixo para começar</span>
          </div>
        )}
      </div>
      <button className="camera-button" type="button" onClick={() => choosePhoto(native ? CameraSource.Prompt : CameraSource.Camera)} disabled={busy}>
        {phase === 'camera' ? 'Abrindo câmera ou galeria…' : phase === 'upload' ? 'Enviando imagem…' : native ? 'Tirar foto ou escolher da galeria' : 'Tirar foto'}
      </button>
      {!native && (
        <button className="camera-button" type="button" onClick={() => choosePhoto(CameraSource.Photos)} disabled={busy}>
          Escolher da galeria
        </button>
      )}
      <p className="camera-message" role="status" aria-live="polite">{message}</p>
    </section>
  );
}

async function start() {
  if (!native) {
    const { defineCustomElements } = await import('@ionic/pwa-elements/loader');
    await defineCustomElements(window);
  }

  createRoot(document.getElementById('camera-root')).render(<CameraCard />);
}

start();
