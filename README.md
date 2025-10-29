# DevFinance

Aplicación React + Vite para registrar ingresos y gastos, con autenticación Firebase, sincronización en Firestore, gráficos con Chart.js y modo oscuro.

▶ Live demo: https://devfinance-985ee.web.app/

## Características

- Balance y tabla de transacciones con filtros por fecha/categoría.
- Gráficos de balance y por categoría (Chart.js).
- Autenticación con Firebase Auth y datos por usuario en Firestore.
- PWA básico: manifest e iconos listos para Firebase Hosting.

## Stack

- React + Vite
- Firebase (Auth, Firestore)
- Chart.js

## Requisitos

- Node.js 18+ (recomendado 20)
- Una cuenta de Firebase con un proyecto configurado (Auth + Firestore)

## Configuración

1) Copia el archivo `.env.example` a `.env` y completa los valores:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

2) Instala dependencias:

```
npm ci
```

3) Desarrollo:

```
npm run dev
```

## Despliegue a Firebase Hosting

Este repositorio incluye `firebase.json`. Asegúrate de tener la CLI de Firebase instalada y autenticada.

```
firebase login
firebase use <tu-proyecto>
firebase deploy --only hosting,firestore:rules
```

Las reglas de Firestore se encuentran en `firestore.rules` y restringen el acceso a `users/{uid}/transactions` al propio usuario.

## CI

Se incluye un workflow de GitHub Actions (`.github/workflows/ci.yml`) que ejecuta lint y build en cada push/PR a `main`/`master`.

## Notas

- Edición rápida de transacciones disponible desde la tabla (icono de lápiz).
- Entrada de montos acepta coma o punto como separador decimal.
- La imagen social (`public/og-image.png`) se usa en Open Graph/Twitter.
