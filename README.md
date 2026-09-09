Asistente personal multimodal
JOI es un proyecto de asistente personal diseñado para combinar conversación, memoria, personalidad, APIs y expresión multimodal mediante una arquitectura modular.
El repositorio contiene actualmente el backend Node.js, la aplicación Flutter y los recursos audiovisuales del avatar.
> **Estado:** base inicial del proyecto organizada y subida al repositorio. La arquitectura continúa en desarrollo.
---
1. Arquitectura general
El flujo conceptual de JOI es:
```text
USUARIO
  ↓
INPUT HANDLER
  ↓
AUTH / USER ID
  ↓
SUBSCRIPTION / ENTITLEMENT
  ↓
FREE / PREMIUM
  ↓
INPUT ANALYZER
  ↓
ORCHESTRATOR CORE
  ↓
PROTOCOLO CONTEXTO
  ↓
MEMORY RETRIEVAL
  ↓
LLM / MODEL
  ↓
CAPA DE EXPRESIÓN
  ↓
REACTION ENGINE
  ↓
VIDEO SELECTOR
  ↓
VIDEO CONTAINER
  ↓
MEMORY EVALUATOR
  ↓
MEMORY ROUTER
  ↓
MEMORY STORAGE
  ↓
RESPONSE BUILDER
  ↓
FLUTTER
```
El orquestador coordina los módulos. No debe convertirse en un lugar donde se concentren todas las responsabilidades del sistema.
---
2. Estructura del repositorio
```text
proyecto_JOI/
│
├── avatar/
│   ├── galeria/
│   ├── logo/
│   └── BETA_LITE.md
│
├── backend/
│   ├── api/
│   ├── auth/
│   ├── baseDatos/
│   ├── comportamiento/
│   ├── data/
│   ├── ejes_dinamicos/
│   ├── estado/
│   ├── identidad/
│   ├── intensidad/
│   ├── interno/
│   ├── legal/
│   ├── memoria/
│   ├── modulos/
│   ├── motor/
│   ├── nucleo_psicologico/
│   ├── orquestador/
│   ├── rutas/
│   ├── seguridad/
│   ├── sesiones/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── flutter/
│   ├── joi_app.dart
│   ├── joi_app_bp.dart
│   ├── main.dart
│   └── pubspect.dart
│
├── LOGGS/
│
└── NUCLEO_JOI.md
```
`node_modules/` existe únicamente en el entorno local de desarrollo y está excluido del repositorio mediante `.gitignore`.
---
3. Backend
API
Contiene las integraciones y servicios externos:
calendario
clima
hora
Mercado Pago
noticias
notificaciones
reloj
Auth
Módulos relacionados con autenticación:
`googleAuth.js`
`login.js`
Comportamiento
Define componentes de comportamiento conversacional:
iniciativa conversacional
micro comportamiento
micro reacciones
personalidad
ritmo conversacional
interacción completa de JOI
Estado
Gestiona componentes del estado interno:
emociones
micro emociones
presencia emocional
memoria afectiva
Identidad
Contiene los componentes que definen la identidad del personaje:
identidad base
voz del personaje
gustos personales
relación con el usuario
contexto existencial
rasgos idiosincráticos
vida fuera de la conversación
Intensidad
Regula la intensidad expresiva:
detector de intensidad
regulador de intensidad
Interno
Contiene componentes relacionados con el mundo interno y la vida cotidiana de JOI.
Legal
Contiene:
política de privacidad
términos y condiciones
Núcleo psicológico
Contiene las reglas y estructuras centrales del comportamiento psicológico de JOI:
inmutabilidad
leyes de JOI
mapa de estados
núcleo psicológico
Seguridad
Incluye:
anti prompt injection
auditoría
control de usuarios
límites de usuario
política de JOI
---
4. Sistema de memoria
La memoria es uno de los componentes centrales de JOI.
La arquitectura contempla diferentes niveles y responsabilidades.
```text
Entrada
 ↓
memoriaOrquestador
 ├── registrarActividad
 ├── historialConversacion
 ├── memoriaCorta
 ├── memoriaSelectiva
 ├── memoriaPersistente
 ├── recuerdosImportantes
 └── datosUsuario
        ↓
Contexto para JOI
        ↓
writeBackEngine
```
`memoriaOrquestador`
Su responsabilidad conceptual es determinar qué información necesita JOI para trabajar con el contexto actual.
`writeBackEngine`
Actúa después de la interacción.
Su responsabilidad es evaluar el contenido de la conversación y decidir qué información merece convertirse en memoria permanente.
Conceptualmente:
```text
memoriaOrquestador
→ "Esto es lo que JOI necesita recordar AHORA."

writeBackEngine
→ "Esto es lo que JOI debería recordar DESPUÉS."
```
`writeBackEngine` no debe confundirse con el constructor completo del contexto del LLM.
---
5. Orquestador
El orquestador coordina el flujo principal de conversación.
```text
Orquestador
  ├── verifica usuario / suscripción
  ├── protocolo de contexto
  ├── selección de modelo
  ├── LLM
  ├── capa de expresión
  └── selector de video
```
Orquestadores principales
`orquestadorChat.js`
`orquestadorNotificaciones.js`
El orquestador de chat coordina la interacción conversacional.
El orquestador de notificaciones mantiene su responsabilidad separada.
---
6. Suscripciones
La arquitectura contempla dos niveles de experiencia:
FREE
Incluye la experiencia gratuita de conversación y las APIs correspondientes al nivel gratuito.
PREMIUM
La suscripción mensual habilita funcionalidades adicionales de la experiencia de JOI, incluida la interacción erótica definida para el producto.
La comprobación de suscripción forma parte del flujo del orquestador y debe producirse antes de seleccionar el comportamiento/modelo correspondiente.
---
7. Capa de expresión
La capa de expresión es responsable de transformar la respuesta generada por el LLM en una respuesta coherente con la identidad y personalidad de JOI.
No sustituye al LLM.
El LLM genera el contenido.
La capa de expresión determina cómo lo expresa JOI.
La organización lógica definida para este módulo es:
```text
moduloExpresion/
├── identidad/
├── comportamiento/
├── estado/
├── intensidad/
├── motor/
└── expressionEngine.js
```
`expressionEngine.js` permanece como componente pendiente de completar en la arquitectura actual.
---
8. Reacciones y vídeo
La arquitectura contempla una cadena específica para la expresión visual:
```text
LLM
 ↓
CAPA DE EXPRESIÓN
 ↓
REACTION ENGINE
 ↓
VIDEO SELECTOR
 ↓
VIDEO CONTAINER
```
El selector de vídeo debe recibir la etiqueta de reacción correspondiente y seleccionar el clip asociado dentro de la galería del avatar.
La estructura prevista es:
```text
backend/
└── orquestador/
    └── selectorDeVideo/
        └── selectorDeVideo.js
```
Este módulo está definido como componente de la arquitectura y continúa pendiente de implementación/integración.
---
9. Avatar
Los recursos audiovisuales se encuentran en:
```text
avatar/
├── galeria/
├── logo/
└── BETA_LITE.md
```
La galería contiene los clips asociados a diferentes estados y reacciones de JOI.
Los recursos del avatar forman parte del proyecto y deben mantenerse sincronizados con las etiquetas utilizadas por el motor de reacciones y el selector de vídeo.
---
10. Flutter
La aplicación cliente se encuentra en:
```text
flutter/
```
Actualmente contiene la base de la aplicación Flutter y sus archivos principales.
La interfaz móvil será la capa que presente al usuario la experiencia generada por el backend.
La migración y evolución de la aplicación continúa en desarrollo.
---
11. NÚCLEO JOI
`NUCLEO_JOI.md` contiene la documentación del núcleo conceptual del personaje y forma parte de la documentación base del proyecto.
Antes de modificar reglas fundamentales de JOI, debe revisarse este documento y mantenerse la coherencia con el resto de módulos.
---
12. Estado del proyecto
La base inicial ya está organizada en el repositorio.
Disponible
Backend modular
Sistema de memoria
Componentes de identidad
Componentes de comportamiento
Componentes de estado
Componentes de intensidad
Núcleo psicológico
Seguridad
APIs
Recursos del avatar
Base Flutter
Documentación del núcleo
En desarrollo / integración
Protocolo de contexto
Capa de expresión
`expressionEngine.js`
Reaction Engine
Selector de vídeo
Integración completa backend ↔ Flutter
Evolución de la experiencia FREE/PREMIUM
---
13. Reglas de trabajo
Para mantener la integridad del proyecto:
No cambiar nombres de archivos, módulos o dependencias sin una razón técnica.
No eliminar código simplemente porque una parte todavía esté incompleta.
No duplicar responsabilidades entre módulos.
Mantener separadas las responsabilidades del orquestador.
Actualizar los `require`/`import` cuando un archivo cambie de ubicación.
No subir `node_modules/`.
No almacenar claves API, contraseñas, tokens ni credenciales en Git.
Documentar cambios estructurales importantes.
Antes de modificar una pieza central, comprobar sus dependencias y consumidores.
---
14. Flujo de desarrollo
El repositorio utiliza actualmente la rama:
```text
principal
```
Para trabajo colaborativo se recomienda trabajar mediante ramas de funcionalidad y fusionar los cambios revisados hacia `principal`.
Ejemplo:
```text
principal
   │
   ├── feature/memoria
   ├── feature/flutter
   ├── feature/orquestador
   └── fix/selector-video
```
La estrategia definitiva de ramas puede establecerse antes de comenzar el trabajo simultáneo de los cuatro desarrolladores.
---
15. Objetivo
JOI busca convertirse en un asistente personal multimodal con:
conversación
memoria persistente
personalidad
estado emocional
APIs
expresión audiovisual
adaptación al usuario
experiencias diferenciadas según suscripción
La arquitectura está diseñada para permitir que estos componentes evolucionen de forma modular sin convertir el orquestador en un monolito.
---
16. Equipo
El proyecto está preparado para trabajo colaborativo.
Antes de comenzar a modificar módulos centrales, cada colaborador debería revisar:
`NUCLEO_JOI.md`
este `README.md`
la estructura de `backend/`
el flujo del orquestador
el sistema de memoria
---
Licencia
La licencia del proyecto todavía no está definida en este repositorio.
