import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { DeliveryPersonnel } from '../types';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface DeliveryMapProps {
  personnel: DeliveryPersonnel[];
}

export default function DeliveryMap({ personnel }: DeliveryMapProps) {
  if (!hasValidKey) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontFamily:'sans-serif', minHeight: '300px', backgroundColor: '#f9fafb'}}>
        <div style={{textAlign:'center',maxWidth:520}}>
          <h2>Google Maps API Key Required</h2>
          <p><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener">Get an API Key</a></p>
          <p><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
          <ul style={{textAlign:'left',lineHeight:'1.8'}}>
            <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
            <li>Select <strong>Secrets</strong></li>
            <li>Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
            <li>Paste your API key as the value, press <strong>Enter</strong></li>
          </ul>
          <p>The app rebuilds automatically after you add the secret.</p>
        </div>
      </div>
    );
  }

  // Accra, Ghana default center
  const defaultCenter = { lat: 5.6037, lng: -0.1870 };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={11}
          mapId="DELIVERY_FLEET_MAP"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{width: '100%', height: '100%'}}
        >
          {personnel.map(p => (
            p.currentLat && p.currentLng ? (
              <AdvancedMarker key={p.id} position={{ lat: p.currentLat, lng: p.currentLng }} title={`${p.name} - ${p.status}`}>
                <Pin background={p.status === 'available' ? '#16a34a' : p.status === 'delivering' ? '#eab308' : '#9ca3af'} glyphColor="#fff" />
              </AdvancedMarker>
            ) : null
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
